---
name: security-audit
description: Perform a security audit of the e-commerce platform - check for OWASP vulnerabilities, payment security, auth issues, data validation
argument-hint: [scope - "full" or specific area like "checkout", "admin", "api"]
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash(npm run build:*)
---

# Security Audit

Scope: **$ARGUMENTS**

Perform a thorough security audit of the LuraLab e-commerce platform. This handles real money (Stripe payments) and personal customer data.

## Audit Areas:

### 1. Authentication & Authorization
Check these files:
- `src/middleware.ts` - Route protection
- `src/app/api/admin/auth/route.ts` - Admin login
- `src/app/admin/layout.tsx` - Admin layout guard

Verify:
- [ ] Admin routes protected by middleware (not just UI checks)
- [ ] HTTP-only, secure, sameSite cookies
- [ ] No default ADMIN_PASSWORD fallback
- [ ] Session expiration configured
- [ ] API routes behind `/api/admin/` are ALL protected

### 2. Payment Security (CRITICAL)
Check these files:
- `src/app/api/payment/route.ts` - Order creation
- `src/app/api/webhooks/stripe/route.ts` - Webhook handler
- `src/lib/stripe/actions.ts` - Stripe server actions

Verify:
- [ ] Prices ALWAYS verified server-side from database (never from client)
- [ ] Stripe webhook signature verified
- [ ] Payment intent amount matches order total
- [ ] No race conditions in stock deduction
- [ ] Discount codes validated server-side

### 3. Input Validation
Check ALL API routes in `src/app/api/`:

Verify:
- [ ] Every POST/PATCH route uses Zod validation
- [ ] Search inputs sanitized (no SQL wildcards: `%`, `_`)
- [ ] String lengths limited (`.slice(0, N)`)
- [ ] Numbers bounded (`.min()`, `.max()`)
- [ ] UUIDs validated where expected
- [ ] Email/phone format validated

### 4. SQL Injection Prevention
Check all Supabase queries:

Verify:
- [ ] No raw SQL with user input
- [ ] `.ilike()` inputs sanitized
- [ ] `.textSearch()` inputs sanitized
- [ ] No string concatenation in queries

### 5. XSS Prevention
Check client components:

Verify:
- [ ] No `dangerouslySetInnerHTML` with user data
- [ ] User-generated content properly escaped
- [ ] No `eval()` or `new Function()` with user data

### 6. Data Exposure
Verify:
- [ ] Environment variables properly scoped (NEXT_PUBLIC_ only for public)
- [ ] No secrets in client-side code
- [ ] Admin API responses don't leak sensitive data to public routes
- [ ] Error messages don't expose internal details
- [ ] `.env` files in `.gitignore`

### 7. Rate Limiting & Abuse
Check:
- [ ] Payment endpoint has abuse protection
- [ ] Discount validation has rate limiting
- [ ] Admin login has brute-force protection
- [ ] No infinite loops possible in API routes

### 8. CORS & Headers
Check `next.config.ts`:
- [ ] Appropriate security headers set
- [ ] CORS configured correctly
- [ ] CSP (Content Security Policy) considered

## Output Format:
For each finding, report:
- **Severity**: Critical / High / Medium / Low
- **Location**: File path and line number
- **Issue**: What's wrong
- **Fix**: How to fix it
- **Impact**: What could happen if exploited
