# CLAUDE.md - LuraLab Project Instructions

## ⚠️ ЗАКОН: Пълен Анализ При Поправка на Грешки

КРИТИЧНО ВАЖНО - ЗАДЪЛЖИТЕЛНО ПРИ ВСЯКА ПОПРАВКА:

Когато ти бъде поискано да поправиш грешка, НИКОГА не поправяй само видимата грешка. ВИНАГИ извършвай пълен анализ:

### Стъпки за анализ (ЗАДЪЛЖИТЕЛНИ):
Анализирай типовете данни - Провери interface/type дефинициите. Ако променяш тип на едно място, провери ВСИЧКИ места където се използва.

2. Проследи зависимостите - Използвай Grep за да намериш ВСИЧКИ файлове които:
   - Импортират променената функция/тип/константа
   - Извикват променената функция
   - Използват променения тип

3. Провери веригата от данни - Ако данните минават през няколко функции (A → B → C → D), провери ВСЯКА функция в веригата.

4. Валидирай с TypeScript - След всяка промяна, стартирай `npm run build` за да хванеш скрити грешки.

5. Тествай edge cases - Провери какво се случва с:
   - Null/undefined стойности
   - Празни масиви/обекти
   - Граничи стойности (0, -1, max)

### Примери за пълен анализ:


❌ ГРЕШНО: Поправям само реда с грешката
✅ ПРАВИЛНО: Анализирам целия flow на данните и поправям всички свързани места

❌ ГРЕШНО: "Готово е" без да съм пуснал build
✅ ПРАВИЛНО: Пускам npm run build и проверявам за скрити грешки

❌ ГРЕШНО: Променям тип в interface без да проверя къде се използва
✅ ПРАВИЛНО: Grep-вам за всички употреби и ги обновявам


### Чеклист преди да кажа "Готово":

- [ ] Прочетох ВСИЧКИ свързани файлове
- [ ] Проследих веригата на данните от начало до край
- [ ] Провених типовете съвпадат навсякъде
- [ ] Пуснах `npm run build` и минава успешно
- [ ] Няма hardcoded стойности които трябва да са динамични
- [ ] Fallback стойностите са правилни за всички случаи

**НИКОГА не казвай "готово" ако не си изпълнил този анализ!**

> This file contains instructions for Claude when working on this codebase.
> **Last updated: January 2026** | Next.js 16 | React 19 | TypeScript 5.5+

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
│   ├── (checkout)/         # Checkout flow pages (route group)
│   ├── (marketing)/        # Landing & marketing pages
│   ├── admin/              # Admin dashboard (protected)
│   ├── api/                # API routes
│   ├── layout.tsx          # Root layout
│   ├── sitemap.ts          # Dynamic sitemap generation
│   └── robots.ts           # Robots.txt configuration
├── components/             # React components
│   ├── cart/               # Shopping cart
│   ├── checkout/           # Checkout flow
│   ├── home/               # Homepage sections
│   ├── layout/             # Header, Footer, etc.
│   ├── ui/                 # Reusable UI primitives
│   └── providers/          # Context/Provider components
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

## BEST PRACTICES 2026

### 1. File Organization

**Route Groups** - Use parentheses to organize without affecting URL:
```
app/
├── (checkout)/       # /checkout, /uspeh
├── (marketing)/      # /, /produkt, /nauka
└── admin/            # /admin/*
```

**Component Structure** - Keep components focused:
```
components/cart/
├── CartDrawer.tsx    # Main component
├── CartItem.tsx      # Child component
├── types.ts          # Local types (if needed)
└── index.ts          # Barrel export
```

**Import Pattern:**
```typescript
// Good - use barrel exports
import { CartDrawer, CartItem } from '@/components/cart';

// Avoid - deep imports
import CartDrawer from '@/components/cart/CartDrawer';
```

---

### 2. Security Best Practices

#### Authentication in Middleware
```typescript
// middleware.ts - Protect admin routes
export default function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
        const authCookie = request.cookies.get("admin_session")?.value;

        // Allow public admin paths
        if (path === "/admin/login" || path === "/api/admin/auth") {
            return NextResponse.next();
        }

        if (authCookie !== "authenticated") {
            if (path.startsWith("/api/")) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }
    }
    return NextResponse.next();
}
```

#### HTTP-Only Cookies
```typescript
// Always use secure cookie settings
cookieStore.set("session_token", token, {
    httpOnly: true,                              // Prevent XSS access
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "strict",                          // CSRF protection
    maxAge: 60 * 60 * 24,                        // 1 day expiry
    path: "/"
});
```

#### Never Trust Client Data for Prices
```typescript
// Always verify prices server-side
const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", item.productId)
    .single();

const verifiedPrice = Number(product.price); // Server-verified, not client
```

#### Input Validation with Zod
```typescript
// lib/schemas/checkout.ts
export const checkoutSchema = z.object({
    firstName: z.string().min(2, "Минимум 2 символа"),
    email: z.string().email("Невалиден имейл"),
    phone: z.string().regex(/^(\+359|0)[0-9]{9}$/, "Невалиден телефон"),
});

// In API route
const validated = checkoutSchema.safeParse(body);
if (!validated.success) {
    return NextResponse.json({ errors: validated.error.flatten() }, { status: 400 });
}
```

#### SQL Injection Prevention
```typescript
// Sanitize search inputs for Supabase queries
const sanitizedSearch = search
    .replace(/[%_,()]/g, '')  // Remove wildcards and special chars
    .trim()
    .slice(0, 100);           // Limit length

if (sanitizedSearch) {
    query = query.or(`name.ilike.%${sanitizedSearch}%`);
}
```

#### Environment Variables
```bash
# NEVER commit these files:
# .env.local, .env.production.local

# Public (exposed to browser) - prefix with NEXT_PUBLIC_
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=xxx

# Private (server-only) - NO prefix
SUPABASE_SERVICE_ROLE_KEY=xxx
STRIPE_SECRET_KEY=xxx
ADMIN_PASSWORD=xxx  # MUST be set, no default fallback!
```

---

### 3. Performance Optimization

#### Server vs Client Components
```typescript
// Default: Server Component (fetches data)
export default async function ProductPage() {
    const product = await getProduct("corti-glow");
    return <ProductDetail product={product} />;
}

// "use client" only for interactivity
"use client";
export function CartDrawer() {
    const { items } = useCartStore();  // Client-side state
    return (...);
}
```

**Rules:**
- Default to Server Components
- Use `"use client"` only for: useState, useEffect, event handlers, browser APIs
- Keep client components small and at leaf nodes
- Fetch data in server components, pass to client as props

#### Image Optimization
```typescript
import Image from "next/image";

<Image
    src={product.image}
    alt={product.name}
    width={600}
    height={600}
    priority={isAboveFold}        // true for hero images
    placeholder="blur"
    blurDataURL={blurHash}
/>
```

#### Dynamic Imports for Heavy Components
```typescript
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("./HeavyChart"), {
    loading: () => <LoadingSkeleton />,
    ssr: false  // Client-only if needed
});
```

#### Caching
```typescript
// Page-level revalidation (ISR)
export const revalidate = 3600; // Revalidate every hour

// Fetch-level caching
const data = await fetch(url, {
    next: { revalidate: 3600 }
});
```

---

### 4. Database Best Practices (Supabase)

#### Separate Clients
```typescript
// Browser client - uses anon key (restricted by RLS)
// lib/supabase/client.ts
export function createClient() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

// Server client - uses service role key (full access)
// lib/supabase/server.ts
export function createServerClient() {
    return createSupabaseClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}
```

#### Row-Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Anon can only read published, active products
CREATE POLICY "Anon read published products" ON products
FOR SELECT USING (published = true AND status = 'active');

-- Service role has full access
CREATE POLICY "Service role full access" ON products FOR ALL USING (true);
```

#### Always Add Indexes
```sql
-- Index frequently queried columns
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

#### Use JSONB for Flexible Data
```sql
-- Good for: variants, features, shipping address
variants JSONB DEFAULT '[]',
shipping_address JSONB NOT NULL,
```

---

### 5. State Management

| Use Case | Solution |
|----------|----------|
| Server data (products, orders) | Server Components + fetch |
| Shopping cart | Zustand + localStorage persist |
| Multi-step forms (checkout) | Zustand |
| UI state (modal open) | useState or Zustand |
| Authentication | Server Components + Cookies |

#### Zustand Store Pattern
```typescript
// stores/cart-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (item) => set((state) => ({
                items: [...state.items, item]
            })),

            getSubtotal: () =>
                get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        }),
        {
            name: "lura-cart",  // localStorage key
        }
    )
);
```

---

### 6. TypeScript Best Practices

#### Strict Mode Enabled
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

#### Let TypeScript Infer
```typescript
// Avoid unnecessary explicit types
const count = 5;                    // TypeScript knows it's number
const items = cart.getItems();      // TypeScript knows the return type

// Only add types when needed
function getProduct(slug: string): Promise<Product | null> {
    // ...
}
```

#### Zod for Runtime Validation
```typescript
import { z } from "zod";

export const orderSchema = z.object({
    items: z.array(z.object({
        productId: z.string().uuid(),
        quantity: z.number().positive()
    })).min(1),
    email: z.string().email()
});

export type OrderInput = z.infer<typeof orderSchema>;
```

---

### 7. API Route Best Practices

#### Standard Error Response Format
```typescript
// Success
return NextResponse.json({ success: true, data: {...} }, { status: 200 });

// Client error
return NextResponse.json({ error: "Validation failed", code: "INVALID_INPUT" }, { status: 400 });

// Server error
return NextResponse.json({ error: "Internal server error" }, { status: 500 });
```

#### Input Validation Template
```typescript
export async function POST(request: NextRequest) {
    try {
        // 1. Parse JSON
        const body = await request.json();

        // 2. Validate with Zod
        const validated = schema.safeParse(body);
        if (!validated.success) {
            return NextResponse.json(
                { errors: validated.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        // 3. Process
        const result = await processData(validated.data);

        // 4. Return success
        return NextResponse.json({ success: true, data: result });

    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Server error" },
            { status: 500 }
        );
    }
}
```

#### Pagination Pattern
```typescript
const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
const offset = parseInt(searchParams.get("offset") || "0");

const { data, count } = await supabase
    .from("orders")
    .select("*", { count: "exact" })
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false });

return NextResponse.json({
    data,
    pagination: { total: count, limit, offset }
});
```

---

### 8. SEO Best Practices

#### Metadata Configuration
```typescript
// app/layout.tsx
export const metadata: Metadata = {
    metadataBase: new URL("https://luralab.eu"),
    title: {
        default: "LURA | Corti-Glow",
        template: "%s | LURA"
    },
    description: "...",
    openGraph: {
        type: "website",
        locale: "bg_BG",
        images: [{ url: "/og-image.png", width: 1200, height: 630 }]
    },
    robots: { index: true, follow: true }
};
```

#### Sitemap (Dynamic)
```typescript
// app/sitemap.ts
export default function sitemap(): MetadataRoute.Sitemap {
    return [
        { url: "https://luralab.eu", changeFrequency: "weekly", priority: 1 },
        { url: "https://luralab.eu/produkt", changeFrequency: "daily", priority: 0.9 },
    ];
}
```

#### Robots.txt
```typescript
// app/robots.ts
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [{
            userAgent: "*",
            allow: "/",
            disallow: ["/admin/", "/api/", "/checkout/"]
        }],
        sitemap: "https://luralab.eu/sitemap.xml"
    };
}
```

---

### 9. Accessibility (A11y) Checklist

- [ ] Semantic HTML (`<button>`, `<nav>`, `<main>`, `<article>`)
- [ ] Alt text on all images
- [ ] ARIA labels on icon buttons
- [ ] Color contrast 4.5:1 (WCAG AA)
- [ ] Keyboard navigation support
- [ ] Form labels with `htmlFor`
- [ ] Focus indicators visible
- [ ] Touch targets min 44x44px

```typescript
// Good accessibility
<button
    aria-label="Премахни от количката"
    onClick={handleRemove}
>
    <TrashIcon aria-hidden="true" />
</button>

<label htmlFor="email">Имейл</label>
<input
    id="email"
    type="email"
    required
    aria-required="true"
    aria-describedby="email-error"
/>
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
| `src/lib/supabase/client.ts` | Browser client (anon) |
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

## API ENDPOINTS

### Public
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/payment` | POST | Create order & payment intent |
| `/api/discount/validate` | POST | Validate discount code |
| `/api/econt/cities` | POST | Search cities |
| `/api/econt/offices` | POST | Search offices |
| `/api/econt/calculate` | POST | Calculate shipping |

### Admin (Protected by Middleware)
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

## ENVIRONMENT VARIABLES

```env
# Required - Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Required - Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Required - Econt
ECONT_USERNAME=
ECONT_PASSWORD=
ECONT_API_URL=

# Required - Admin (NO DEFAULT!)
ADMIN_PASSWORD=

# Required - App
NEXT_PUBLIC_APP_URL=
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

## TESTING CHECKLIST

Before submitting changes, verify:
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Checkout flow works end-to-end
- [ ] Admin dashboard loads correctly
- [ ] Mobile responsiveness is maintained
- [ ] No console errors in browser
- [ ] Input validation works (try invalid data)
- [ ] RLS policies allow/deny correctly

---

## PRODUCTION CHECKLIST

### Security
- [ ] ADMIN_PASSWORD is set (not default)
- [ ] RLS policies enabled on all tables
- [ ] Input validation with Zod
- [ ] SQL injection prevention (sanitized inputs)
- [ ] Stripe webhook signature verification
- [ ] HTTP-only secure cookies

### Performance
- [ ] Images use `next/image`
- [ ] React Compiler enabled
- [ ] Bundle size < 200KB gzipped
- [ ] Core Web Vitals passing

### SEO
- [ ] Meta tags configured
- [ ] Sitemap generated
- [ ] Robots.txt configured
- [ ] Open Graph images

### Monitoring
- [ ] Error logging configured
- [ ] Uptime monitoring
- [ ] Analytics tracking

---

## DO NOT

- Make changes without reading relevant files first
- Add unnecessary dependencies
- Over-engineer simple solutions
- Break existing functionality
- Commit secrets or credentials
- Skip input validation
- Ignore TypeScript errors
- Use default fallback for sensitive configs (like ADMIN_PASSWORD)
- Trust client-submitted prices

---

## ALWAYS DO

- Read files before modifying them
- Ask clarifying questions when uncertain
- Explain changes at a high level
- Keep changes minimal and focused
- Follow existing patterns and conventions
- Test changes before completing
- Update documentation when needed
- Validate all user input server-side
- Use RLS policies in Supabase
- Sanitize search inputs

---

*Last updated: January 2026*
