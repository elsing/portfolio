/**
 * portfolio-admin — internal-only admin panel.
 *
 * SECURITY MODEL: the real boundary is network topology — this service is
 * never attached to the traefik_proxy Docker network and its port is bound
 * only to the homelab-internal interface (see docker-compose). The password
 * login below is defense-in-depth, not the primary control.
 *
 * Env vars:
 *   ADMIN_PASSWORD       → shared password (required)
 *   SESSION_SECRET       → cookie-signing secret (required)
 *   INGEST_SHARED_SECRET → shared secret for portfolio's write-only /api/ingest calls (required)
 *   ADMIN_PORT           → listen port (default 9000)
 *   DB_PATH              → sqlite file (default ../data/portfolio.sqlite)
 */

const path          = require('path');
const express       = require('express');
const cookieSession = require('cookie-session');

const authRoutes   = require('./routes/auth');
const logsRoutes   = require('./routes/logs');
const statsRoutes  = require('./routes/stats');
const ingestRoutes = require('./routes/ingest');
const dbFileRoutes = require('./routes/dbfile');

const { ADMIN_PASSWORD, SESSION_SECRET, INGEST_SHARED_SECRET } = process.env;
if (!ADMIN_PASSWORD || !SESSION_SECRET || !INGEST_SHARED_SECRET) {
  console.error('[admin] ADMIN_PASSWORD, SESSION_SECRET and INGEST_SHARED_SECRET must be set — refusing to start');
  process.exit(1);
}

const app = express();
app.disable('x-powered-by');

app.use(express.json());
app.use(cookieSession({
  name:     'admin_session',
  secret:   SESSION_SECRET,
  httpOnly: true,
  sameSite: 'lax',
  maxAge:   12 * 60 * 60 * 1000, // 12h
}));

// ── Auth gate ────────────────────────────────────────────────
function requireAuth(req, res, next) {
  if (req.session?.authed) return next();
  if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'unauthorised' });
  return res.redirect('/login.html');
}

// Login/logout, the login page, and its stylesheet are the only
// unauthenticated surfaces
app.use('/', authRoutes);
app.get('/login.html', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/admin.css', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'admin.css')));

// Server-to-server writes from the portfolio app — own shared-secret auth
// (see routes/ingest.js), not the cookie-session gate below.
app.use('/api/ingest', ingestRoutes);

app.use(requireAuth);

// ── Authenticated routes ─────────────────────────────────────
app.use('/api/logs',   logsRoutes);
app.use('/api/stats',  statsRoutes);
app.use('/api/db',     dbFileRoutes);
app.use(express.static(path.join(__dirname, 'public')));

const port = parseInt(process.env.ADMIN_PORT ?? '9000', 10);
app.listen(port, () => console.log(`[admin] listening on :${port}`));
