/**
 * Folio-ai prompt logs — POSTed to the admin service's write-only ingest
 * API instead of a local SQLite file, so this app stays stateless and can
 * run replicas on any host.
 * (Click heatmaps are handled by Umami's session replay/heatmap feature.)
 *
 * Env vars:
 *   ADMIN_INGEST_URL      → base URL of the admin service (e.g. http://portfolio-admin:9000)
 *   INGEST_SHARED_SECRET  → shared secret, sent as X-Ingest-Secret
 *   IP_HASH_SALT          → random string; IPs are only ever sent as sha256(ip + salt),
 *                           the raw IP never leaves this process
 *
 * Fire-and-forget by design (matches the previous local-write behaviour) —
 * callers don't await this, so a slow/down admin never blocks a response.
 */

import crypto from 'crypto';

const ADMIN_INGEST_URL = process.env.ADMIN_INGEST_URL;
const INGEST_SHARED_SECRET = process.env.INGEST_SHARED_SECRET;

export function hashIp(ip) {
  const salt = process.env.IP_HASH_SALT ?? '';
  return crypto.createHash('sha256').update(`${ip}${salt}`).digest('hex');
}

export function logAiExchange({ ip, userMessages, aiReply, remainingQuota, error }) {
  if (!ADMIN_INGEST_URL) return; // not configured (e.g. local dev without admin running)
  fetch(`${ADMIN_INGEST_URL}/api/ingest/ai-logs`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-ingest-secret': INGEST_SHARED_SECRET ?? '',
    },
    body: JSON.stringify({
      ipHash: hashIp(ip),
      userMessages,
      aiReply,
      remainingQuota: remainingQuota ?? null,
      error: error ?? null,
    }),
  }).catch((err) => console.error('[folio-ai] failed to log exchange:', err.message));
}
