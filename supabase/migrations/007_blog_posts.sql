-- Blog posts table for LuraLab blog content
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('hormoni','stress','sŭn','hranene','wellness')),
  author JSONB NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  read_time INTEGER NOT NULL DEFAULT 5,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  -- SEO fields
  tldr TEXT,
  key_takeaways JSONB DEFAULT '[]',
  faq JSONB DEFAULT '[]',
  sources JSONB DEFAULT '[]',
  meta_title TEXT,
  meta_description TEXT,
  keywords JSONB DEFAULT '[]',
  -- AI metadata
  content_type TEXT,
  ai_generated BOOLEAN DEFAULT false,
  ai_model TEXT,
  word_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured) WHERE featured = true;

-- RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Anon: read only published posts
CREATE POLICY "Anon read published blog posts" ON blog_posts
  FOR SELECT USING (published = true);

-- Service role: full access
CREATE POLICY "Service role full access blog posts" ON blog_posts
  FOR ALL USING (true);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at();
