-- Atomic RPC functions for race-safe order processing
-- Fixes: C1 (order numbers), C2 (stock), C3/C4 (discounts)

-- 1. Atomic order number generation using a sequence table
CREATE TABLE IF NOT EXISTS order_sequence (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  last_number INTEGER NOT NULL DEFAULT 1000
);

-- Seed with current max order number (idempotent)
INSERT INTO order_sequence (id, last_number)
SELECT 1, COALESCE(
  (SELECT MAX(CAST(SUBSTRING(order_number FROM 4) AS INTEGER))
   FROM orders
   WHERE order_number ~ '^LL-[0-9]+$'),
  1000
)
ON CONFLICT (id) DO UPDATE SET last_number = GREATEST(
  order_sequence.last_number,
  EXCLUDED.last_number
);

-- RPC: atomically get next order number
CREATE OR REPLACE FUNCTION next_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  n INTEGER;
BEGIN
  UPDATE order_sequence
  SET last_number = last_number + 1
  WHERE id = 1
  RETURNING last_number INTO n;
  RETURN 'LL-' || n::TEXT;
END;
$$;

-- 2. Atomic stock deduction: prevents overselling under concurrency
CREATE OR REPLACE FUNCTION deduct_product_stock(p_slug TEXT, p_quantity INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE products
  SET stock = stock - p_quantity
  WHERE slug = p_slug
    AND track_inventory = TRUE
    AND stock >= p_quantity;
  RETURN FOUND;
END;
$$;

-- 3. Atomic stock restoration (for cancellations)
CREATE OR REPLACE FUNCTION restore_product_stock(p_slug TEXT, p_quantity INTEGER)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE products
  SET stock = stock + p_quantity
  WHERE slug = p_slug
    AND track_inventory = TRUE;
END;
$$;

-- 4. Atomic discount usage increment: prevents double-redemption
CREATE OR REPLACE FUNCTION increment_discount_usage(p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE discounts
  SET used_count = used_count + 1
  WHERE code = p_code
    AND active = TRUE
    AND (max_uses IS NULL OR used_count < max_uses);
  RETURN FOUND;
END;
$$;
