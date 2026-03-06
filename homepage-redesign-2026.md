# Homepage Redesign 2026: The "Seed x Arrae" Experience

## Phase 1: Анализ (Analysis)
Потребителят изисква пълна трансформация на началната страница на Corti-Glow, вдъхновена от техническата плавност на **Seed.com** (scrollytelling) и топлината/автентичността на **Arrae.com**.
Целта е да се премине от 12 стандартни секции към **5 ключови компонента**, които преливат един в друг органично.

**Основни изисквания и ограничения:**
- Дизайн език: Органика, земни тонове (sage, sand), мека текстура. НЕ ИСКАМЕ корпоративен/SaaS вид, никакво лилаво!
- Типография: Cormorant Garamond (много големи, уверени заглавия).
- Анимации: Край на евтините "fade-in-up" ефекти на всеки пиксел. Фокус върху `useScroll` и `useTransform` от Framer Motion за sticky parallax ефекти.

## Phase 2: Планиране (Planning)
Сегашната страница `page.tsx` ще бъде изчистена. Компонентите ще бъдат заменени със следната архитектура:

1. **The Immersive Hero** (`PremiumHero.tsx` -> Редизайн)
   - Ляво: Огромно заглавие Cormorant Garamond "Спри шума в главата. Върни сиянието."
   - Дясно: Кинематографична снимка/видео.
   - Долу: Механика "Shop by Concern" с 3 тага.

2. **The Science Scrollytelling** (`ScienceScrollytelling.tsx` - НОВ)
   - Sticky scroll механика с Framer Motion (`useScroll`, `useTransform`).
   - Вместо карти, история за пътешествие вътре в тялото (Ашваганда, Инулин, Myo-Inositol).

3. **The Ritual (Editorial Lifestyle)** (`PremiumHowTo.tsx` -> Редизайн на `TheRitual.tsx`)
   - Големи lifestyle снимки, минимален текст.

4. **Raw Social Proof** (`SocialProofBanner.tsx` + `BentoReviews.tsx` -> `RawSocialProof.tsx`)
   - Вертикални блокове "Instagram/TikTok style". Край на Bento грида.

5. **Frictionless Checkout** (`PremiumBundles.tsx` -> Редизайн)
   - Директен избор на пакет (Старт, Glow, Рестарт).
   - Интеграция със Slide-out Cart (ако е налична или ще използваме стандартната логика на количката).

## Phase 3: Архитектура и Решения (Solutioning)

### Технически стек и библиотеки
- **Framer Motion**: Само за `useScroll` (scroll-linked animations). Ще използваме `useTransform` за промяна на `y`, `opacity`, `scale` при скролиране, както и компонента `<motion.div style={{ position: "sticky", top: 0 }}>`.
- **Tailwind CSS**: Разчитаме максимално на Grid/Flexbox и sticky position `sticky top-0 h-screen`.

### Композиция на страницата
`src/app/(marketing)/page.tsx` ще бъде оркестратор на тези 5 section компонента, като `PremiumBackground` (noise + mesh) ще лежи отдолу.

## Phase 4: Изпълнение (Implementation Steps)

1. Създаване на нов компонент **`PremiumBackground.tsx`** (Noise + бавно дишащи mesh градиенти).
2. Пренаписване на **`PremiumHero.tsx`** с огромната типография и "Shop by Concern" таговете.
3. Изграждане на **`ScienceScrollytelling.tsx`** - най-сложният компонент (Framer Motion Scroll + Sticky).
4. Изграждане на **`TheRitual.tsx`** (Editorial секция).
5. Изграждане на **`RawSocialProof.tsx`** (ТикТок стил вертикален feed).
6. Пренаписване на **`PremiumBundles.tsx`** за максимално бърз чекаут.
7. Обновяване на `src/app/(marketing)/page.tsx`, за да използва новите съкратени 5 секции.

Първо изчакваме потвърждение на архитектурата, преди да започнем с кода!
