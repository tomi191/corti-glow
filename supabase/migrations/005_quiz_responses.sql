-- ===========================================
-- QUIZ RESPONSES TABLE (Glow Guide)
-- ===========================================
CREATE TABLE IF NOT EXISTS quiz_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  level TEXT NOT NULL CHECK (level IN ('starter', 'glow', 'restart')),
  category_scores JSONB NOT NULL DEFAULT '{}',
  answers JSONB NOT NULL DEFAULT '[]',
  recommended_variant TEXT NOT NULL,
  ai_recommendation TEXT,
  added_to_cart BOOLEAN DEFAULT false,
  converted_to_order BOOLEAN DEFAULT false,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quiz_responses_level ON quiz_responses(level);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_created_at ON quiz_responses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_converted ON quiz_responses(converted_to_order) WHERE converted_to_order = true;

-- RLS
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access" ON quiz_responses FOR ALL USING (true);
