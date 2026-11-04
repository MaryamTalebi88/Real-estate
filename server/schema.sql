-- EstatePro schema (idempotent — applied on every boot)

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user',      -- user | agent | admin
  phone         TEXT,
  avatar        TEXT,
  status        TEXT NOT NULL DEFAULT 'active',    -- active | suspended
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);

CREATE TABLE IF NOT EXISTS password_resets (
  token      TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS categories (
  id       SERIAL PRIMARY KEY,
  slug     TEXT NOT NULL UNIQUE,
  name_en  TEXT NOT NULL,
  name_fa  TEXT NOT NULL,
  desc_en  TEXT,
  desc_fa  TEXT,
  icon     TEXT NOT NULL DEFAULT 'home',
  image    TEXT,
  sort     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cities (
  id      SERIAL PRIMARY KEY,
  slug    TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_fa TEXT NOT NULL,
  country_en TEXT,
  country_fa TEXT,
  image   TEXT,
  lat     NUMERIC(10, 6),
  lng     NUMERIC(10, 6),
  sort    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS neighborhoods (
  id      SERIAL PRIMARY KEY,
  city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_fa TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS neighborhoods_city_idx ON neighborhoods(city_id);

CREATE TABLE IF NOT EXISTS agents (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
  slug            TEXT NOT NULL UNIQUE,
  name_en         TEXT NOT NULL,
  name_fa         TEXT NOT NULL,
  title_en        TEXT,
  title_fa        TEXT,
  bio_en          TEXT,
  bio_fa          TEXT,
  phone           TEXT,
  email           TEXT,
  avatar          TEXT,
  languages       TEXT[],
  spec_en         TEXT,
  spec_fa         TEXT,
  experience      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS amenities (
  id      SERIAL PRIMARY KEY,
  slug    TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_fa TEXT NOT NULL,
  icon    TEXT NOT NULL DEFAULT 'check'
);

CREATE TABLE IF NOT EXISTS properties (
  id             SERIAL PRIMARY KEY,
  reference      TEXT NOT NULL UNIQUE,
  slug           TEXT NOT NULL UNIQUE,
  title_en       TEXT NOT NULL,
  title_fa       TEXT NOT NULL,
  description_en TEXT,
  description_fa TEXT,
  category_id    INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  listing_type   TEXT NOT NULL DEFAULT 'sale',      -- sale | rent
  price          NUMERIC(14, 2) NOT NULL DEFAULT 0,
  currency       TEXT NOT NULL DEFAULT 'AED',
  city_id        INTEGER REFERENCES cities(id) ON DELETE SET NULL,
  neighborhood   TEXT,
  address        TEXT,
  lat            NUMERIC(10, 6),
  lng            NUMERIC(10, 6),
  bedrooms       INTEGER NOT NULL DEFAULT 0,
  bathrooms      INTEGER NOT NULL DEFAULT 0,
  area           NUMERIC(10, 2) NOT NULL DEFAULT 0,
  parking        INTEGER NOT NULL DEFAULT 0,
  floor          TEXT,
  year_built     INTEGER,
  furnishing     TEXT,                              -- furnished | semi | unfurnished
  is_new         BOOLEAN NOT NULL DEFAULT false,
  is_featured    BOOLEAN NOT NULL DEFAULT false,
  is_verified    BOOLEAN NOT NULL DEFAULT false,
  status         TEXT NOT NULL DEFAULT 'pending',   -- pending | active | rejected | sold
  rejection_note TEXT,
  views          INTEGER NOT NULL DEFAULT 0,
  agent_id       INTEGER REFERENCES agents(id) ON DELETE SET NULL,
  owner_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS properties_status_idx ON properties(status);
CREATE INDEX IF NOT EXISTS properties_city_idx ON properties(city_id);
CREATE INDEX IF NOT EXISTS properties_cat_idx ON properties(category_id);
CREATE INDEX IF NOT EXISTS properties_owner_idx ON properties(owner_id);

CREATE TABLE IF NOT EXISTS property_images (
  id          SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  sort        INTEGER NOT NULL DEFAULT 0,
  is_cover    BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS property_images_prop_idx ON property_images(property_id);

CREATE TABLE IF NOT EXISTS property_amenities (
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  amenity_id  INTEGER NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (property_id, amenity_id)
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, property_id)
);

CREATE TABLE IF NOT EXISTS inquiries (
  id            SERIAL PRIMARY KEY,
  kind          TEXT NOT NULL DEFAULT 'property',   -- property | contact
  property_id   INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  agent_id      INTEGER REFERENCES agents(id) ON DELETE SET NULL,
  user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  subject       TEXT,
  message       TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'new',        -- new | contacted | closed
  internal_note TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS inquiries_status_idx ON inquiries(status);
CREATE INDEX IF NOT EXISTS inquiries_user_idx ON inquiries(user_id);

CREATE TABLE IF NOT EXISTS reviews (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  agent_id    INTEGER REFERENCES agents(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  avatar      TEXT,
  rating      INTEGER NOT NULL DEFAULT 5,
  body        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending',      -- pending | approved | rejected
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reviews_status_idx ON reviews(status);

CREATE TABLE IF NOT EXISTS developments (
  id             SERIAL PRIMARY KEY,
  slug           TEXT NOT NULL UNIQUE,
  name_en        TEXT NOT NULL,
  name_fa        TEXT NOT NULL,
  city_id        INTEGER REFERENCES cities(id) ON DELETE SET NULL,
  image          TEXT,
  status_en      TEXT,
  status_fa      TEXT,
  completion     TEXT,
  price_from     NUMERIC(14, 2),
  currency       TEXT NOT NULL DEFAULT 'AED',
  desc_en        TEXT,
  desc_fa        TEXT
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         SERIAL PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id         INTEGER PRIMARY KEY DEFAULT 1,
  data       JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS property_views (
  id          SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS property_views_prop_idx ON property_views(property_id);
CREATE INDEX IF NOT EXISTS property_views_user_idx ON property_views(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS search_events (
  id         SERIAL PRIMARY KEY,
  city       TEXT,
  query      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
