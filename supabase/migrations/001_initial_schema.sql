-- LuraLab Database Schema
-- Run this in your Supabase SQL Editor

-- ===========================================
-- PRODUCTS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  sku TEXT UNIQUE,                              -- SKU артикулен номер
  barcode TEXT,                                 -- Баркод (EAN/UPC)
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL,
  flavor TEXT,
  servings INTEGER,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),                     -- Себестойност за profit tracking
  image TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 100,
  low_stock_threshold INTEGER DEFAULT 10,       -- Праг за нисък stock alert
  track_inventory BOOLEAN DEFAULT true,         -- Дали да следи наличност
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  badge TEXT,
  features JSONB DEFAULT '[]',
  ingredients JSONB DEFAULT '[]',
  variants JSONB DEFAULT '[]',
  how_to_use JSONB,
  meta_title TEXT,
  meta_description TEXT,
  weight DECIMAL(10,3) DEFAULT 0.5,
  dimensions JSONB,                             -- {length, width, height} в cm
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published BOOLEAN DEFAULT true
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_published ON products(published);

-- ===========================================
-- DISCOUNTS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS discounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value DECIMAL(10,2) NOT NULL,
  min_order_value DECIMAL(10,2),
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  applies_to TEXT DEFAULT 'all' CHECK (applies_to IN ('all', 'specific_products', 'specific_variants')),
  product_ids UUID[],
  variant_ids TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_discounts_code ON discounts(code);
CREATE INDEX IF NOT EXISTS idx_discounts_active ON discounts(active);

-- ===========================================
-- ORDERS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Customer info
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,

  -- Shipping
  shipping_method TEXT NOT NULL CHECK (shipping_method IN ('econt_office', 'econt_address', 'speedy')),
  shipping_address JSONB NOT NULL,
  shipping_price DECIMAL(10,2) NOT NULL,
  shipping_weight DECIMAL(10,3),                -- Тегло на пратката в kg

  -- Econt Waybill (Товарителница)
  econt_shipment_id TEXT,                       -- ID на товарителницата
  econt_tracking_number TEXT,                   -- Номер за проследяване
  econt_label_url TEXT,                         -- URL към PDF етикета
  econt_label_generated_at TIMESTAMPTZ,         -- Кога е генериран етикета

  -- Shipping Timeline
  shipped_at TIMESTAMPTZ,                       -- Дата/час на изпращане
  delivered_at TIMESTAMPTZ,                     -- Дата/час на доставка
  estimated_delivery_date DATE,                 -- Очаквана дата на доставка

  -- Payment
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'cod')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT,

  -- Order details
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  discount_code TEXT,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',

  -- Status
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'processing', 'shipped', 'delivered', 'cancelled')),
  notes TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ===========================================
-- ECONT OFFICES CACHE
-- ===========================================
CREATE TABLE IF NOT EXISTS econt_offices (
  id TEXT PRIMARY KEY,
  city_id INTEGER,
  city_name TEXT,
  name TEXT,
  address TEXT,
  phone TEXT,
  work_time TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- ECONT CITIES CACHE
-- ===========================================
CREATE TABLE IF NOT EXISTS econt_cities (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT,
  post_code TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- CUSTOMERS VIEW
-- ===========================================
CREATE OR REPLACE VIEW customers AS
SELECT DISTINCT ON (customer_email)
  customer_email as email,
  customer_first_name as first_name,
  customer_last_name as last_name,
  customer_phone as phone,
  COUNT(*) OVER (PARTITION BY customer_email) as order_count,
  SUM(total) OVER (PARTITION BY customer_email) as total_spent
FROM orders
ORDER BY customer_email, created_at DESC;

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE econt_offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE econt_cities ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for server-side operations)
CREATE POLICY "Service role full access" ON products FOR ALL USING (true);
CREATE POLICY "Service role full access" ON discounts FOR ALL USING (true);
CREATE POLICY "Service role full access" ON orders FOR ALL USING (true);
CREATE POLICY "Service role full access" ON econt_offices FOR ALL USING (true);
CREATE POLICY "Service role full access" ON econt_cities FOR ALL USING (true);

-- Allow anon read access to published products
CREATE POLICY "Anon read published products" ON products FOR SELECT USING (published = true AND status = 'active');

-- Allow anon read access to active discounts
CREATE POLICY "Anon read active discounts" ON discounts FOR SELECT USING (active = true);

-- ===========================================
-- UPDATED_AT TRIGGER
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_discounts_updated_at
  BEFORE UPDATE ON discounts
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- ===========================================
-- SEED DATA: Corti-Glow Product
-- ===========================================
INSERT INTO products (
  slug,
  name,
  tagline,
  description,
  flavor,
  servings,
  price,
  image,
  images,
  stock,
  status,
  features,
  ingredients,
  variants,
  how_to_use,
  weight,
  published
) VALUES (
  'corti-glow',
  'Corti-Glow',
  'Ритуалът за хормонален баланс',
  'Corti-Glow е иновативна формула, създадена специално за жени, които искат да възстановят хормоналния си баланс по естествен начин. Комбинира 5 научно доказани съставки за намаляване на кортизола, подобряване на съня и цялостно благосъстояние.',
  'Горска Ягода и Лайм',
  30,
  99.00,
  '/images/product-hero-box.webp',
  ARRAY['/images/product-hero-box.webp', '/images/product-sachet-marble.webp', '/images/product-pouring.webp', '/images/product-splash-pour.webp'],
  100,
  'active',
  '[
    {"icon": "droplets", "icon_color": "#B2D8C6", "title": "Моментална Лекота", "description": "Бромелаин (от ананас) и Магнезиев Бисглицинат работят заедно, за да изчистят задържаната вода и успокоят стомаха."},
    {"icon": "brain", "icon_color": "#FFC1CC", "title": "Дълбок Анти-Стрес", "description": "KSM-66 Ашваганда и L-Теанин свалят нивата на кортизол с до 27%, превключвайки мозъка от паника на спокойствие."},
    {"icon": "scale", "icon_color": "#F4E3B2", "title": "Хормонален Баланс", "description": "Мио-инозитолът подкрепя инсулиновата чувствителност и овулацията, като намалява хормоналното акне и промените в настроението."}
  ]'::jsonb,
  '[
    {"symbol": "Mg", "name": "Магнезиев Бисглицинат", "dosage": "300mg", "description": "Най-усвоимата форма на магнезий. Успокоява мускулите и подобрява съня.", "color": "#B2D8C6"},
    {"symbol": "KSM", "name": "Ашваганда (KSM-66)", "dosage": "300mg", "description": "Клинично доказано намаляване на кортизола с до 27%. Златният стандарт.", "color": "#FFC1CC"},
    {"symbol": "L-T", "name": "L-Теанин", "dosage": "200mg", "description": "Аминокиселина от зелен чай. Насърчава алфа мозъчните вълни за спокойна концентрация.", "color": "#F4E3B2"},
    {"symbol": "MI", "name": "Мио-инозитол", "dosage": "2000mg", "description": "Подкрепя инсулиновата чувствителност и хормоналния баланс при PCOS.", "color": "#E5E5E5"},
    {"symbol": "Br", "name": "Бромелаин", "dosage": "500mg", "description": "Ензим от ананас. Премахва задържаната вода и подпомага храносмилането.", "color": "#FFD4A3"}
  ]'::jsonb,
  '[
    {"id": "starter-box", "name": "Старт", "description": "Идеален за проба. 30 саше.", "price": 99, "quantity": 1},
    {"id": "glow-bundle", "name": "Glow Пакет", "description": "За 2 месеца. Видими резултати.", "price": 169, "compare_at_price": 198, "quantity": 2, "is_best_seller": true, "savings": 29},
    {"id": "restart-bundle", "name": "Пълен Рестарт", "description": "За 3 месеца. Пълен хормонален ресет.", "price": 239, "compare_at_price": 297, "quantity": 3, "savings": 58}
  ]'::jsonb,
  '[
    {"step": 1, "title": "Отвори & Изсипи", "description": "Изсипи едно саше в 250мл студена вода. Гледай как розовите минерали се разтварят."},
    {"step": 2, "title": "Разбъркай & Добави Лед", "description": "Разбъркай добре (без бучки, никога) и добави лед. Изстискай пресен лайм за още свежест."},
    {"step": 3, "title": "Сияй & Релаксирай", "description": "Отпивай бавно. Усети как магнезият успокоява мускулите в рамките на 20 минути."}
  ]'::jsonb,
  0.5,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ===========================================
-- SEED DATA: Sample Discount Codes
-- ===========================================
INSERT INTO discounts (code, type, value, min_order_value, max_uses, active) VALUES
  ('WELCOME10', 'percentage', 10, 50, 1000, true),
  ('GLOW20', 'percentage', 20, 100, 500, true),
  ('SAVE5', 'fixed', 5, 30, null, true)
ON CONFLICT (code) DO NOTHING;
