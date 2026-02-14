-- ===========================================
-- SUBSCRIPTIONS SCHEMA (LuraLab / Glow)
-- Prefixed with glow_ to avoid Level8 conflicts
-- ===========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_stripe_id ON customers(stripe_customer_id);

-- Glow Subscriptions
CREATE TABLE IF NOT EXISTS glow_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id),
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  product_id UUID,
  variant_id TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  price_per_cycle DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  shipping_method TEXT,
  shipping_address JSONB,
  status TEXT DEFAULT 'incomplete' CHECK (status IN ('active', 'paused', 'cancelled', 'past_due', 'incomplete')),
  billing_interval TEXT DEFAULT 'month',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  next_billing_date TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_glow_sub_customer ON glow_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_glow_sub_status ON glow_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_glow_sub_stripe_id ON glow_subscriptions(stripe_subscription_id);

-- Subscription Orders (links renewals to orders)
CREATE TABLE IF NOT EXISTS glow_subscription_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES glow_subscriptions(id),
  order_id UUID,
  stripe_invoice_id TEXT UNIQUE,
  billing_period_start TIMESTAMPTZ,
  billing_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_glow_sub_orders_sub ON glow_subscription_orders(subscription_id);
CREATE INDEX IF NOT EXISTS idx_glow_sub_orders_order ON glow_subscription_orders(order_id);

-- RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE glow_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE glow_subscription_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON customers FOR ALL USING (true);
CREATE POLICY "Service role full access" ON glow_subscriptions FOR ALL USING (true);
CREATE POLICY "Service role full access" ON glow_subscription_orders FOR ALL USING (true);

-- Triggers
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_glow_subscriptions_updated_at
  BEFORE UPDATE ON glow_subscriptions
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();
