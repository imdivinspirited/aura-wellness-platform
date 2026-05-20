-- CMS tables used by existing Admin UI (programs, events, services, pages, media)

CREATE TABLE IF NOT EXISTS cms_programs (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug               TEXT UNIQUE NOT NULL,
  title              TEXT NOT NULL,
  short_description  TEXT NOT NULL DEFAULT '',
  description        TEXT NOT NULL DEFAULT '',
  category           TEXT NOT NULL DEFAULT 'beginning',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cms_events (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug               TEXT UNIQUE NOT NULL,
  title              TEXT NOT NULL,
  short_description  TEXT NOT NULL DEFAULT '',
  description        TEXT NOT NULL DEFAULT '',
  schedule           JSONB NOT NULL DEFAULT '{}',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cms_services (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug               TEXT UNIQUE NOT NULL,
  title              TEXT NOT NULL,
  short_description  TEXT NOT NULL DEFAULT '',
  description        TEXT NOT NULL DEFAULT '',
  category           TEXT NOT NULL DEFAULT 'other',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cms_pages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'draft',
  language      TEXT NOT NULL DEFAULT 'en',
  sections      JSONB NOT NULL DEFAULT '[]',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cms_media_assets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind         TEXT NOT NULL,
  content_type TEXT,
  file_name    TEXT,
  size_bytes   BIGINT,
  cdn_url      TEXT,
  alt          TEXT,
  title        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cms_programs_cat ON cms_programs (category);
CREATE INDEX IF NOT EXISTS idx_cms_events_slug ON cms_events (slug);
