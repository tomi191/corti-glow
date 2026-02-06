---
name: checkout-debug
description: Debug the checkout flow - cart, shipping (Econt), payment (Stripe), order creation. Use when checkout issues arise.
argument-hint: [issue-description or step - "cart", "shipping", "payment", "order"]
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash(npm run build:*)
---

# Debug Checkout Flow

Issue: **$ARGUMENTS**

The checkout flow is the most critical path in the app. Debug systematically.

## The Checkout Flow (5 steps):

### Step 1: Cart → Read these files:
- `src/stores/cart-store.ts` - Zustand store with localStorage persist
- `src/components/cart/CartDrawer.tsx` - Cart UI
- `src/components/cart/CartItem.tsx` - Item display
- `src/components/cart/AddToCartButton.tsx` - Add action
- `src/data/products.ts` - Product data with variants

Check:
- Cart items have correct `productId`, `variantId`, `price`, `quantity`
- `getSubtotal()` calculation is correct
- `isFreeShipping` threshold (160 BGN) works
- localStorage persistence works (check key: `lura-cart`)

### Step 2: Customer Info → Read:
- `src/stores/checkout-store.ts` - `currentStep: "info"`
- Checkout page components in `src/app/(checkout)/`
- `src/lib/schemas/checkout.ts` - Zod validation

Check:
- `canProceedToShipping` validation
- Phone regex: `/^(\+359|0)[0-9]{9}$/`
- Email validation
- Required fields: firstName, lastName, email, phone

### Step 3: Shipping (Econt) → Read:
- `src/stores/checkout-store.ts` - `currentStep: "shipping"`
- `src/lib/econt/client.ts` - Econt API client (Basic Auth)
- `src/lib/econt/cities.ts` - City search
- `src/lib/econt/offices.ts` - Office search
- `src/lib/econt/shipping.ts` - Cost calculation
- `src/app/api/econt/*/route.ts` - All Econt API routes

Check:
- Econt API credentials (ECONT_USERNAME, ECONT_PASSWORD)
- City search returns results
- Office search filters by city
- Shipping price calculation (office: 4.99, address: 6.99 BGN)
- `canProceedToPayment` validation

### Step 4: Payment (Stripe) → Read:
- `src/stores/checkout-store.ts` - `currentStep: "payment"`
- `src/lib/stripe/client.ts` - Stripe.js init
- `src/lib/stripe/actions.ts` - Server actions
- `src/app/api/payment/route.ts` - Payment intent creation

Check:
- Payment methods: "card" or "cod" (cash on delivery)
- Payment intent created with correct amount (in stotinki = BGN * 100)
- Price verified server-side from database
- Discount applied correctly
- `clientSecret` returned to frontend
- Stripe Elements renders correctly

### Step 5: Order Creation → Read:
- `src/app/api/payment/route.ts` - Full order creation flow
- `src/lib/actions/orders.ts` - `createOrder()`, `checkStock()`, `deductStock()`
- `src/app/api/webhooks/stripe/route.ts` - Post-payment webhook

Check:
- Order saved to Supabase with correct data
- Stock deducted after payment confirmation
- Webhook updates order status
- Order confirmation page receives order data

### Step 6: Success Page → Read:
- `src/app/(checkout)/uspeh/page.tsx` - Success/confirmation page

Check:
- Receives order ID from query params or state
- Displays order details correctly
- Cart cleared after successful order

## Common Issues:
1. **Hydration mismatch**: Cart store uses localStorage → needs `useEffect` guard
2. **Stripe amount**: Must be in stotinki (cents), not BGN
3. **Econt API timeout**: External API may be slow
4. **Stock race condition**: Multiple concurrent orders for same product
5. **Webhook missing**: Stripe webhook URL not configured in Stripe dashboard
6. **Cookie issues**: SameSite policy blocking cross-origin requests
