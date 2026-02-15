-- Blog Comments table
CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
  author_name VARCHAR(100) NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  website VARCHAR(255) DEFAULT '', -- honeypot field
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_blog_comments_post_id ON blog_comments(blog_post_id);
CREATE INDEX idx_blog_comments_status ON blog_comments(status);
CREATE INDEX idx_blog_comments_created_at ON blog_comments(created_at DESC);
CREATE INDEX idx_blog_comments_email_created ON blog_comments(author_email, created_at DESC);

-- Enable RLS
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Anon can only read approved comments
CREATE POLICY "Anon read approved comments" ON blog_comments
  FOR SELECT USING (status = 'approved');

-- Anon can insert pending comments only
CREATE POLICY "Anon insert pending comments" ON blog_comments
  FOR INSERT WITH CHECK (status = 'pending');

-- Service role has full access
CREATE POLICY "Service role full access on comments" ON blog_comments
  FOR ALL USING (true);
