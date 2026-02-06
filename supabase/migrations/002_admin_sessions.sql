-- Admin sessions table for secure session management
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast token lookup
CREATE INDEX idx_admin_sessions_token ON admin_sessions(token);

-- Index for cleanup of expired sessions
CREATE INDEX idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- Enable RLS
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Only service role can access sessions
CREATE POLICY "Service role full access" ON admin_sessions FOR ALL USING (true);
