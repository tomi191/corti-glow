-- ===========================================
-- PWA USER PROFILES & CHECK-IN HISTORY
-- Server-side backup for localStorage data.
-- Synced on Clerk login via /api/pwa/sync.
-- ===========================================

-- ─── PWA Profiles ───
-- One profile per Clerk user. Stores cycle config + onboarding data.

CREATE TABLE pwa_profiles (
  clerk_user_id TEXT PRIMARY KEY,
  last_period_date TEXT,                  -- "YYYY-MM-DD" or null
  cycle_length INT NOT NULL DEFAULT 28,
  period_duration INT NOT NULL DEFAULT 5,
  user_name TEXT,
  age_range TEXT,
  concerns JSONB NOT NULL DEFAULT '[]',
  contraception TEXT,                     -- "yes" | "no" | "unsure" | null
  has_seen_tour BOOLEAN NOT NULL DEFAULT false,
  push_enabled BOOLEAN NOT NULL DEFAULT false,
  ios_install_dismissed BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE pwa_profiles ENABLE ROW LEVEL SECURITY;

-- Service role: full access (API routes use service role)
CREATE POLICY "Service role full access" ON pwa_profiles
  FOR ALL USING (true);


-- ─── PWA Check-ins ───
-- One check-in per user per day. Mirrors localStorage check-in history.

CREATE TABLE pwa_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  date TEXT NOT NULL,                     -- "YYYY-MM-DD"
  period_started BOOLEAN NOT NULL DEFAULT false,
  sleep INT NOT NULL DEFAULT 0,
  stress INT NOT NULL DEFAULT 0,
  symptoms JSONB NOT NULL DEFAULT '[]',
  glow_score INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One check-in per user per day
  CONSTRAINT pwa_checkins_user_date_unique UNIQUE (clerk_user_id, date)
);

-- Indexes
CREATE INDEX idx_pwa_checkins_user ON pwa_checkins(clerk_user_id);
CREATE INDEX idx_pwa_checkins_date ON pwa_checkins(date DESC);
CREATE INDEX idx_pwa_checkins_user_date ON pwa_checkins(clerk_user_id, date DESC);

-- RLS
ALTER TABLE pwa_checkins ENABLE ROW LEVEL SECURITY;

-- Service role: full access (API routes use service role)
CREATE POLICY "Service role full access" ON pwa_checkins
  FOR ALL USING (true);
