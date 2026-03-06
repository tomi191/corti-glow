# Homepage v4.0 "Full Cinematic" — Design Document

> Approved: 2026-03-06
> Style: Seed.com-inspired, Concern-based navigation, Problem-first positioning
> Status: APPROVED — ready for implementation

---

## Design Principles

### Fluidity
- Background `#F7F4F0` for ALL sections (no "boxes")
- Sections flow into each other via typography and whitespace
- No visible section dividers except subtle color shifts

### Animation Rules
- ONLY `useScroll` / `useTransform` / `useSpring` (Framer Motion)
- NO `initial` / `animate` / `whileInView` fade-in-up patterns
- Sticky scroll for scrollytelling
- Parallax for images and timeline dots

### Typography
- Headlines: Cormorant Garamond 300 italic, negative letter-spacing (-0.03em)
- Body: Plus Jakarta Sans (system sans-serif fallback)
- Sizes: `clamp()` for responsive scaling
- Only 2-3 font weights (300, 400, 600)

### Colors
- Background: `#F7F4F0` (warm beige)
- Primary text/CTA: `#2D4A3E` (forest green)
- Accents (minimal): `#B2D8C6` (sage), `#FFC1CC` (blush), `#F4E3B2` (cream)
- Muted text: `#2D4A3E` at 40-60% opacity

### Tone of Voice
- "Pragmatic Bulgarian friend" — direct, warm, honest
- NOT wellness/biohacking, NOT clinical/cold
- Probabilistic language ("usually", "most women") not absolute promises
- Bulgarian UI text, English code

---

## 9-Section Architecture

### Conversion Funnel Logic

```
Section 1: Hero (Problem)           -> Recognition ("that's me")
Section 2: Education (Cortisol)     -> Understanding ("oh, that's why")
Section 3: Scrollytelling (4 Heroes)-> Solution ("these ingredients fix it")
Section 4: Ritual (5 minutes)       -> Visualization ("I can do this")
Section 5: Timeline (Expectations)  -> Confidence ("I'll see results")
Section 6: UGC Wall (Testers)       -> Validation ("others tried it")
Section 7: Transparency (Full List) -> Trust ("nothing hidden")
Section 8: Checkout (Bundles)       -> Action ("I'm buying")
Section 9: Guarantee (Risk-free)    -> Risk removal ("nothing to lose")
```

---

## Section 1: Hero — "The Problem"

**Component:** `ImmersiveHero.tsx`
**Height:** 100vh
**Background:** `#F7F4F0`

### Layout
Split grid: left typography (7 cols) + right product image (5 cols)

### Copy

**Headline (Cormorant Garamond 300 italic):**
> Познаваш го. Вечер не можеш да спреш мислите. Сутрин се събуждаш все още уморена.

**Subheadline:**
> 7 активни съставки с клинични дозировки. 1 саше преди сън.

**Concern tags (clickable, scroll to Section 3):**
- Стрес и кортизол
- Подуване
- Лош сън

**Trust line (NO fake customer count):**
> Формула с клинични дозировки. Без добавена захар.

**Primary CTA:** "Виж какво има вътре" (scrolls to Science)
**Secondary CTA:** "Купи Сега" (scrolls to Checkout)

### Product Image
- AI-generated via OpenRouter (product on warm background)
- Parallax with `useTransform(scrollYProgress, [0,1], [0, -80])`
- Video-ready: swap `<Image>` for `<video>` when available

---

## Section 2: Education — "Why Cortisol Steals Everything"

**Component:** `CortisolEducation.tsx` (NEW)
**Background:** `#F7F4F0` (continues from hero)

### Copy

**Intro:**
> Кортизолът е хормонът на стреса. В малки дози е полезен. Но когато е висок постоянно — пречи на съня, задържа вода, разбалансира цикъла и крещи на тялото ти да натрупва мазнини.

**3 concern blocks (anchored from hero tags):**

1. **id="concern-sleep"** — "Не заспиваш, защото мозъкът ти не спира"
   > Висок кортизол вечер = мозък в режим "fight or flight". Не е въпрос на дисциплина. Нервната ти система е на бойна готовност.

2. **id="concern-bloating"** — "Стомахът ти издува без причина"
   > Кортизолът забавя храносмилането и задържа вода. Не е от храната. Стресът буквално подува.

3. **id="concern-cycle"** — "Хормоните нямат ритъм"
   > Когато кортизолът е хронично висок, той "краде" от прогестерона. Резултат: нередовен цикъл, ПМС, brain fog.

### Design
- 3 text blocks with subtle separator lines (1px `#2D4A3E/10`)
- No images — pure typography on `#F7F4F0`
- Concern tags from hero smooth-scroll to matching block

---

## Section 3: Scrollytelling — "The 4 Heroes"

**Component:** `ScienceScrollytelling.tsx` (REWRITE)
**Height:** `400vh` (sticky scroll container)

### Section Intro
> Формулата. Без buzzwords — просто какво, колко и защо работи.

### 4 Stages (Level 1 Ingredients)

**Stage 01 — Myo-Inositol 2000 mg**
> Златният стандарт за хормонален баланс. Подобрява инсулиновата чувствителност и подкрепя нормалния менструален цикъл. Дозата от 2000mg е клинично изследваната — не 500mg както в повечето формули.

**Stage 02 — Екстракт от Ашваганда 300 mg (>=5% витанолиди)**
> Адаптогенът, който реално понижава кортизола. В 8-седмично проучване (n=64) серумният кортизол спада с 27.9%. 300mg с 5% витанолиди — концентрацията, която работи.

NOTE: NEVER use "KSM-66" — only generic name "Екстракт от Ашваганда"

**Stage 03 — Магнезиев Бисглицинат 670 mg (100 mg елементен)**
> Най-високоусвоимата форма. Без стомашен дискомфорт, без лаксативен ефект. Магнезият успокоява нервната система и мускулите — заспиваш по-бързо, спиш по-дълбоко.

**Stage 04 — Инулин от цикория 2500 mg**
> Оста на червата и мозъка. Мощен пребиотик, който храни добрите бактерии и намалява вечерното подуване. 2500mg е доза, която усещаш от първата вечер.

### Design
- Full-viewport sticky container
- Large stage number (01-04) in Cormorant Garamond, muted
- Dose number visually dominant (large, separate from body text)
- Abstract blur orbs for background (no ingredient photos)
- Spring-smoothed scroll transitions between stages
- Concern tags from hero scroll to corresponding stage

---

## Section 4: The Ritual — "Your 5 Minutes"

**Component:** `TheRitual.tsx` (UPDATE)
**Background:** `#F7F4F0` with subtle `bg-white/50` overlay

### Copy

**Headline:**
> Твоите 5 минути спокойствие. Без захар. Само билки, минерали и горска ягода.

**Steps:**
1. Разбъркай 1 саше в чаша студена вода.
2. Изпий 30 минути преди сън.
3. Събуди се без тежестта.

### Design
- Asymmetric grid: 7/12 lifestyle image + 5/12 steps
- Lifestyle image: AI-generated (woman with glass, evening, warm light)
- Secondary product image: grayscale -> color on hover
- Video-ready: lifestyle image slot becomes `<video>` later
- Parallax scale animation on scroll (0.85 -> 1)
- `next/image` with `fill` + `sizes` (already fixed)

---

## Section 5: Timeline — "What to Expect"

**Component:** `ExpectationsTimeline.tsx` (NEW)
**Background:** `#F7F4F0`

### Copy

**Intro:**
> Дай на тялото си време. Ето какво се случва, когато кортизолът най-накрая спадне.

**Day 1:**
> Събуждаш се без обичайното подуване.
> Инулинът и Бромелаинът започват работа от първата вечер. Стомахът е по-лек, водата не се задържа.

**Week 1:**
> Умът ти спира да препуска преди сън.
> L-Теанинът и Магнезият успокояват нервната система. Заспиваш по-лесно, без да въртиш мисли.

**Month 1 (One full cycle):**
> Хормоните влизат в ритъм.
> Мио-инозитолът има нужда от един пълен цикъл за пълен ефект. Цикълът е по-предвидим. ПМС-ът е по-лек.

### Design
- Elegant vertical timeline (thin line `#2D4A3E/20`)
- 3 dots along the line with time labels
- Minimal text blocks — no cards, no shadows
- Dots reveal on scroll (parallax)
- Tone: calm, probabilistic ("usually", "most women")

---

## Section 6: UGC Wall — "What Our First Testers Say"

**Component:** `TesterWall.tsx` (NEW)
**Background:** `#F7F4F0`

### Copy

**Headline:**
> Какво казват първите ни тестъри.

**Quotes:**
1. "Не вярвах, че ще заспя толкова бързо от първата вечер. Буквално 20 минути." — М., 31
2. "Подуването ми беше такъв проблем, че мислех, че е от глутена. Оказа се — стрес." — Д., 28
3. "Харесва ми, че не е поредната 'магическа' добавка. Виждам какво пия и в каква доза." — Е., 34

### Design
- Text on AI-generated lifestyle backgrounds (landscapes, textures, NO faces)
- Initial + age only (authentic, minimal)
- Staggered parallax (3 cards at different scroll speeds)
- Background images: soft, blurred, warm tones
- NO star ratings, NO verified badges (pre-launch honesty)

---

## Section 7: Transparency — "Full Ingredients"

**Component:** `FullTransparency.tsx` (NEW)
**Background:** `#F7F4F0`

### Copy

**Headline:**
> Пълен състав. Нищо скрито.

### 3-Tier Visual Hierarchy

**Level 1 — Clinical Heroes (large serif, prominent doses):**
- Мио-инозитол — 2000 mg
- Екстракт от Ашваганда — 300 mg (>=5% витанолиди)
- Магнезиев Бисглицинат — 670 mg (100 mg елементен)
- Инулин от цикория — 2500 mg

**Level 2 — Supporting Architecture (medium sans-serif):**
- L-Теанин — 200 mg
- Бромелаин — 100 mg (>=2400 GDU/g)
- Витамин B6 (P-5-P) — 1.4 mg

**Level 3 — Clean Base (small, muted):**
- Естествен вкус горска ягода и лайм
- Червено цвекло на прах
- Лимонена киселина
- Екстракт от стевия (Reb-A 97%) — 0 добавена захар

**Footer line:**
> Без изкуствени оцветители. Без подсладители. Без глутен.

### Design
- Vertical layout, decreasing visual weight per level
- Pure typographic hierarchy — no cards, no icons
- Level 1: Cormorant Garamond for names, large dose numbers
- Level 2: Sans-serif, regular weight
- Level 3: Small text, `#2D4A3E/40` color

---

## Section 8: Checkout — "Choose Your Ritual"

**Component:** `FrictionlessCheckout.tsx` (ALREADY FIXED)
**Background:** `white` with `rounded-t-[3rem]` for depth

### Copy

**Headline:**
> Избери своя ритуал.

**Subheadline:**
> Добави в количката директно. Без излишни стъпки.

### 3 Bundle Cards
| | Starter | Glow Bundle | Full Restart |
|--|---------|-------------|--------------|
| Duration | 1 month | 2 months | 3 months |
| Price | 49.99 EUR | 85.99 EUR | 119.99 EUR |
| Per box | 49.99 EUR | 43.00 EUR | 40.00 EUR |
| Badge | — | Най-избиран | Saves 30 EUR |

### Design
- Middle card elevated (-translate-y-4) + subtle border accent
- Product bundle images (bundle-1,2,3.webp)
- Functional addItem + GA4 tracking (implemented)
- Below cards: "Безплатна доставка над 80 EUR" + payment method icons
- CTA: "Купи Сега" with success feedback animation

---

## Section 9: Guarantee — "Risk-Free"

**Component:** `GuaranteeFooterCTA.tsx` (NEW)
**Background:** `#F0EDE8` (slightly darker warm)

### Copy

**Headline (Cormorant Garamond):**
> Не ти хареса? Връщаме ти парите. Без въпроси.

**Body:**
> Вярваме в тази формула, защото знаем какво има в нея. Ако след 30 дни не усетиш разлика — пиши ни и ти връщаме сумата. Това е.

**CTA:** "Започни с Corti-Glow"

**Sub-CTA:** "Доставка за 2-3 работни дни в цяла България"

### Design
- Centered text, large serif headline
- Subtle background shift from main `#F7F4F0` to `#F0EDE8`
- Single CTA button in `#2D4A3E`
- Minimal — no images, no cards

---

## Ingredient Messaging Matrix (MANDATORY)

### Level 1 — Clinical Heroes (Primary focus everywhere):
1. Myo-Inositol (2000 mg) — Hormonal balance + insulin sensitivity
2. Ashwagandha Extract (300 mg, >=5% withanolides) — Cortisol reduction
3. Magnesium Bisglycinate (670 mg / 100 mg elemental) — Deep sleep
4. Chicory Inulin (2500 mg) — Gut-brain axis, evening bloating

### Level 2 — Supporting Architecture:
5. L-Theanine (200 mg) — Racing thoughts before sleep
6. Bromelain (100 mg, >=2400 GDU/g) — Stomach comfort
7. Vitamin B6 as P-5-P (1.4 mg) — Magnesium absorption catalyst

### Level 3 — Clean Base (transparency only):
- Natural strawberry + lime flavor
- Beetroot powder (natural pink color)
- Citric acid
- Stevia extract (Reb-A 97%) — 0 added sugar

### RULES:
- NEVER use "KSM-66" — always "Екстракт от Ашваганда"
- Always include exact doses
- Level 1 ingredients get prominent placement
- Level 3 is for full ingredient list only
- Use probabilistic language ("usually", "most women"), not absolutes

---

## Technical Implementation Notes

### New Components to Create:
1. `CortisolEducation.tsx` — Section 2
2. `ExpectationsTimeline.tsx` — Section 5
3. `TesterWall.tsx` — Section 6
4. `FullTransparency.tsx` — Section 7
5. `GuaranteeFooterCTA.tsx` — Section 9

### Components to Rewrite:
1. `ImmersiveHero.tsx` — New copy, concern tag anchors
2. `ScienceScrollytelling.tsx` — 4 stages (not 3), new copy, no KSM-66
3. `RawSocialProof.tsx` — REPLACED by TesterWall.tsx

### Components to Keep (minor updates):
1. `TheRitual.tsx` — Already fixed (next/image, correct paths)
2. `FrictionlessCheckout.tsx` — Already fixed (cart integration, EUR prices)
3. `PremiumBackground.tsx` — Optimize performance (CSS keyframes)

### AI Image Generation (OpenRouter):
- Hero product shot (warm background, studio lighting)
- Lifestyle image for Ritual (woman, evening, warm light)
- 3 texture/landscape backgrounds for UGC Wall
- Ingredient abstract visuals for Scrollytelling (optional)

### Video-Ready Architecture:
- All image slots accept both `<Image>` and `<video>` with poster
- Video components load on intersection (lazy)
- Poster images serve as fallback until video models available

---

## Mobile Considerations

- All sections stack vertically (single column)
- Scrollytelling: simplified (no sticky, cards stack)
- Concern tags: horizontal scroll with snap-x
- Timeline: same vertical layout works on mobile
- Checkout: stacked cards, middle card highlighted
- Sticky bottom CTA bar on mobile (visible during scroll)
- Touch targets: minimum 44x44px
- Font sizes: clamp() for responsive scaling

---

## SEO Requirements

- Schema markup: Product, FAQ (on product page)
- Semantic HTML: proper heading hierarchy (h1 -> h2 -> h3)
- Alt text on all images
- Meta description matches problem-first positioning
- Revalidation: ISR at 1 hour (already configured)

---

## Success Metrics

After launch, track:
1. Scroll depth (how far do visitors scroll?)
2. Concern tag clicks (which problem resonates most?)
3. Add to cart rate from Section 8
4. Time on page (target: >2 minutes)
5. Bounce rate (target: <40%)
6. Mobile vs desktop conversion difference
