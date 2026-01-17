# CLAUDE.md - LuraLab Project Instructions

> This file contains instructions for Claude when working on this codebase.

---

## CRITICAL RULES - ALWAYS FOLLOW

### 1. Read Before You Act
**NEVER speculate about code you have not opened.** If the user references a specific file, you MUST read the file before answering. Make sure to investigate and read relevant files BEFORE answering questions about the codebase. Never make any claims about code before investigating unless you are certain of the correct answer - give grounded and hallucination-free answers.

### 2. Think First, Then Act
Before making any changes:
1. First think through the problem
2. Read the codebase for relevant files
3. Understand the existing patterns and architecture
4. Plan your approach

### 3. Check Before Major Changes
Before you make any major changes, check in with the user and they will verify the plan. This includes:
- Adding new features
- Refactoring existing code
- Changing database schema
- Modifying API contracts
- Architectural changes

### 4. Explain Your Changes
Every step of the way, provide a high-level explanation of what changes you made. Be concise but clear about:
- What was changed
- Why it was changed
- Any side effects or considerations

### 5. Simplicity Above All
Make every task and code change as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. **Everything is about simplicity.**

Guidelines:
- Prefer small, focused changes over large refactors
- Don't add features beyond what was asked
- Don't "improve" code that doesn't need improving
- One logical change per commit
- Avoid over-engineering

### 6. Keep Code Clean & Organized
Maintain the existing code structure and patterns. The codebase should stay clean, readable, and well-organized.

---

## PROJECT OVERVIEW

**LuraLab** is a modern e-commerce platform for premium supplements (Corti-Glow) built with Next.js 16.

### Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, Framer Motion |
| State | Zustand |
| Database | Supabase (PostgreSQL) |
| Payment | Stripe |
| Shipping | Econt Courier |
| Validation | Zod |

### Language
- UI text is in **Bulgarian**
- Code, comments, and documentation are in **English**

---

## PROJECT STRUCTURE

```
src/
├── app/                    # Next.js App Router
│   ├── (checkout)/         # Checkout flow pages
│   ├── (marketing)/        # Landing & marketing pages
│   ├── admin/              # Admin dashboard
│   └── api/                # API routes
├── components/             # React components
│   ├── cart/               # Shopping cart
│   ├── home/               # Homepage sections
│   ├── layout/             # Header, Footer, etc.
│   └── ui/                 # Reusable UI primitives
├── lib/                    # Utilities & integrations
│   ├── supabase/           # Database client & types
│   ├── stripe/             # Payment processing
│   ├── econt/              # Shipping integration
│   ├── actions/            # Server actions
│   └── schemas/            # Zod validation
├── stores/                 # Zustand state stores
├── data/                   # Static data (products, FAQs)
├── hooks/                  # Custom React hooks
└── types/                  # TypeScript definitions
```

---

## KEY FILES REFERENCE

### Core
| File | Purpose |
|------|---------|
| `src/types/index.ts` | All TypeScript interfaces |
| `src/lib/constants.ts` | Colors, shipping rules, company info |
| `src/lib/utils.ts` | Utility functions (formatPrice, cn) |

### State Management
| File | Purpose |
|------|---------|
| `src/stores/cart-store.ts` | Shopping cart state |
| `src/stores/checkout-store.ts` | Checkout flow state |

### Database
| File | Purpose |
|------|---------|
| `src/lib/supabase/types.ts` | Generated DB types |
| `src/lib/supabase/client.ts` | Browser client |
| `src/lib/supabase/server.ts` | Server client (service role) |
| `supabase/migrations/*.sql` | Database schema |

### Integrations
| File | Purpose |
|------|---------|
| `src/lib/stripe/actions.ts` | Payment server actions |
| `src/lib/econt/client.ts` | Econt API client |
| `src/app/api/webhooks/stripe/route.ts` | Stripe webhook handler |

---

## DATABASE SCHEMA

### Tables
- **products** - Product catalog (Corti-Glow variants)
- **orders** - Customer orders with Econt tracking
- **discounts** - Promotional codes
- **econt_cities** - Cached city data
- **econt_offices** - Cached office locations
- **customers** (view) - Aggregated customer data

### Key Relationships
```
orders.items → references products (as JSONB)
orders.discount_code → references discounts.code
econt_offices.city_id → references econt_cities.id
```

### RLS Policies
- Anon: Read published products & active discounts
- Service role: Full access (admin operations)

---

## DATA FLOW

### Shopping Cart
```
AddToCartButton → useCartStore.addItem() → localStorage persist
CartDrawer → useCartStore items → CartItem components
```

### Checkout Flow
```
Step 1: Customer Info → Zod validation → useCheckoutStore.setCustomer()
Step 2: Shipping → Econt API → useCheckoutStore.setShippingPrice()
Step 3: Payment → Stripe or COD selection
Step 4: Review → POST /api/payment → Order created
```

### Order Processing
```
Card: Stripe PaymentIntent → Webhook → Update order status
COD: Direct order creation → payment_status = "pending"
```

---

## NAMING CONVENTIONS

### Files
- **Pages**: kebab-case (`checkout.tsx`, `porachki.tsx`)
- **Components**: PascalCase (`CartDrawer.tsx`, `OrderSummary.tsx`)
- **Utilities**: camelCase (`cart-store.ts`, `utils.ts`)
- **API Routes**: `route.ts` in directory structure

### Variables
- **State**: camelCase (`currentStep`, `isLoading`)
- **Actions**: verb prefixes (`setStep`, `addItem`, `updateQuantity`)
- **Booleans**: `is`, `can`, `has` prefixes (`isOpen`, `canProceed`)
- **Types**: PascalCase (`Order`, `CartItem`, `ShippingMethod`)
- **Constants**: UPPER_SNAKE_CASE (`SHIPPING_THRESHOLD`)

---

## STYLING GUIDE

### Brand Colors
```css
--brand-forest: #2D4A3E;  /* Primary dark green */
--brand-sage: #B2D8C6;    /* Light teal accent */
--brand-blush: #FFC1CC;   /* Pink highlight */
--brand-cream: #F4E3B2;   /* Warm yellow */
--brand-sand: #F5F2EF;    /* Background */
```

### Component Patterns
- **Buttons**: `py-3 px-6 rounded-full shadow-lg`
- **Cards**: `rounded-2xl p-6 border border-stone-100`
- **Inputs**: `py-3 px-4 border border-stone-200 rounded-lg`
- **Glass effect**: `backdrop-blur-md bg-white/30`

### Responsive
- Mobile-first approach
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px)

---

## API ENDPOINTS

### Public
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/payment` | POST | Create order & payment intent |
| `/api/discount/validate` | POST | Validate discount code |
| `/api/econt/cities` | POST | Search cities |
| `/api/econt/offices` | POST | Search offices |
| `/api/econt/calculate` | POST | Calculate shipping |

### Admin (Protected)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/auth` | POST | Authenticate admin |
| `/api/admin/stats` | GET | Dashboard statistics |
| `/api/admin/orders` | GET/PATCH | Order management |
| `/api/admin/products` | GET/POST/PATCH | Product CRUD |
| `/api/admin/discounts` | GET/POST/PATCH | Discount CRUD |

### Webhooks
| Endpoint | Purpose |
|----------|---------|
| `/api/webhooks/stripe` | Stripe payment events |

---

## COMMON TASKS

### Adding a New Product Field
1. Update `supabase/migrations/` with new column
2. Update `src/lib/supabase/types.ts`
3. Update `src/types/index.ts` if needed
4. Update relevant components

### Adding a New API Route
1. Create `src/app/api/[route]/route.ts`
2. Implement GET/POST/PATCH/DELETE handlers
3. Add proper error handling
4. Update this documentation

### Modifying Checkout Flow
1. Update `src/stores/checkout-store.ts`
2. Modify relevant checkout components
3. Update validation in `src/lib/schemas/checkout.ts`
4. Test full flow end-to-end

---

## ENVIRONMENT VARIABLES

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Payment
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Shipping
ECONT_USERNAME=
ECONT_PASSWORD=
ECONT_API_URL=

# Admin
ADMIN_PASSWORD=

# App
NEXT_PUBLIC_APP_URL=
```

---

## ERROR HANDLING PATTERNS

### Client-Side
```typescript
try {
  const res = await fetch('/api/endpoint')
  if (!res.ok) throw new Error('Request failed')
  return await res.json()
} catch (error) {
  console.error('Error:', error)
  // Show user-friendly message
}
```

### Server-Side
```typescript
try {
  // ... operation
  return NextResponse.json({ data }, { status: 200 })
} catch (error) {
  console.error('Error:', error)
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'Server error' },
    { status: 500 }
  )
}
```

---

## TESTING CHECKLIST

Before submitting changes, verify:
- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] Checkout flow works end-to-end
- [ ] Admin dashboard loads correctly
- [ ] Mobile responsiveness is maintained
- [ ] No console errors in browser

---

## DO NOT

- Make changes without reading relevant files first
- Add unnecessary dependencies
- Over-engineer simple solutions
- Break existing functionality
- Commit secrets or credentials
- Skip error handling
- Ignore TypeScript errors
- Make assumptions about code you haven't read

---

## ALWAYS DO

- Read files before modifying them
- Ask clarifying questions when uncertain
- Explain changes at a high level
- Keep changes minimal and focused
- Follow existing patterns and conventions
- Test changes before completing
- Update documentation when needed

---

*Last updated: January 2026*
