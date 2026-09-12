/**
 * Write-only ingest for folio-ai prompt-log exchanges.
 *
 * Called server-to-server by the portfolio app (see lib/db.js there), not by
 * a browser — auth is a shared secret header, not the cookie-session used by
 * the rest of admin. Network topology (ClusterIP-only, no public route) is
 * still the primary boundary; this is defense-in-depth, same philosophy as
 * the admin login (see server.js).
 */

const express = require('express');
const { getDb } = require('../db');

const router = express.Router();

function requireIngestSecret(req, res, next) {
  const secret = req.get('x-ingest-secret');
  if (!secret || secret !== process.env.INGEST_SHARED_SECRET) {
    return res.status(401).json({ error: 'unauthorised' });
  }
  next();
}

router.use(requireIngestSecret);

// POST /api/ingest/ai-logs
router.post('/ai-logs', (req, res) => {
  try {
    const { ipHash, userMessages, aiReply, remainingQuota, error } = req.body ?? {};
    getDb().prepare(`
      INSERT INTO ai_prompt_logs (ts, ip_hash, user_messages, ai_reply, remaining_quota, error)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(Date.now(), ipHash ?? null, JSON.stringify(userMessages ?? []), aiReply, remainingQuota ?? null, error ?? null);
    res.status(204).end();
  } catch (err) {
    console.error('[admin/ingest/ai-logs]', err.message);
    res.status(500).json({ error: 'write failed' });
  }
});

module.exports = router;
