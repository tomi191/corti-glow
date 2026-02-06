-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  source TEXT DEFAULT 'footer'
);

-- Index for lookups
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);

-- RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access" ON newsletter_subscribers
  FOR ALL USING (true);

-- Anon can only insert (subscribe)
CREATE POLICY "Anon can subscribe" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);
