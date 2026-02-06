---
name: new-component
description: Create a new React component following the project's design system - Tailwind CSS 4, Framer Motion, brand colors, accessibility
argument-hint: [component-name] [description]
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Edit, Write, Bash(npm run build:*)
---

# Create New Component

Create: **$ARGUMENTS**

## Before Creating:

1. **Read existing similar components** to match patterns:
   - UI primitives: `src/components/ui/` (GlassCard, MagneticButton, ScrollReveal)
   - Home sections: `src/components/home/` (HeroSection, BundlesSection)
   - Cart components: `src/components/cart/` (CartDrawer, CartItem)
   - Layout: `src/components/layout/` (Header, Footer)

2. **Determine component type:**
   - Server Component (default) → No `"use client"`, can fetch data
   - Client Component → Only if needs: useState, useEffect, event handlers, browser APIs

3. **Read brand constants**: `src/lib/constants.ts` for colors and company info

## Brand Design System:

### Colors (use Tailwind classes):
- Primary dark: `bg-[#2D4A3E]` / `text-[#2D4A3E]` (forest green)
- Light accent: `bg-[#B2D8C6]` / `text-[#B2D8C6]` (sage)
- Pink highlight: `bg-[#FFC1CC]` / `text-[#FFC1CC]` (blush)
- Warm yellow: `bg-[#F4E3B2]` / `text-[#F4E3B2]` (cream)
- Background: `bg-[#F5F2EF]` (sand)

### Component Patterns:
- Buttons: `py-3 px-6 rounded-full shadow-lg`
- Cards: `rounded-2xl p-6 border border-stone-100`
- Inputs: `py-3 px-4 border border-stone-200 rounded-lg`
- Glass effect: `backdrop-blur-md bg-white/30`

### Animations (Framer Motion):
```typescript
import { motion } from "framer-motion";

// Fade in on scroll
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>
```

### Icons:
```typescript
import { IconName } from "lucide-react";
```

## Accessibility Requirements:
- Semantic HTML (`<button>`, `<nav>`, `<main>`, `<article>`)
- Alt text on all `<Image>` components
- `aria-label` on icon-only buttons
- `htmlFor` on form labels
- Touch targets minimum 44x44px
- Visible focus indicators

## File Structure:
```
src/components/<category>/
├── MyComponent.tsx     # Component file (PascalCase)
└── index.ts            # Barrel export (if new directory)
```

## Checklist:
- [ ] Correct `"use client"` directive (only if needed)
- [ ] Uses brand colors from design system
- [ ] Responsive (mobile-first: base → `sm:` → `md:` → `lg:`)
- [ ] Accessible (semantic HTML, aria labels, alt text)
- [ ] Uses `next/image` for images (not `<img>`)
- [ ] Animations with Framer Motion (not CSS)
- [ ] UI text is in Bulgarian
- [ ] `npm run build` passes
