import './bootstrap.js';

function req(name, fallback = '') {
  const v = process.env[name];
  return v === undefined || v === '' ? fallback : v;
}

/** Positive integer from env; bad/empty values → `def`. Prevents NaN → JWT `expiresIn: 'NaNm'` and login 500s. */
function envPositiveInt(name, def, min, max) {
  const raw = process.env[name];
  if (raw === undefined || raw === null || String(raw).trim() === '') return def;
  const n = parseInt(String(raw).trim(), 10);
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, n));
}

function stripTrailingSlash(url) {
  const s = String(url || '').trim();
  if (!s) return 'http://localhost:8080';
  return s.replace(/\/+$/, '');
}

/**
 * Normalized Express mount path (leading slash, no trailing slash).
 * Accepts `/api/v1`, `api/v1`, or a full URL like `http://localhost:4000/api/v1` (pathname only).
 * If someone sets `API_PREFIX=/api/v1/root`, the `/root` segment is stripped so routes mount at `/api/v1/...`.
 */
export function getApiPrefix() {
  let raw = (process.env.API_PREFIX ?? '/api/v1').toString().trim();
  if (!raw) return '/api/v1';
  if (/^https?:\/\//i.test(raw)) {
    try {
      raw = new URL(raw).pathname || '/api/v1';
    } catch {
      return '/api/v1';
    }
  }
  let p = raw.replace(/\/+$/, '');
  if (!p.startsWith('/')) p = `/${p}`;
  if (p.endsWith('/root')) {
    p = p.slice(0, -'/root'.length);
  }
  if (!p || p === '/') return '/api/v1';
  return p;
}

/**
 * Read Mongo connection from env (not a one-time snapshot).
 * MONGODB_URI (preferred), MONGO_URL, or DATABASE_URL when it starts with mongodb.
 */
export function getMongoConnectionString() {
  const m = (process.env.MONGODB_URI || '').trim();
  if (m) return m;
  const fromMongoUrlEnv = (process.env.MONGO_URL || '').trim();
  if (fromMongoUrlEnv.startsWith('mongodb')) return fromMongoUrlEnv;
  const d = (process.env.DATABASE_URL || '').trim();
  if (d.startsWith('mongodb')) return d;
  if (d && !d.startsWith('mongodb')) {
    console.warn(
      '[config] DATABASE_URL is not MongoDB (e.g. Postgres). Set MONGODB_URI to your Atlas mongodb+srv://... in backend/.env.'
    );
  }
  return '';
}

export const config = {
  nodeEnv: req('NODE_ENV', 'development'),
  port: envPositiveInt('PORT', 4000, 1, 65535),
  /** Prefer `getApiPrefix()` for mounts; this mirrors env for logging. */
  get apiPrefix() {
    return getApiPrefix();
  },
  /** Resolved on each read — avoids stale empty URI after .env load order issues */
  get mongoUrl() {
    return getMongoConnectionString();
  },
  /** Optional override; if empty, DB name comes from URI path or mongoConnection fallback */
  mongoDbName: req('MONGO_DB_NAME', ''),
  get databaseUrl() {
    return getMongoConnectionString();
  },
  jwtAccessSecret: req('JWT_ACCESS_SECRET', 'dev-only-change-in-production-min-32-chars'),
  jwtRefreshSecret: req('JWT_REFRESH_SECRET', 'dev-only-refresh-change-min-32-chars'),
  accessTtlMin: envPositiveInt('ACCESS_TOKEN_TTL_MINUTES', 15, 1, 24 * 60),
  refreshTtlDays: envPositiveInt('REFRESH_TOKEN_TTL_DAYS', 30, 1, 365),
  corsOrigins: req(
    'CORS_ORIGINS',
    'http://localhost:5173,http://localhost:8080,http://127.0.0.1:5173,http://127.0.0.1:8080'
  )
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  oauthRedirectBase: req('OAUTH_REDIRECT_BASE', 'http://localhost:8080'),
  /**
   * Base URL for links inside emails (signup verify, password reset, email verify).
   * Must be reachable from the device where the user opens the email (not only localhost if they use a phone).
   * Defaults to OAUTH_REDIRECT_BASE. Set EMAIL_LINK_BASE e.g. http://192.168.1.10:8080 or https://your-domain.com
   */
  emailLinkBase: stripTrailingSlash(req('EMAIL_LINK_BASE', req('OAUTH_REDIRECT_BASE', 'http://localhost:8080'))),
  /** Public base URL for backend OAuth callback (avoid proxy Host header mismatch). */
  oauthCallbackBase: req('OAUTH_CALLBACK_BASE', 'http://localhost:4000'),
  googleClientId: req('GOOGLE_CLIENT_ID', ''),
  googleClientSecret: req('GOOGLE_CLIENT_SECRET', ''),
  facebookAppId: req('FACEBOOK_APP_ID', ''),
  facebookAppSecret: req('FACEBOOK_APP_SECRET', ''),
  smtpUrl: req('SMTP_URL', ''),
  emailFrom: req('EMAIL_FROM', 'noreply@localhost'),
  /** Password reset requests allowed per email per day (rolling 24h). */
  resetPasswordMaxPerDay: envPositiveInt('RESET_PASSWORD_MAX_PER_DAY', 5, 1, 50),
  /** Email verification links allowed per email per day (rolling 24h). */
  verifyEmailMaxPerDay: envPositiveInt('VERIFY_EMAIL_MAX_PER_DAY', 5, 1, 50),
  /** Signup magic-link validity (minutes). Env: SIGNUP_VERIFY_TTL_MINUTES */
  signupVerifyTtlMinutes: envPositiveInt('SIGNUP_VERIFY_TTL_MINUTES', 2, 1, 60),
  /** Max distinct verified accounts per browser device id (anti-spam). Env: MAX_SIGNUP_EMAILS_PER_DEVICE */
  maxSignupEmailsPerDevice: envPositiveInt('MAX_SIGNUP_EMAILS_PER_DEVICE', 5, 1, 100),
  redisUrl: req('REDIS_URL', ''),
  rootAllowedIps: req('ROOT_ALLOWED_IPS', '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  /** Plain password for legacy Events admin UI (replaces Supabase edge function). */
  eventsAdminPassword: req('EVENTS_ADMIN_PASSWORD', ''),
  /** Separate secret for root-only JWT (must differ from JWT_ACCESS_SECRET in production). */
  rootJwtSecret: req('ROOT_JWT_SECRET', ''),
  /** Phrase checked on root signup/login (constant-time compare in routes). */
  rootSecretKey: req('ROOT_SECRET_KEY', 'Jay Gurudev'),
  rootAccessTtlHours: envPositiveInt('ROOT_ACCESS_TTL_HOURS', 4, 1, 168),
  rootRefreshTtlHours: envPositiveInt('ROOT_REFRESH_TTL_HOURS', 24, 1, 720),
  /** HttpOnly session cookie for root refresh JWT (no maxAge — cleared when browser closes) */
  rootRefreshCookieName: req('ROOT_REFRESH_COOKIE_NAME', 'aol_root_rt'),
  /** HttpOnly cookie name for user refresh tokens */
  refreshCookieName: req('REFRESH_COOKIE_NAME', 'aol_rt'),
  githubToken: req('GITHUB_TOKEN', ''),
  githubOwner: req('GITHUB_OWNER', ''),
  githubRepo: req('GITHUB_REPO', ''),
  githubBranch: req('GITHUB_BRANCH', 'main'),
};

export function isProd() {
  return config.nodeEnv === 'production';
}

/** Elasticsearch base URL (e.g. http://127.0.0.1:9200). Empty = search API unavailable. */
export function getElasticsearchUrl() {
  return (process.env.ELASTICSEARCH_URL || '').trim();
}

/** Index name for site search documents. */
export function getElasticsearchIndex() {
  const v = (process.env.ELASTICSEARCH_INDEX || 'aura_site_search').trim();
  return v || 'aura_site_search';
}

/** Hybrid search uses OpenAI embeddings when set (with SEARCH_SEMANTIC_ENABLED=1). */
export function isSearchSemanticEnabled() {
  const v = (process.env.SEARCH_SEMANTIC_ENABLED || '').trim().toLowerCase();
  if (v === '0' || v === 'false' || v === 'no') return false;
  return Boolean((process.env.OPENAI_API_KEY || '').trim());
}
