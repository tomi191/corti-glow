---
name: admin-audit
description: Full audit of admin dashboard - pages, API routes, auth, CRUD operations, UX, missing features for e-commerce management
---

# Admin Dashboard Audit

Comprehensive review of the admin panel for a production-ready e-commerce platform.

## 1. Authentication & Security
- Read `src/middleware.ts` → Verify ALL /admin and /api/admin routes are protected
- Read `src/app/api/admin/auth/route.ts` → Check login logic, password handling, session management
- Read `src/app/admin/login/` → Check login page UX
- [ ] Admin routes redirect to login when unauthenticated
- [ ] API admin routes return 401 when unauthenticated
- [ ] Session uses HTTP-only secure cookies
- [ ] No default/hardcoded admin password
- [ ] Logout functionality exists and clears session
- [ ] Brute-force protection (rate limiting on login)

## 2. Dashboard Overview (Admin Home)
- Read `src/app/admin/page.tsx` → Check what stats are shown
- Read `src/app/api/admin/stats/route.ts` → Verify data accuracy
- [ ] Shows key KPIs: total revenue, orders count, new customers
- [ ] Time period filter (today, week, month)
- [ ] Recent orders quick view
- [ ] Quick actions (view orders, manage products)

## 3. Order Management
- Read `src/app/admin/porachki/page.tsx` → Order list page
- Read `src/app/admin/porachki/[id]/page.tsx` → Order detail page (if exists)
- Read `src/app/api/admin/orders/route.ts` → Orders API
- [ ] Order list with pagination
- [ ] Search/filter by status, date, customer
- [ ] Order detail view: items, customer info, shipping, payment
- [ ] Status update: pending → confirmed → shipped → delivered
- [ ] Econt tracking number (AWB) visible and manageable
- [ ] Customer contact info (email, phone) accessible
- [ ] Shipping address visible
- [ ] Order notes functionality
- [ ] Export orders (CSV/Excel)

## 4. Product Management
- Read `src/app/admin/produkti/page.tsx` → Product list/management
- Read `src/app/api/admin/products/route.ts` → Products API
- [ ] List all products with key info (name, price, stock status)
- [ ] Edit product: name, description, price, variants
- [ ] Toggle product active/inactive
- [ ] Variant management (bundles: 1-pack, 3-pack, 6-pack)
- [ ] Image management
- [ ] Stock/inventory tracking (if applicable)

## 5. Customer Management
- Read `src/app/admin/klienti/page.tsx` → Customers page
- Read `src/app/api/admin/customers/route.ts` → Customers API
- [ ] Customer list with search
- [ ] Customer detail: order history, total spent
- [ ] Contact info (email, phone)

## 6. Discount/Promo Management
- Read `src/app/admin/promocii/page.tsx` → Discounts page
- Read `src/app/api/admin/discounts/route.ts` → Discounts API
- [ ] Create discount code with: code, type (% or fixed), amount, expiry
- [ ] Activate/deactivate discounts
- [ ] Usage tracking (times used, max uses)
- [ ] Minimum order amount

## 7. Settings
- Read `src/app/admin/nastroyki/page.tsx` → Settings page
- [ ] Shipping settings (free shipping threshold)
- [ ] Notification settings
- [ ] Store info (company details)

## 8. Missing Critical Features
Check if these essential e-commerce admin features exist:
- [ ] Real-time order notifications
- [ ] Revenue reports/analytics
- [ ] Econt shipment creation (AWB generation)
- [ ] Email to customer on status change
- [ ] Bulk actions (bulk status update)
- [ ] Mobile-responsive admin layout

## 9. API Completeness
Verify all admin APIs match what the UI needs:
- Glob `src/app/api/admin/**/route.ts` → List all admin API routes
- For each API route, check: proper auth, input validation, error handling

## 10. UX & Usability
- Check admin layout (`src/app/admin/layout.tsx`): navigation, sidebar, responsive
- Verify loading states, error states, empty states
- Check if admin uses consistent design patterns

## Output:
For each section report:
- PASS / PARTIAL / FAIL / MISSING
- Specific issues found with file:line references
- Priority: CRITICAL (blocks selling) / HIGH / MEDIUM / LOW
- Actionable recommendations for missing features
