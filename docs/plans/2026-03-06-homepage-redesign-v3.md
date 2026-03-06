# Homepage Redesign v3.0 — "Warm Minimalism"

**Date:** 2026-03-06
**Status:** Approved
**Inspiration:** seed.com (scrollytelling), arrae.com (warmth, authenticity)

## Architecture: 12 sections -> 5

### New Sections
1. **ImmersiveHero** — Big Cormorant typography + parallax photo + "Shop by Concern" tags
2. **ScienceScrollytelling** — Sticky left image + scroll right text (3 ingredients)
3. **TheRitual** — Full-bleed editorial lifestyle photo + overlay text
4. **RawSocialProof** — Horizontal drag-scroll 9:16 story cards
5. **FrictionlessCheckout** — Clean flat bundle cards + subscription toggle

### Removed Sections
SocialProofBanner, PremiumFeatures, GlowGuideCTA, GlowGuideCTAMini, RealResults, PremiumIngredients, PremiumHowTo, BentoReviews, PremiumFAQ, PremiumCTA

### Design Principles
- **NO fade-in-up animations** — only useScroll/useTransform parallax
- **Warm beige background** — #F7F4F0 (not cold white)
- **Cormorant Garamond 300 italic** for hero headings
- **Minimal text** — let photos and typography do the work
- **Natural Bulgarian** — conversational tone, not robotic translations

### Color Evolution
- Background: #FAF8F5 -> #F7F4F0 (warmer)
- Forest #2D4A3E: accent only (CTA buttons, key text)
- Sage #B2D8C6: science elements only
- Blush #FFC1CC: emotional moments only

### Animation Rules
- useScroll + useTransform for parallax
- CSS transitions for hover states
- Framer Motion drag for horizontal scroll
- prefers-reduced-motion respected everywhere

### Target: ~600 lines (from ~1400)
