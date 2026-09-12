/**
 * SQLite storage for folio-ai prompt logs.
 *
 * admin is the sole owner and writer of this file — the main app has no
 * direct DB access and POSTs exchanges here instead (see routes/ingest.js),
 * so it stays stateless and can run replicas on any host.
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'portfolio.sqlite');

let db = null;

function ensureSchema(handle) {
  handle.pragma('journal_mode = WAL');
  handle.exec(`
    CREATE TABLE IF NOT EXISTS ai_prompt_logs (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      ts              INTEGER NOT NULL,
      ip_hash         TEXT,
      user_messages   TEXT NOT NULL,
      ai_reply        TEXT NOT NULL,
      remaining_quota INTEGER,
      error           TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_ai_prompt_logs_ts ON ai_prompt_logs(ts);
  `);
}

function getDb() {
  if (!db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    ensureSchema(db);
  }
  return db;
}

// Used by the import route (routes/dbfile.js) before swapping the file out
// from under the open handle, and to force a clean reopen afterwards.
function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDb, closeDb, DB_PATH };
