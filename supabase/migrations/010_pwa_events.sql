-- ===========================================
-- PWA BEHAVIORAL ANALYTICS
-- ===========================================

-- Event-level tracking for PWA interactions
CREATE TABLE pwa_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,                           -- Clerk user ID (nullable for anonymous)
  session_id TEXT NOT NULL,               -- Unique session ID per app open
  event_name TEXT NOT NULL,               -- e.g. checkin_completed, breathing_finished
  event_data JSONB DEFAULT '{}',          -- Flexible metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_pwa_events_event_name ON pwa_events(event_name);
CREATE INDEX idx_pwa_events_created_at ON pwa_events(created_at DESC);
CREATE INDEX idx_pwa_events_user_id ON pwa_events(user_id);
CREATE INDEX idx_pwa_events_session_id ON pwa_events(session_id);

-- RLS
ALTER TABLE pwa_events ENABLE ROW LEVEL SECURITY;

-- Service role: full access (admin API routes)
CREATE POLICY "Service role full access" ON pwa_events
  FOR ALL USING (true);

-- Anon: INSERT only (PWA can write events without auth)
CREATE POLICY "Anon insert events" ON pwa_events
  FOR INSERT WITH CHECK (true);


-- ===========================================
-- PWA DAILY AGGREGATED STATS
-- ===========================================

CREATE TABLE pwa_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_checkins INT DEFAULT 0,
  quick_checkins INT DEFAULT 0,
  full_checkins INT DEFAULT 0,
  breathing_sessions INT DEFAULT 0,
  total_breathing_cycles INT DEFAULT 0,
  shop_clicks INT DEFAULT 0,
  unique_users INT DEFAULT 0,
  avg_stress NUMERIC(4,2),
  avg_sleep NUMERIC(4,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_pwa_daily_stats_date ON pwa_daily_stats(date DESC);

-- RLS
ALTER TABLE pwa_daily_stats ENABLE ROW LEVEL SECURITY;

-- Service role: full access (only admin can read/write stats)
CREATE POLICY "Service role full access" ON pwa_daily_stats
  FOR ALL USING (true);
