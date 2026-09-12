/**
 * Export/import the whole SQLite file, to move data between deployments
 * (e.g. the old manually-deployed instance -> a new one) without a real
 * migration. Both routes require the normal cookie-session admin login.
 */

const fs = require('fs');
const express = require('express');
const { getDb, closeDb, DB_PATH } = require('../db');

const router = express.Router();

const SQLITE_MAGIC = 'SQLite format 3\0';

// GET /api/db — download the current DB file
router.get('/', (req, res) => {
  try {
    const db = getDb();
    // WAL mode keeps recent writes in a separate -wal file; checkpoint first
    // so the exported file is a complete, consistent snapshot on its own.
    db.pragma('wal_checkpoint(TRUNCATE)');
    res.download(DB_PATH, 'portfolio.sqlite');
  } catch (err) {
    console.error('[admin/db export]', err.message);
    res.status(500).json({ error: 'export failed' });
  }
});

// POST /api/db — replace the current DB file with an uploaded one
router.post('/', express.raw({ type: 'application/octet-stream', limit: '200mb' }), (req, res) => {
  try {
    const upload = req.body;
    if (!Buffer.isBuffer(upload) || upload.length === 0) {
      return res.status(400).json({ error: 'no file uploaded' });
    }
    if (upload.subarray(0, 16).toString('utf8') !== SQLITE_MAGIC) {
      return res.status(400).json({ error: 'not a SQLite file' });
    }

    closeDb();
    // Stale sidecar files from whatever was here before would otherwise get
    // replayed against the new file's contents.
    for (const ext of ['-wal', '-shm']) {
      fs.rmSync(DB_PATH + ext, { force: true });
    }
    fs.writeFileSync(DB_PATH, upload);
    getDb(); // reopen + ensure schema on the imported file

    res.status(204).end();
  } catch (err) {
    console.error('[admin/db import]', err.message);
    res.status(500).json({ error: 'import failed' });
  }
});

module.exports = router;
