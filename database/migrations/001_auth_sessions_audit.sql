-- Art of Living — core authentication, sessions, audit (PostgreSQL 14+)
-- Run: psql "$DATABASE_URL" -f database/migrations/001_auth_sessions_audit.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── Users ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT UNIQUE,
  phone             TEXT UNIQUE,
  email_verified_at TIMESTAMPTZ,
  phone_verified_at TIMESTAMPTZ,
  password_hash     TEXT,
  name              TEXT NOT NULL DEFAULT '',
  avatar_url        TEXT,
  bio               TEXT,
  role              TEXT NOT NULL DEFAULT 'user' CHECK (role IN (
    'user', 'service', 'hr', 'shop', 'finance', 'content_admin', 'admin', 'super_admin', 'root'
  )),
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'deleted')),
  blocked_reason    TEXT,
  preferences       JSONB NOT NULL DEFAULT '{}',
  last_login_at     TIMESTAMPTZ,
  last_login_ip     INET,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at);
CREATE INDEX IF NOT EXISTS idx_users_status ON users (status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- ─── OAuth identities ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS oauth_identities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  provider      TEXT NOT NULL,
  provider_uid  TEXT NOT NULL,
  email         TEXT,
  raw_profile   JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_uid)
);

CREATE INDEX IF NOT EXISTS idx_oauth_user ON oauth_identities (user_id);

-- ─── Email verification & password reset tokens ──────────────────────────
CREATE TABLE IF NOT EXISTS auth_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users (id) ON DELETE CASCADE,
  email       TEXT,
  token_hash  TEXT NOT NULL,
  purpose     TEXT NOT NULL CHECK (purpose IN ('email_verify', 'password_reset', 'magic_link')),
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_tokens_lookup ON auth_tokens (purpose, expires_at);

-- ─── Refresh tokens (rotation families) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash     TEXT NOT NULL UNIQUE,
  family_id      UUID NOT NULL,
  parent_id      UUID REFERENCES refresh_tokens (id) ON DELETE SET NULL,
  user_agent     TEXT,
  ip             INET,
  expires_at     TIMESTAMPTZ NOT NULL,
  revoked_at     TIMESTAMPTZ,
  replaced_by_id UUID REFERENCES refresh_tokens (id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refresh_user ON refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_family ON refresh_tokens (family_id);
CREATE INDEX IF NOT EXISTS idx_refresh_expires ON refresh_tokens (expires_at) WHERE revoked_at IS NULL;

-- ─── Access token denylist (logout, admin revoke) — O(1) lookup by jti ───
CREATE TABLE IF NOT EXISTS access_token_revocations (
  jti        TEXT PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_atr_expires ON access_token_revocations (expires_at);

-- ─── Rate limiting / lockout (DB-backed; Redis optional in app layer) ───
CREATE TABLE IF NOT EXISTS login_attempts (
  id           BIGSERIAL PRIMARY KEY,
  identifier   TEXT NOT NULL,
  ip           INET,
  success      BOOLEAN NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_id_time ON login_attempts (identifier, created_at DESC);

-- ─── Phone OTP ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS phone_otp_challenges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone       TEXT NOT NULL,
  code_hash   TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  attempts    INT NOT NULL DEFAULT 0,
  consumed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_phone_otp_phone ON phone_otp_challenges (phone, created_at DESC);

-- ─── Root operator accounts (separate from normal users) ─────────────────
CREATE TABLE IF NOT EXISTS root_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username        TEXT UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  totp_secret     TEXT NOT NULL,
  display_name    TEXT,
  allowed_ips     INET[] DEFAULT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at   TIMESTAMPTZ
);

-- ─── Immutable audit log (append-only) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id          BIGSERIAL PRIMARY KEY,
  actor_type  TEXT NOT NULL CHECK (actor_type IN ('user', 'root', 'system')),
  actor_id    TEXT,
  action      TEXT NOT NULL,
  resource    TEXT,
  payload     JSONB,
  ip          INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log (actor_type, actor_id);

-- ─── Feature flags & system config ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS feature_flags (
  key         TEXT PRIMARY KEY,
  enabled     BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Anonymous browsing / cart correlation (id-only)
CREATE TABLE IF NOT EXISTS anonymous_guests (
  id         UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS system_announcements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message     TEXT NOT NULL,
  active      BOOLEAN NOT NULL DEFAULT true,
  starts_at   TIMESTAMPTZ,
  ends_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
