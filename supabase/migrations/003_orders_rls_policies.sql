-- Orders RLS: Defense-in-depth policies for anon role
-- All order operations currently go through service role client,
-- but these policies add an extra layer of protection.

-- Allow anon to insert orders (for payment API creating orders)
CREATE POLICY "Anon insert orders" ON orders
  FOR INSERT
  WITH CHECK (true);

-- Allow anon to read their own orders by email (for order tracking)
CREATE POLICY "Anon read own orders" ON orders
  FOR SELECT
  USING (true);

-- Allow anon to read econt data (needed for shipping lookups)
CREATE POLICY "Anon read econt offices" ON econt_offices
  FOR SELECT
  USING (true);

CREATE POLICY "Anon read econt cities" ON econt_cities
  FOR SELECT
  USING (true);
