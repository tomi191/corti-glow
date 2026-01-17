# ARCHITECTURE.md - LuraLab Technical Architecture

> Complete technical documentation of the LuraLab e-commerce platform architecture.

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Database Design](#database-design)
5. [State Management](#state-management)
6. [Payment Integration](#payment-integration)
7. [Shipping Integration](#shipping-integration)
8. [Security Model](#security-model)
9. [Data Flow Diagrams](#data-flow-diagrams)

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Next.js App (React 19)                                  │   │
│  │  ├── Pages (App Router)                                  │   │
│  │  ├── Components (UI Layer)                               │   │
│  │  └── Zustand Stores (State)                              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NEXT.JS SERVER                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  API Routes (/app/api/*)                                 │   │
│  │  ├── Payment API                                         │   │
│  │  ├── Admin API                                           │   │
│  │  ├── Econt API                                           │   │
│  │  └── Webhooks                                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Server Actions (lib/actions/*)                          │   │
│  │  └── Order management, checkout processing               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │  Supabase  │  │   Stripe   │  │   Econt    │                │
│  │ PostgreSQL │  │  Payments  │  │  Shipping  │                │
│  └────────────┘  └────────────┘  └────────────┘                │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | Next.js | 16.1.2 | Full-stack React framework |
| UI Library | React | 19.2.3 | Component rendering |
| Language | TypeScript | 5.x | Type safety |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Animation | Framer Motion | 12.x | Complex animations |
| State | Zustand | 5.x | Client state management |
| Database | Supabase | 2.90.x | PostgreSQL + Auth |
| Payment | Stripe | 20.x | Payment processing |
| Validation | Zod | 4.x | Schema validation |

---

## Frontend Architecture

### Route Structure (App Router)

```
src/app/
├── (marketing)/              # Route group - marketing pages
│   ├── page.tsx              # Homepage (/)
│   ├── layout.tsx            # Marketing layout (Header + Footer)
│   ├── produkt/              # Product page (/produkt)
│   ├── nauka/                # Science page (/nauka)
│   ├── pomosht/              # Help page (/pomosht)
│   ├── za-nas/               # About page (/za-nas)
│   ├── poveritelnost/        # Privacy (/poveritelnost)
│   └── obshti-usloviya/      # Terms (/obshti-usloviya)
│
├── (checkout)/               # Route group - checkout flow
│   ├── checkout/             # Checkout page (/checkout)
│   │   ├── page.tsx
│   │   ├── CheckoutForm.tsx
│   │   └── [components...]
│   ├── uspeh/                # Success page (/uspeh)
│   └── layout.tsx            # Checkout layout (minimal)
│
├── admin/                    # Admin dashboard (/admin/*)
│   ├── page.tsx              # Dashboard
│   ├── layout.tsx            # Admin layout
│   ├── porachki/             # Orders (/admin/porachki)
│   ├── produkti/             # Products (/admin/produkti)
│   ├── promocii/             # Discounts (/admin/promocii)
│   ├── klienti/              # Customers (/admin/klienti)
│   └── nastroyki/            # Settings (/admin/nastroyki)
│
└── api/                      # API routes
    ├── payment/
    ├── admin/
    ├── econt/
    ├── discount/
    └── webhooks/
```

### Component Hierarchy

```
RootLayout (src/app/layout.tsx)
├── Providers
│   └── SmoothScrollProvider (Lenis)
│
├── Marketing Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── Navigation
│   │   └── CartBadge
│   ├── [Page Content]
│   ├── Footer
│   └── CartDrawer (overlay)
│
├── Checkout Layout
│   └── [Minimal header + content]
│
└── Admin Layout
    ├── Sidebar Navigation
    └── [Admin Content]
```

### Component Organization

```
src/components/
├── cart/                     # Shopping cart components
│   ├── CartDrawer.tsx        # Slide-over cart panel
│   ├── CartItem.tsx          # Single cart item
│   ├── CartBadge.tsx         # Header cart count
│   ├── AddToCartButton.tsx   # Add to cart CTA
│   └── index.ts              # Barrel export
│
├── home/                     # Homepage sections
│   ├── PremiumHero.tsx       # Hero with 3D elements
│   ├── PremiumFeatures.tsx   # Features grid
│   ├── PremiumIngredients.tsx# Ingredient cards
│   ├── PremiumHowTo.tsx      # How to use steps
│   ├── PremiumBundles.tsx    # Product variants
│   ├── BentoReviews.tsx      # Reviews grid
│   ├── PremiumFAQ.tsx        # FAQ accordion
│   ├── PremiumCTA.tsx        # Call to action
│   ├── MobileStickyBar.tsx   # Mobile sticky CTA
│   └── index.ts
│
├── layout/                   # Layout components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── MobileMenu.tsx
│   └── index.ts
│
├── ui/                       # Reusable primitives
│   ├── GlassCard.tsx         # Glassmorphism card
│   ├── ScrollReveal.tsx      # Scroll animation
│   ├── AnimatedText.tsx      # Text animations
│   ├── MagneticButton.tsx    # Magnetic hover
│   └── index.ts
│
└── providers/                # Context providers
    ├── SmoothScroll.tsx      # Lenis smooth scroll
    └── PageTransition.tsx    # Page transitions
```

---

## Backend Architecture

### API Routes Structure

```
src/app/api/
├── payment/
│   └── route.ts              # POST: Create order + payment
│                             # GET: Payment status
│
├── admin/
│   ├── auth/
│   │   └── route.ts          # POST: Admin login
│   ├── stats/
│   │   └── route.ts          # GET: Dashboard stats
│   ├── orders/
│   │   ├── route.ts          # GET: List, PATCH: Update
│   │   └── [id]/
│   │       └── route.ts      # GET: Single order
│   ├── products/
│   │   ├── route.ts          # GET/POST: Products
│   │   └── [id]/
│   │       └── route.ts      # GET/PATCH/DELETE
│   ├── customers/
│   │   └── route.ts          # GET: Customer list
│   └── discounts/
│       ├── route.ts          # GET/POST: Discounts
│       └── [id]/
│           └── route.ts      # PATCH/DELETE
│
├── econt/
│   ├── cities/
│   │   └── route.ts          # GET/POST: City search
│   ├── offices/
│   │   └── route.ts          # POST: Office search
│   ├── calculate/
│   │   └── route.ts          # POST: Shipping cost
│   ├── shipment/
│   │   └── route.ts          # POST: Create shipment
│   └── track/
│       └── [id]/
│           └── route.ts      # GET: Track shipment
│
├── discount/
│   └── validate/
│       └── route.ts          # POST: Validate code
│
└── webhooks/
    └── stripe/
        └── route.ts          # POST: Stripe events
```

### Server Actions

```
src/lib/actions/
├── orders.ts                 # Order CRUD operations
│   ├── createOrder()         # Create new order
│   ├── getOrder()            # Get by ID
│   ├── getOrderByNumber()    # Get by order number
│   ├── updateOrder()         # Update fields
│   ├── updateOrderStatus()   # Update status
│   └── listOrders()          # Query with filters
│
└── checkout.ts               # Checkout processing
    └── submitOrder()         # Validate and process
```

### Library Modules

```
src/lib/
├── supabase/
│   ├── client.ts             # createBrowserClient()
│   ├── server.ts             # createServerClient()
│   └── types.ts              # Database types
│
├── stripe/
│   ├── client.ts             # Stripe server instance
│   ├── actions.ts            # createPaymentIntent(), etc.
│   ├── types.ts              # Stripe types
│   └── index.ts
│
├── econt/
│   ├── client.ts             # EcontClient class
│   ├── cities.ts             # City functions
│   ├── offices.ts            # Office functions
│   ├── shipping.ts           # Calculate shipping
│   ├── shipments.ts          # Create/track shipments
│   ├── types.ts              # Econt API types
│   └── index.ts
│
├── schemas/
│   └── checkout.ts           # Zod validation schemas
│
├── constants.ts              # App constants
└── utils.ts                  # Utility functions
```

---

## Database Design

### Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐
│    products     │     │    discounts    │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ slug (UNIQUE)   │     │ code (UNIQUE)   │
│ name            │     │ type            │
│ price           │     │ value           │
│ variants (JSON) │     │ active          │
│ ingredients     │     │ min_order_value │
│ stock           │     │ max_uses        │
│ status          │     │ used_count      │
│ published       │     └─────────────────┘
└─────────────────┘              │
        │                        │ references
        │ references (JSON)      │
        ▼                        ▼
┌─────────────────────────────────────────┐
│                orders                    │
├─────────────────────────────────────────┤
│ id (PK)                                 │
│ order_number (UNIQUE)                   │
│ customer_* (first_name, last_name...)   │
│ shipping_* (method, address, price...)  │
│ econt_* (shipment_id, tracking...)      │
│ payment_* (method, status, stripe_id)   │
│ items (JSONB) ─────────────────────┐    │
│ subtotal, discount_code,           │    │
│ discount_amount, total             │    │
│ status, notes                      │    │
└─────────────────────────────────────────┘
                                     │
        ┌────────────────────────────┘
        ▼
┌─────────────────┐     ┌─────────────────┐
│  econt_cities   │     │  econt_offices  │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │◄────│ city_id (FK)    │
│ name            │     │ id (PK)         │
│ region          │     │ name            │
│ post_code       │     │ address         │
└─────────────────┘     │ latitude        │
                        │ longitude       │
                        └─────────────────┘

┌─────────────────────────────────────────┐
│          customers (VIEW)                │
├─────────────────────────────────────────┤
│ Derived from orders table               │
│ email, first_name, last_name, phone     │
│ order_count, total_spent                │
└─────────────────────────────────────────┘
```

### Table Schemas

#### products
```sql
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  sku TEXT UNIQUE,
  barcode TEXT,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL,
  flavor TEXT,
  servings INTEGER,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  image TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 100,
  low_stock_threshold INTEGER DEFAULT 10,
  track_inventory BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'draft', 'archived')),
  badge TEXT,
  features JSONB DEFAULT '[]',
  ingredients JSONB DEFAULT '[]',
  variants JSONB DEFAULT '[]',
  how_to_use JSONB,
  meta_title TEXT,
  meta_description TEXT,
  weight DECIMAL(10,3) DEFAULT 0.5,
  dimensions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published BOOLEAN DEFAULT true
);
```

#### orders
```sql
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Customer
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,

  -- Shipping
  shipping_method TEXT NOT NULL
    CHECK (shipping_method IN ('econt_office', 'econt_address', 'speedy')),
  shipping_address JSONB NOT NULL,
  shipping_price DECIMAL(10,2) NOT NULL,
  shipping_weight DECIMAL(10,3),

  -- Econt
  econt_shipment_id TEXT,
  econt_tracking_number TEXT,
  econt_label_url TEXT,
  econt_label_generated_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  estimated_delivery_date DATE,

  -- Payment
  payment_method TEXT NOT NULL
    CHECK (payment_method IN ('card', 'cod')),
  payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT,

  -- Order
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  discount_code TEXT,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'new'
    CHECK (status IN ('new', 'processing', 'shipped', 'delivered', 'cancelled')),
  notes TEXT
);
```

#### discounts
```sql
CREATE TABLE discounts (
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
  applies_to TEXT DEFAULT 'all'
    CHECK (applies_to IN ('all', 'specific_products', 'specific_variants')),
  product_ids UUID[],
  variant_ids TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes

```sql
-- Products
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_published ON products(published);

-- Discounts
CREATE INDEX idx_discounts_code ON discounts(code);
CREATE INDEX idx_discounts_active ON discounts(active);

-- Orders
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

### Row Level Security

```sql
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Public read for published products
CREATE POLICY "Anon read published products"
  ON products FOR SELECT
  USING (published = true AND status = 'active');

-- Public read for active discounts
CREATE POLICY "Anon read active discounts"
  ON discounts FOR SELECT
  USING (active = true);

-- Service role full access
CREATE POLICY "Service role products"
  ON products FOR ALL TO service_role
  USING (true) WITH CHECK (true);
```

---

## State Management

### Cart Store (Zustand)

```typescript
// src/stores/cart-store.ts

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

interface CartActions {
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

interface CartGetters {
  getItemCount: () => number;
  getSubtotal: () => number;
  isFreeShipping: () => boolean;
  getShippingProgress: () => number;
  getRemainingForFreeShipping: () => number;
}

// Persistence via localStorage
// Key: "lura-cart"
// Only items array persisted
```

### Checkout Store (Zustand)

```typescript
// src/stores/checkout-store.ts

interface CheckoutState {
  currentStep: 'info' | 'shipping' | 'payment' | 'review';

  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };

  shipping: {
    method: 'econt_office' | 'econt_address';
    selectedOffice?: SimpleEcontOffice;
    city?: string;
    postCode?: string;
    street?: string;
    building?: string;
    apartment?: string;
    price: number;
    estimatedDays: number;
  };

  payment: {
    method: 'card' | 'cod';
    clientSecret?: string;
    paymentIntentId?: string;
  };

  orderId?: string;
  orderNumber?: string;
  isLoading: boolean;
  error?: string;
}

// Validators
canProceedToShipping(): boolean;
canProceedToPayment(): boolean;
canSubmitOrder(): boolean;
```

### State Flow

```
User Action → Store Action → State Update → Component Re-render
     │              │              │
     │              │              └─► localStorage (cart only)
     │              │
     │              └─► Validation (checkout validators)
     │
     └─► API Call (if needed)
```

---

## Payment Integration

### Stripe Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    PAYMENT FLOW                                 │
└────────────────────────────────────────────────────────────────┘

1. User selects "Card" payment
   │
2. CheckoutForm renders StripePaymentForm
   │
3. User enters card details in Stripe Elements
   │
4. User clicks "Confirm Order"
   │
5. Client calls POST /api/payment
   │
   ├─► Server validates order data
   ├─► Server creates order in Supabase (payment_status: 'pending')
   ├─► Server calls stripe.paymentIntents.create()
   │   {
   │     amount: total * 100 (cents),
   │     currency: 'eur',
   │     metadata: { orderId, customerEmail }
   │   }
   └─► Server returns { clientSecret, paymentIntentId }
   │
6. Client receives clientSecret
   │
7. Client calls stripe.confirmCardPayment(clientSecret, {
     payment_method: { card: cardElement }
   })
   │
8. Stripe processes payment
   │
9. Stripe sends webhook: POST /api/webhooks/stripe
   │
   ├─► Verify signature with STRIPE_WEBHOOK_SECRET
   ├─► Handle event type:
   │   ├─► payment_intent.succeeded
   │   │   └─► Update order: payment_status = 'paid', status = 'processing'
   │   ├─► payment_intent.payment_failed
   │   │   └─► Update order: payment_status = 'failed'
   │   └─► charge.refunded
   │       └─► Update order: payment_status = 'refunded'
   └─► Return 200 OK
   │
10. Redirect to /uspeh (success page)
```

### Server Actions

```typescript
// src/lib/stripe/actions.ts

createPaymentIntent(params: {
  amount: number;
  currency: string;
  metadata: { orderId, customerEmail, customerName };
}): Promise<{ clientSecret, paymentIntentId }>;

updatePaymentIntent(
  paymentIntentId: string,
  amount: number,
  metadata?: object
): Promise<PaymentIntent>;

cancelPaymentIntent(
  paymentIntentId: string
): Promise<PaymentIntent>;

getPaymentIntentStatus(
  paymentIntentId: string
): Promise<{ status, amount, currency }>;

createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: string
): Promise<{ refundId, status }>;
```

---

## Shipping Integration

### Econt API Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    ECONT INTEGRATION                            │
└────────────────────────────────────────────────────────────────┘

Authentication: Basic HTTP Auth
Endpoint: https://demo.econt.com/ee/services/ (demo)
          https://ee.econt.com/services/     (production)

┌─────────────────┐
│  EcontClient    │
├─────────────────┤
│ - username      │
│ - password      │
│ - baseUrl       │
├─────────────────┤
│ + request()     │
│ + getNomenclatures() │
└─────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│              API Services                │
├─────────────────────────────────────────┤
│ Nomenclatures/NomenclaturesService      │
│ ├─ .getNomenclatures (cities, offices)  │
│                                          │
│ Shipments/LabelService                   │
│ ├─ .createLabel                          │
│ ├─ .calculateLabel                       │
│                                          │
│ Shipments/ShipmentService                │
│ ├─ .getShipmentStatuses                  │
└─────────────────────────────────────────┘
```

### Shipping Calculation Flow

```
1. User selects city in checkout
   │
2. Client: POST /api/econt/cities
   │
3. Server: EcontClient.getNomenclatures('cities')
   │
4. Client displays city dropdown
   │
5. User selects city
   │
6. Client: POST /api/econt/offices { cityName }
   │
7. Server: Filter offices by city
   │
8. Client displays office list
   │
9. User selects office
   │
10. Client: POST /api/econt/calculate {
      senderOfficeCode,
      receiverOfficeCode,
      weight,
      packCount
    }
    │
11. Server: EcontClient.request('Shipments/LabelService.calculateLabel')
    │
12. Server returns: { price, currency, deliveryDays }
    │
13. Client: useCheckoutStore.setShippingPrice(price, days)
```

### Shipment Creation

```typescript
// When order is processed

const shipment = await createShipment({
  senderClient: {
    name: 'LuraLab',
    phones: ['0888123456']
  },
  receiverClient: {
    name: `${order.customer_first_name} ${order.customer_last_name}`,
    phones: [order.customer_phone]
  },
  receiverOfficeCode: order.shipping_address.officeCode,
  packCount: 1,
  shipmentType: 'PACK',
  weight: 0.5,
  services: {
    cdAmount: order.total,  // Cash on delivery amount
    cdType: 'GET',
    cdCurrency: 'EUR',
    smsNotification: true
  }
});

// Response
{
  shipmentNumber: '1234567890',
  pdfURL: 'https://...',
  trackingNumber: '1234567890'
}

// Update order
await updateOrder(orderId, {
  econt_shipment_id: shipment.shipmentNumber,
  econt_tracking_number: shipment.trackingNumber,
  econt_label_url: shipment.pdfURL
});
```

---

## Security Model

### Authentication Layers

```
┌─────────────────────────────────────────┐
│            PUBLIC ACCESS                 │
├─────────────────────────────────────────┤
│ - Read published products               │
│ - Read active discounts                 │
│ - Validate discount codes               │
│ - Calculate shipping                    │
│ - Create orders                         │
│ - Process payments                      │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│           ADMIN ACCESS                   │
├─────────────────────────────────────────┤
│ Authentication: Simple password         │
│ Endpoint: POST /api/admin/auth          │
│ Validation: password === ADMIN_PASSWORD │
├─────────────────────────────────────────┤
│ Permissions:                            │
│ - Full CRUD on all tables               │
│ - View dashboard statistics             │
│ - Manage orders (status, tracking)      │
│ - Manage products (draft/publish)       │
│ - Create/modify discounts               │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│          SERVICE ROLE                    │
├─────────────────────────────────────────┤
│ Used by: Server-side operations         │
│ Key: SUPABASE_SERVICE_ROLE_KEY          │
│ Bypasses all RLS policies               │
│ Full database access                    │
└─────────────────────────────────────────┘
```

### Security Measures

| Area | Measure |
|------|---------|
| Database | Row Level Security (RLS) enabled |
| API Keys | Environment variables only |
| Webhooks | Stripe signature verification |
| CORS | Next.js built-in handling |
| Validation | Zod schemas for all inputs |
| Auth | Password for admin (basic) |

### Future Improvements

- [ ] Implement JWT tokens for admin
- [ ] Add session expiration
- [ ] Consider Supabase Auth integration
- [ ] Add rate limiting
- [ ] Implement CSRF protection

---

## Data Flow Diagrams

### Complete Order Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPLETE ORDER FLOW                           │
└─────────────────────────────────────────────────────────────────┘

BROWSE
  │
  ├─► View products (homepage)
  │   └─► Data from: src/data/products.ts (static)
  │       OR Supabase products table (dynamic)
  │
  └─► Add to cart
      │
      └─► useCartStore.addItem()
          └─► localStorage persist

CHECKOUT
  │
  ├─► Step 1: Customer Info
  │   ├─► Form validation (Zod)
  │   └─► useCheckoutStore.setCustomer()
  │
  ├─► Step 2: Shipping
  │   ├─► Select method (office/address)
  │   ├─► Search city → POST /api/econt/cities
  │   ├─► Select office → POST /api/econt/offices
  │   ├─► Calculate shipping → POST /api/econt/calculate
  │   └─► useCheckoutStore.setShippingPrice()
  │
  ├─► Step 3: Payment
  │   ├─► Select method (card/cod)
  │   └─► If card: Render Stripe Elements
  │
  └─► Step 4: Review & Submit
      │
      └─► POST /api/payment
          │
          ├─► Create order in Supabase
          │
          ├─► If card payment:
          │   ├─► Create PaymentIntent
          │   ├─► Return clientSecret
          │   ├─► Client confirms with Stripe
          │   └─► Webhook updates order
          │
          └─► If COD:
              └─► Order created with pending payment

POST-ORDER
  │
  ├─► Redirect to /uspeh
  │
  ├─► Admin: View in /admin/porachki
  │   ├─► Update status
  │   └─► Generate Econt label
  │
  └─► Customer: Receives tracking number
```

### Admin Dashboard Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD FLOW                          │
└─────────────────────────────────────────────────────────────────┘

LOGIN
  │
  └─► POST /api/admin/auth { password }
      │
      ├─► If valid: Store auth state
      └─► If invalid: Show error

DASHBOARD (/admin)
  │
  └─► GET /api/admin/stats
      │
      └─► Returns:
          ├─► totalOrders
          ├─► totalRevenue
          ├─► pendingOrders
          └─► shippedOrders

ORDERS (/admin/porachki)
  │
  ├─► GET /api/admin/orders?limit=10&status=new
  │   └─► Returns: { orders: Order[], count: number }
  │
  └─► Order Detail (/admin/porachki/[id])
      │
      ├─► GET /api/admin/orders/[id]
      │
      └─► Actions:
          ├─► Update status → PATCH /api/admin/orders/[id]
          ├─► Generate label → POST /api/econt/shipment
          └─► Mark shipped → PATCH with shipped_at

PRODUCTS (/admin/produkti)
  │
  ├─► GET /api/admin/products
  ├─► Create → POST /api/admin/products
  ├─► Edit → PATCH /api/admin/products/[id]
  └─► Archive → PATCH status = 'archived'

DISCOUNTS (/admin/promocii)
  │
  ├─► GET /api/admin/discounts
  ├─► Create → POST /api/admin/discounts
  └─► Toggle → PATCH active = true/false
```

---

## Performance Considerations

### Optimization Strategies

| Area | Strategy |
|------|----------|
| Images | Next.js Image component (auto-optimization) |
| Code Splitting | Route-based (App Router automatic) |
| State | Zustand (minimal re-renders) |
| Animations | Framer Motion (GPU-accelerated) |
| Caching | localStorage for cart |
| Database | Indexed columns for queries |

### Bundle Analysis

- Main bundle: ~150KB (gzipped)
- React + Next.js: ~80KB
- Framer Motion: ~40KB
- Zustand: ~2KB
- Three.js: Loaded only on homepage (~100KB)

---

*Last updated: January 2026*
