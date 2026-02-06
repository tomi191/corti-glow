---
name: deploy-check
description: Run pre-deployment checks - build validation, security, SEO, performance, environment variables
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash(npm run build:*), Bash(npm run lint:*), Bash(npx tsc:*)
---

# Pre-Deployment Checklist

Run all checks before deploying to production.

## 1. Build Validation
```
npm run build
```
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] No ESLint warnings/errors

## 2. Environment Variables
Read `.env.local` or `.env.production` and verify ALL required vars are set:

```
# Required - Supabase
NEXT_PUBLIC_SUPABASE_URL          ← Must be set
NEXT_PUBLIC_SUPABASE_ANON_KEY     ← Must be set
SUPABASE_SERVICE_ROLE_KEY         ← Must be set (server-only!)

# Required - Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ← Must be set
STRIPE_SECRET_KEY                  ← Must be set (server-only!)
STRIPE_WEBHOOK_SECRET              ← Must be set (server-only!)

# Required - Econt
ECONT_USERNAME                     ← Must be set
ECONT_PASSWORD                     ← Must be set
ECONT_API_URL                      ← Must be set

# Required - Admin
ADMIN_PASSWORD                     ← Must be set (NO DEFAULT!)

# Required - App
NEXT_PUBLIC_APP_URL                ← Must be production URL
```

- [ ] No `NEXT_PUBLIC_` prefix on secret keys
- [ ] `ADMIN_PASSWORD` is NOT a default/weak password
- [ ] `NEXT_PUBLIC_APP_URL` points to production domain

## 3. Security Checks
- [ ] Grep for `console.log` in API routes (remove debug logs)
- [ ] Grep for `TODO` or `FIXME` in critical paths
- [ ] Grep for hardcoded `localhost` URLs
- [ ] Grep for hardcoded test/development keys
- [ ] Middleware protects all admin routes
- [ ] RLS enabled on all Supabase tables

## 4. SEO Verification
Read and verify:
- `src/app/layout.tsx` → metadata configured with production URL
- `src/app/sitemap.ts` → all public pages listed
- `src/app/robots.ts` → admin/api/checkout disallowed
- [ ] `metadataBase` uses production URL
- [ ] Open Graph images exist at correct paths
- [ ] All pages have title and description

## 5. Performance Checks
- [ ] Images use `next/image` (not raw `<img>`)
- [ ] Hero images have `priority={true}`
- [ ] Heavy components use `dynamic()` imports
- [ ] No unused large dependencies in bundle
- [ ] `revalidate` configured on data-fetching pages

## 6. Functionality Verification
Critical user flows that must work:
- [ ] Homepage loads correctly
- [ ] Product page displays with correct prices
- [ ] Add to cart works
- [ ] Checkout flow completes (info → shipping → payment → review)
- [ ] Econt city/office search works
- [ ] Stripe payment processes
- [ ] Order confirmation page shows
- [ ] Admin dashboard accessible with correct password
- [ ] Admin can view/manage orders

## 7. Database
- [ ] All migrations applied to production Supabase
- [ ] RLS policies active
- [ ] Indexes created for performance
- [ ] Seed data (products) present

## Output:
Report results as:
- PASS ✓ or FAIL ✗ for each check
- List all issues found with file locations
- Prioritize by severity (blocking vs warning)
