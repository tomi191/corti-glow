# Homepage v4.0 "Full Cinematic" Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement 9-section cinematic homepage following the approved design doc at `docs/plans/2026-03-06-homepage-v4-full-cinematic.md`.

**Architecture:** 9 sections in conversion funnel order. Framer Motion scroll-driven animations (useScroll/useTransform only, NO fade-in-up). Concern-based navigation from hero to science sections. Pre-launch honest messaging (no fake reviews).

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion, Zustand, next/image

---

## Task Overview

| # | Task | Type | Component |
|---|------|------|-----------|
| 1 | Fix ScienceScrollytelling KSM-66 | Bugfix | `ScienceScrollytelling.tsx` |
| 2 | Optimize PremiumBackground | Perf | `PremiumBackground.tsx` |
| 3 | Rewrite ImmersiveHero | Rewrite | `ImmersiveHero.tsx` |
| 4 | Rewrite ScienceScrollytelling | Rewrite | `ScienceScrollytelling.tsx` |
| 5 | Create CortisolEducation | New | `CortisolEducation.tsx` |
| 6 | Update TheRitual copy | Update | `TheRitual.tsx` |
| 7 | Create ExpectationsTimeline | New | `ExpectationsTimeline.tsx` |
| 8 | Create TesterWall | New | `TesterWall.tsx` |
| 9 | Create FullTransparency | New | `FullTransparency.tsx` |
| 10 | Create GuaranteeFooterCTA | New | `GuaranteeFooterCTA.tsx` |
| 11 | Wire up homepage page.tsx | Integration | `page.tsx` |
| 12 | Update barrel exports | Integration | `index.ts` |
| 13 | Build verification | QA | — |

---

### Task 1: Fix ScienceScrollytelling KSM-66 Reference

**Priority:** CRITICAL — trademark violation
**Files:**
- Modify: `src/components/home/ScienceScrollytelling.tsx:15`

**Step 1: Fix the text**

Change line 15 from:
```typescript
subtitle: "Ашваганда KSM-66 · 300mg (5% витанолиди)",
```
to:
```typescript
subtitle: "Екстракт от Ашваганда · 300mg (5% витанолиди)",
```

**Step 2: Verify no other KSM-66 references exist**

Run: `grep -r "KSM-66" src/`
Expected: No results

**Step 3: Commit**

```bash
git add src/components/home/ScienceScrollytelling.tsx
git commit -m "fix: remove KSM-66 trademark from scrollytelling"
```

---

### Task 2: Optimize PremiumBackground (CSS Keyframes)

**Files:**
- Modify: `src/components/home/PremiumBackground.tsx`

**Step 1: Rewrite to CSS keyframes**

Replace the entire component. The current version uses Framer Motion `animate` prop (runs JS every frame). Replace with pure CSS keyframes for the blob animations.

```tsx
"use client";

export function PremiumBackground() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-[-1] bg-brand-sand">
      {/* CSS-animated blobs — no JS per frame */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-brand-sage/40 rounded-full mix-blend-multiply blur-[120px] opacity-60 animate-blob-1" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[60%] bg-brand-cream/60 rounded-full mix-blend-multiply blur-[140px] opacity-70 animate-blob-2" />
      <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-brand-blush/20 rounded-full mix-blend-multiply blur-[100px] animate-blob-3" />

      {/* SVG Noise overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.4] mix-blend-overlay pointer-events-none">
        <filter id="premium-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.1 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#premium-noise)" />
      </svg>
    </div>
  );
}
```

**Step 2: Add CSS keyframes to globals.css**

Add at the end of `src/app/globals.css`:

```css
@keyframes blob-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-5%, 8%) scale(1.05); }
  66% { transform: translate(2%, -3%) scale(0.95); }
}

@keyframes blob-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(10%, -5%) scale(0.95); }
  66% { transform: translate(-5%, 10%) scale(1.05); }
}

@keyframes blob-3 {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.5; }
}

.animate-blob-1 { animation: blob-1 20s ease-in-out infinite; }
.animate-blob-2 { animation: blob-2 25s ease-in-out 2s infinite; }
.animate-blob-3 { animation: blob-3 15s ease-in-out 5s infinite; }
```

**Step 3: Run build**

Run: `npm run build`
Expected: PASS (no TS errors, no import errors)

**Step 4: Commit**

```bash
git add src/components/home/PremiumBackground.tsx src/app/globals.css
git commit -m "perf: replace Framer Motion blobs with CSS keyframes"
```

---

### Task 3: Rewrite ImmersiveHero

**Files:**
- Modify: `src/components/home/ImmersiveHero.tsx`

**Step 1: Rewrite the component**

Key changes from current version:
- NEW copy: problem-first headline from design doc
- Concern tags scroll to `#concern-sleep`, `#concern-bloating`, `#concern-cycle` (Section 2)
- Primary CTA: "Виж какво има вътре" scrolls to science
- Secondary CTA: "Купи Сега" scrolls to checkout
- Trust line: NO fake numbers — "Формула с клинични дозировки. Без добавена захар."
- Keep parallax image behavior (already correct)
- Keep prelaunch/waitlist logic

```tsx
"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { IS_PRELAUNCH } from "@/lib/constants";
import { useWaitlist } from "@/components/providers/WaitlistProvider";

const concerns = [
  { label: "Стрес и кортизол", target: "concern-stress" },
  { label: "Подуване", target: "concern-bloating" },
  { label: "Лош сън", target: "concern-sleep" },
] as const;

export function ImmersiveHero() {
  const { openWaitlist } = useWaitlist();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  const handleConcernClick = (target: string) => {
    const el = document.getElementById(target);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-[#F7F4F0]"
    >
      {/* Left: Typography (7 cols) */}
      <div className="relative flex flex-col justify-center order-2 md:order-1 md:col-span-7 px-6 sm:px-10 md:px-14 lg:px-20 py-12 md:py-20">
        <div className="max-w-xl">
          {/* Headline — problem-first */}
          <h1 className="font-serif leading-[0.95] tracking-[-0.03em] mb-6 md:mb-8">
            <span className="block text-[clamp(2.4rem,6vw,4.5rem)] font-light italic text-[#2D4A3E]">
              Познаваш го.
            </span>
            <span className="block text-[clamp(1.4rem,3vw,2rem)] font-light text-[#2D4A3E]/70 mt-3 not-italic leading-relaxed">
              Вечер не можеш да спреш мислите. Сутрин се събуждаш все още уморена.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-[15px] sm:text-base text-stone-500 font-light leading-relaxed max-w-md mb-8 md:mb-10">
            7 активни съставки с клинични дозировки. 1 саше преди сън.
          </p>

          {/* Concern tags */}
          <div className="flex flex-wrap gap-2 mb-8 md:mb-10">
            {concerns.map((c) => (
              <button
                key={c.target}
                onClick={() => handleConcernClick(c.target)}
                className="px-4 py-2 rounded-full border border-stone-300 text-sm text-stone-600 hover:border-[#2D4A3E] hover:text-[#2D4A3E] hover:bg-[#2D4A3E]/5 transition-all duration-300"
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            {IS_PRELAUNCH ? (
              <button
                onClick={openWaitlist}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#2D4A3E] text-white rounded-full text-[15px] font-medium hover:bg-[#1a2f27] transition-colors duration-300"
              >
                Запиши се първа
                <ArrowDown className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => scrollToSection("checkout-section")}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#2D4A3E] text-white rounded-full text-[15px] font-medium hover:bg-[#1a2f27] transition-colors duration-300"
              >
                Купи Сега
              </button>
            )}

            <button
              onClick={() => scrollToSection("science-section")}
              className="text-sm text-stone-400 hover:text-[#2D4A3E] transition-colors"
            >
              Виж какво има вътре
            </button>
          </div>

          {/* Trust line — NO fake numbers */}
          <p className="text-[11px] text-stone-400 tracking-wide">
            Формула с клинични дозировки · Без добавена захар · 30-дневна гаранция
          </p>
        </div>
      </div>

      {/* Right: Product Image (5 cols) */}
      <div className="relative order-1 md:order-2 md:col-span-5 min-h-[45vh] md:min-h-0 overflow-hidden">
        <motion.div
          style={{ y: imageY, scale: imageScale }}
          className="absolute inset-0"
        >
          <Image
            src="/images/product-splash-pour.webp"
            alt="Corti-Glow — розов моктейл се разлива в чаша"
            fill
            sizes="(max-width: 768px) 100vw, 42vw"
            priority
            className="object-cover"
          />
        </motion.div>

        {/* Edge blends */}
        <div
          className="absolute inset-y-0 left-0 w-24 hidden md:block pointer-events-none"
          style={{ background: "linear-gradient(to right, #F7F4F0 0%, transparent 100%)" }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-20 md:hidden pointer-events-none"
          style={{ background: "linear-gradient(to top, #F7F4F0 0%, transparent 100%)" }}
        />
      </div>
    </section>
  );
}
```

**Step 2: Run build**

Run: `npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/home/ImmersiveHero.tsx
git commit -m "feat: rewrite hero with problem-first copy and concern anchors"
```

---

### Task 4: Rewrite ScienceScrollytelling (4 Stages)

**Files:**
- Modify: `src/components/home/ScienceScrollytelling.tsx`

**Step 1: Rewrite with 4 stages**

Key changes:
- 4 stages (was 3): Myo-Inositol, Ashwagandha, Magnesium, Inulin
- NEW copy from design doc
- NO KSM-66 — "Екстракт от Ашваганда"
- Add `id="science-section"` for hero scroll target
- Stage numbers `01-04` in large Cormorant Garamond
- Fix: stages split into 4 equal ranges (0.25 each) instead of 3

```tsx
"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const STAGES = [
  {
    number: "01",
    title: "Мио-инозитол",
    dose: "2000 mg",
    description:
      "Златният стандарт за хормонален баланс. Подобрява инсулиновата чувствителност и подкрепя нормалния менструален цикъл. Дозата от 2000mg е клинично изследваната — не 500mg както в повечето формули.",
    color: "#E5E5E5",
  },
  {
    number: "02",
    title: "Екстракт от Ашваганда",
    dose: "300 mg",
    subtitle: ">=5% витанолиди",
    description:
      "Адаптогенът, който реално понижава кортизола. В 8-седмично проучване (n=64) серумният кортизол спада с 27.9%. 300mg с 5% витанолиди — концентрацията, която работи.",
    color: "#FFC1CC",
  },
  {
    number: "03",
    title: "Магнезиев Бисглицинат",
    dose: "670 mg",
    subtitle: "100 mg елементен",
    description:
      "Най-високоусвоимата форма. Без стомашен дискомфорт, без лаксативен ефект. Магнезият успокоява нервната система и мускулите — заспиваш по-бързо, спиш по-дълбоко.",
    color: "#B2D8C6",
  },
  {
    number: "04",
    title: "Инулин от цикория",
    dose: "2500 mg",
    description:
      "Оста на червата и мозъка. Мощен пребиотик, който храни добрите бактерии и намалява вечерното подуване. 2500mg е доза, която усещаш от първата вечер.",
    color: "#D4E8D0",
  },
];

export function ScienceScrollytelling() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section
      id="science-section"
      ref={containerRef}
      className="relative w-full h-[400vh] bg-transparent"
    >
      <div className="sticky top-0 h-screen w-full flex flex-col md:flex-row items-center justify-center overflow-hidden">
        {/* Section intro (fades out as scrolling begins) */}
        <motion.div
          style={{
            opacity: useTransform(smoothProgress, [0, 0.08], [1, 0]),
          }}
          className="absolute top-[15%] left-0 right-0 text-center px-6 z-30 pointer-events-none"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-[#2D4A3E]/40 font-semibold mb-4">
            Формулата
          </p>
          <h2 className="text-3xl md:text-5xl font-serif font-light italic text-[#2D4A3E]">
            Без buzzwords — просто какво, колко и защо работи.
          </h2>
        </motion.div>

        {/* Left: Text stages */}
        <div className="w-full md:w-1/2 h-full flex items-center justify-center px-6 md:px-16 z-20">
          <div className="relative w-full max-w-md h-[50vh] md:h-[60vh]">
            {STAGES.map((stage, index) => {
              const chunk = 1 / STAGES.length; // 0.25
              const start = Math.max(0, index * chunk - 0.05);
              const peak = index * chunk + chunk / 2;
              const end = Math.min(1, (index + 1) * chunk + 0.05);

              return (
                <motion.div
                  key={index}
                  style={{
                    opacity: useTransform(smoothProgress, [start, peak, end], [0, 1, 0]),
                    y: useTransform(smoothProgress, [start, peak, end], [40, 0, -40]),
                  }}
                  className="absolute inset-0 flex flex-col justify-center pointer-events-none"
                >
                  {/* Stage number */}
                  <span className="text-[8rem] md:text-[10rem] font-serif font-light text-[#2D4A3E]/[0.06] leading-none absolute -top-8 -left-4">
                    {stage.number}
                  </span>

                  {/* Dose — visually dominant */}
                  <p className="text-4xl md:text-5xl font-serif font-light text-[#2D4A3E] mb-2">
                    {stage.dose}
                  </p>

                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-semibold text-[#2D4A3E] mb-1">
                    {stage.title}
                  </h3>

                  {stage.subtitle && (
                    <p className="text-sm text-[#2D4A3E]/40 font-medium mb-4">
                      {stage.subtitle}
                    </p>
                  )}

                  {/* Description */}
                  <p className="text-base md:text-lg text-[#2D4A3E]/60 font-light leading-relaxed">
                    {stage.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right: Abstract blur orb */}
        <div className="w-full md:w-1/2 h-full absolute md:relative top-0 right-0 z-10 flex items-center justify-center pointer-events-none">
          <motion.div
            style={{
              scale: useTransform(smoothProgress, [0, 0.25, 0.5, 0.75, 1], [0.8, 1.1, 0.9, 1.2, 0.85]),
              backgroundColor: useTransform(
                smoothProgress,
                [0, 0.25, 0.5, 0.75, 1],
                ["#E5E5E5", "#FFC1CC", "#B2D8C6", "#D4E8D0", "#E5E5E5"]
              ),
            }}
            className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full blur-[80px] md:blur-[120px] mix-blend-multiply opacity-50"
          />

          <motion.div
            style={{
              rotate: useTransform(smoothProgress, [0, 1], [0, 180]),
              scale: useTransform(smoothProgress, [0, 0.5, 1], [1, 0.9, 1.1]),
            }}
            className="absolute w-40 h-40 md:w-64 md:h-64 border border-[#2D4A3E]/10 rounded-full flex items-center justify-center backdrop-blur-sm bg-white/5"
          >
            <motion.div
              style={{
                width: useTransform(smoothProgress, [0, 0.5, 1], ["40%", "70%", "30%"]),
                height: useTransform(smoothProgress, [0, 0.5, 1], ["40%", "70%", "30%"]),
              }}
              className="rounded-full bg-gradient-to-tr from-[#2D4A3E]/5 to-transparent"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Run build**

Run: `npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/home/ScienceScrollytelling.tsx
git commit -m "feat: rewrite scrollytelling with 4 stages, new copy, no KSM-66"
```

---

### Task 5: Create CortisolEducation (Section 2)

**Files:**
- Create: `src/components/home/CortisolEducation.tsx`

**Step 1: Create the component**

Pure typography section. No images. 3 concern blocks with anchor IDs for hero tag scrolling.

```tsx
"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const concerns = [
  {
    id: "concern-sleep",
    title: "Не заспиваш, защото мозъкът ти не спира.",
    body: "Висок кортизол вечер = мозък в режим \"fight or flight\". Не е въпрос на дисциплина. Нервната ти система е на бойна готовност.",
  },
  {
    id: "concern-bloating",
    title: "Стомахът ти издува без причина.",
    body: "Кортизолът забавя храносмилането и задържа вода. Не е от храната. Стресът буквално подува.",
  },
  {
    id: "concern-stress",
    title: "Хормоните нямат ритъм.",
    body: "Когато кортизолът е хронично висок, той \"краде\" от прогестерона. Резултат: нередовен цикъл, ПМС, brain fog.",
  },
];

export function CortisolEducation() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3]);

  return (
    <section ref={sectionRef} className="py-24 md:py-40 bg-transparent relative z-20">
      <motion.div style={{ opacity }} className="max-w-3xl mx-auto px-6">
        {/* Intro */}
        <p className="text-lg md:text-xl text-[#2D4A3E]/70 font-light leading-relaxed mb-16 md:mb-24 max-w-2xl">
          Кортизолът е хормонът на стреса. В малки дози е полезен. Но когато е висок постоянно — пречи на съня, задържа вода, разбалансира цикъла и крещи на тялото ти да натрупва мазнини.
        </p>

        {/* 3 concern blocks */}
        <div className="flex flex-col gap-16 md:gap-20">
          {concerns.map((concern) => (
            <div
              key={concern.id}
              id={concern.id}
              className="border-t border-[#2D4A3E]/10 pt-8 scroll-mt-24"
            >
              <h3 className="text-2xl md:text-3xl font-serif italic text-[#2D4A3E] mb-4">
                {concern.title}
              </h3>
              <p className="text-base md:text-lg text-[#2D4A3E]/60 font-light leading-relaxed max-w-xl">
                {concern.body}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
```

**Step 2: Run build**

Run: `npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/home/CortisolEducation.tsx
git commit -m "feat: add CortisolEducation section with concern anchors"
```

---

### Task 6: Update TheRitual Copy

**Files:**
- Modify: `src/components/home/TheRitual.tsx`

**Step 1: Update copy to match design doc**

Changes needed:
- Headline: "Твоите 5 минути спокойствие." (already correct)
- Subtitle: add "Без захар. Само билки, минерали и горска ягода." (slightly different from current)
- Steps text: update to match design doc copy
- Line 27: Change "Без захар. Само чисто цвекло, билки и екстракти." → "Без захар. Само билки, минерали и горска ягода."
- Line 50: Change step instructions text

Update line 27:
```tsx
// FROM:
"Без захар. Само чисто цвекло, билки и екстракти."
// TO:
"Без захар. Само билки, минерали и горска ягода."
```

Update step text (lines 50-52):
```tsx
// Step 1: "Разбъркай 1 саше в чаша студена вода."
// Step 2: "Изпий 30 минути преди сън."
// Step 3: "Събуди се без тежестта."
```

**Step 2: Run build**

Run: `npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/home/TheRitual.tsx
git commit -m "feat: update TheRitual copy to match design doc"
```

---

### Task 7: Create ExpectationsTimeline (Section 5)

**Files:**
- Create: `src/components/home/ExpectationsTimeline.tsx`

**Step 1: Create the component**

Elegant vertical timeline with 3 milestones. Parallax reveal for dots. Probabilistic language.

```tsx
"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const milestones = [
  {
    time: "Ден 1",
    title: "Събуждаш се без обичайното подуване.",
    body: "Инулинът и Бромелаинът започват работа от първата вечер. Стомахът е по-лек, водата не се задържа.",
  },
  {
    time: "Седмица 1",
    title: "Умът ти спира да препуска преди сън.",
    body: "L-Теанинът и Магнезият успокояват нервната система. Заспиваш по-лесно, без да въртиш мисли.",
  },
  {
    time: "Месец 1",
    title: "Хормоните влизат в ритъм.",
    body: "Мио-инозитолът има нужда от един пълен цикъл за пълен ефект. Цикълът е по-предвидим. ПМС-ът е по-лек.",
  },
];

export function ExpectationsTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Timeline line grows as you scroll
  const lineHeight = useTransform(scrollYProgress, [0.1, 0.8], ["0%", "100%"]);

  return (
    <section ref={sectionRef} className="py-24 md:py-40 bg-transparent relative z-20">
      <div className="max-w-3xl mx-auto px-6">
        {/* Intro */}
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-4xl md:text-6xl font-serif font-light italic text-[#2D4A3E] leading-[0.9] mb-6">
            Какво да очакваш.
          </h2>
          <p className="text-lg text-[#2D4A3E]/60 font-light max-w-lg mx-auto">
            Дай на тялото си време. Ето какво се случва, когато кортизолът най-накрая спадне.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative pl-8 md:pl-12">
          {/* Vertical line */}
          <div className="absolute left-0 md:left-4 top-0 bottom-0 w-px bg-[#2D4A3E]/10">
            <motion.div
              style={{ height: lineHeight }}
              className="w-full bg-[#2D4A3E]/30 origin-top"
            />
          </div>

          <div className="flex flex-col gap-16 md:gap-24">
            {milestones.map((m, i) => (
              <TimelineItem key={i} milestone={m} index={i} progress={scrollYProgress} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineItem({
  milestone,
  index,
  progress,
}: {
  milestone: (typeof milestones)[number];
  index: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const dotStart = 0.15 + index * 0.2;
  const dotOpacity = useTransform(progress, [dotStart, dotStart + 0.1], [0, 1]);
  const dotScale = useTransform(progress, [dotStart, dotStart + 0.1], [0, 1]);

  return (
    <div className="relative">
      {/* Dot */}
      <motion.div
        style={{ opacity: dotOpacity, scale: dotScale }}
        className="absolute -left-8 md:-left-12 top-1 w-3 h-3 rounded-full bg-[#2D4A3E]/40 -translate-x-1/2 md:translate-x-[calc(1rem-50%)]"
      />

      {/* Time label */}
      <p className="text-xs uppercase tracking-[0.25em] text-[#2D4A3E]/40 font-semibold mb-3">
        {milestone.time}
      </p>

      {/* Title */}
      <h3 className="text-xl md:text-2xl font-serif italic text-[#2D4A3E] mb-3">
        {milestone.title}
      </h3>

      {/* Body */}
      <p className="text-base text-[#2D4A3E]/60 font-light leading-relaxed max-w-lg">
        {milestone.body}
      </p>
    </div>
  );
}
```

**Step 2: Run build**

Run: `npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/home/ExpectationsTimeline.tsx
git commit -m "feat: add ExpectationsTimeline section"
```

---

### Task 8: Create TesterWall (Section 6)

**Files:**
- Create: `src/components/home/TesterWall.tsx`

**Step 1: Create the component**

Replaces RawSocialProof. Tester quotes (NOT reviews) with staggered parallax. Initial + age only. No star ratings.

```tsx
"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const testers = [
  {
    quote: "Не вярвах, че ще заспя толкова бързо от първата вечер. Буквално 20 минути.",
    author: "М., 31",
    bg: "bg-brand-sage/30",
  },
  {
    quote: "Подуването ми беше такъв проблем, че мислех, че е от глутена. Оказа се — стрес.",
    author: "Д., 28",
    bg: "bg-brand-cream/40",
  },
  {
    quote: "Харесва ми, че не е поредната \"магическа\" добавка. Виждам какво пия и в каква доза.",
    author: "Е., 34",
    bg: "bg-brand-blush/30",
  },
];

export function TesterWall() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Staggered parallax speeds
  const yValues = [
    useTransform(scrollYProgress, [0, 1], [60, -60]),
    useTransform(scrollYProgress, [0, 1], [30, -30]),
    useTransform(scrollYProgress, [0, 1], [80, -40]),
  ];

  return (
    <section ref={containerRef} className="py-24 md:py-40 bg-transparent w-full relative z-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Headline */}
        <h2 className="text-4xl md:text-6xl font-serif font-light italic text-[#2D4A3E] text-center mb-16 md:mb-24">
          Какво казват първите ни тестъри.
        </h2>

        {/* Tester cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testers.map((tester, i) => (
            <motion.div
              key={i}
              style={{ y: yValues[i] }}
              className={`rounded-3xl p-8 md:p-10 ${tester.bg} flex flex-col justify-between min-h-[280px]`}
            >
              <p className="text-xl md:text-2xl font-serif italic text-[#2D4A3E] leading-[1.3] mb-8">
                &ldquo;{tester.quote}&rdquo;
              </p>
              <p className="text-sm text-[#2D4A3E]/50 font-medium">
                — {tester.author}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Run build**

Run: `npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/home/TesterWall.tsx
git commit -m "feat: add TesterWall section replacing RawSocialProof"
```

---

### Task 9: Create FullTransparency (Section 7)

**Files:**
- Create: `src/components/home/FullTransparency.tsx`

**Step 1: Create the component**

3-tier visual hierarchy using data from `src/data/products.ts`. Pure typography.

```tsx
export function FullTransparency() {
  return (
    <section className="py-24 md:py-40 bg-transparent relative z-20">
      <div className="max-w-3xl mx-auto px-6">
        {/* Headline */}
        <h2 className="text-4xl md:text-6xl font-serif font-light italic text-[#2D4A3E] text-center mb-16 md:mb-24">
          Пълен състав. Нищо скрито.
        </h2>

        {/* Level 1 — Clinical Heroes */}
        <div className="mb-16">
          <p className="text-xs uppercase tracking-[0.25em] text-[#2D4A3E]/40 font-semibold mb-8">
            Клинични съставки
          </p>
          <div className="flex flex-col gap-6">
            {[
              { name: "Мио-инозитол", dose: "2000 mg" },
              { name: "Екстракт от Ашваганда", dose: "300 mg", note: ">=5% витанолиди" },
              { name: "Магнезиев Бисглицинат", dose: "670 mg", note: "100 mg елементен" },
              { name: "Инулин от цикория", dose: "2500 mg" },
            ].map((item) => (
              <div key={item.name} className="flex items-baseline justify-between border-b border-[#2D4A3E]/5 pb-4">
                <div>
                  <span className="text-xl md:text-2xl font-serif text-[#2D4A3E]">
                    {item.name}
                  </span>
                  {item.note && (
                    <span className="text-sm text-[#2D4A3E]/40 ml-2">({item.note})</span>
                  )}
                </div>
                <span className="text-2xl md:text-3xl font-serif font-light text-[#2D4A3E] whitespace-nowrap ml-4">
                  {item.dose}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Level 2 — Supporting */}
        <div className="mb-16">
          <p className="text-xs uppercase tracking-[0.25em] text-[#2D4A3E]/30 font-semibold mb-6">
            Подкрепящи съставки
          </p>
          <div className="flex flex-col gap-4">
            {[
              { name: "L-Теанин", dose: "200 mg" },
              { name: "Бромелаин", dose: "100 mg", note: ">=2400 GDU/g" },
              { name: "Витамин B6 (P-5-P)", dose: "1.4 mg" },
            ].map((item) => (
              <div key={item.name} className="flex items-baseline justify-between border-b border-[#2D4A3E]/5 pb-3">
                <div>
                  <span className="text-base md:text-lg text-[#2D4A3E]/80">
                    {item.name}
                  </span>
                  {item.note && (
                    <span className="text-xs text-[#2D4A3E]/30 ml-2">({item.note})</span>
                  )}
                </div>
                <span className="text-lg text-[#2D4A3E]/70 whitespace-nowrap ml-4">
                  {item.dose}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Level 3 — Clean Base */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.25em] text-[#2D4A3E]/20 font-semibold mb-4">
            Чиста база
          </p>
          <div className="flex flex-col gap-2">
            {[
              "Естествен вкус горска ягода и лайм",
              "Червено цвекло на прах",
              "Лимонена киселина",
              "Екстракт от стевия (Reb-A 97%) — 0 добавена захар",
            ].map((item) => (
              <p key={item} className="text-sm text-[#2D4A3E]/40">
                {item}
              </p>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-sm text-[#2D4A3E]/50 font-light text-center border-t border-[#2D4A3E]/10 pt-8">
          Без изкуствени оцветители. Без подсладители. Без глутен.
        </p>
      </div>
    </section>
  );
}
```

NOTE: This is a Server Component (no "use client" needed — pure render).

**Step 2: Run build**

Run: `npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/home/FullTransparency.tsx
git commit -m "feat: add FullTransparency section with 3-tier ingredient hierarchy"
```

---

### Task 10: Create GuaranteeFooterCTA (Section 9)

**Files:**
- Create: `src/components/home/GuaranteeFooterCTA.tsx`

**Step 1: Create the component**

```tsx
"use client";

import { IS_PRELAUNCH } from "@/lib/constants";
import { useWaitlist } from "@/components/providers/WaitlistProvider";

export function GuaranteeFooterCTA() {
  const { openWaitlist } = useWaitlist();

  const handleCTA = () => {
    if (IS_PRELAUNCH) {
      openWaitlist();
      return;
    }
    const el = document.getElementById("checkout-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="py-24 md:py-32 bg-[#F0EDE8] relative z-20">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-serif font-light italic text-[#2D4A3E] leading-[0.95] mb-8">
          Не ти хареса?
          <br />
          Връщаме ти парите.
        </h2>

        <p className="text-lg text-[#2D4A3E]/60 font-light leading-relaxed mb-10 max-w-lg mx-auto">
          Вярваме в тази формула, защото знаем какво има в нея. Ако след 30 дни не усетиш разлика — пиши ни и ти връщаме сумата. Това е.
        </p>

        <button
          onClick={handleCTA}
          className="inline-flex items-center px-8 py-4 bg-[#2D4A3E] text-white rounded-full text-base font-medium hover:bg-[#1a2f27] transition-colors duration-300 mb-4"
        >
          {IS_PRELAUNCH ? "Запиши се Първа" : "Започни с Corti-Glow"}
        </button>

        <p className="text-sm text-[#2D4A3E]/40">
          Доставка за 2-3 работни дни в цяла България.
        </p>
      </div>
    </section>
  );
}
```

**Step 2: Run build**

Run: `npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/home/GuaranteeFooterCTA.tsx
git commit -m "feat: add GuaranteeFooterCTA section"
```

---

### Task 11: Wire Up Homepage page.tsx

**Files:**
- Modify: `src/app/(marketing)/page.tsx`

**Step 1: Update the page**

Add all 9 sections in correct order. Import new components. Remove RawSocialProof.

```tsx
import type { Metadata } from "next";
import {
  ImmersiveHero,
  CortisolEducation,
  ScienceScrollytelling,
  TheRitual,
  ExpectationsTimeline,
  TesterWall,
  FullTransparency,
  FrictionlessCheckout,
  GuaranteeFooterCTA,
  PremiumBackground,
} from "@/components/home";
import { getProduct } from "@/lib/actions/products";
import type { ProductVariant } from "@/types";
import type { ProductVariantDB } from "@/lib/supabase/types";
import { IS_PRELAUNCH } from "@/lib/constants";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Corti-Glow — Когато кортизолът спадне, всичко се подрежда.",
  description:
    "7 активни съставки с клинични дозировки. 1 саше преди сън. Мио-инозитол, ашваганда, магнезий бисглицинат и инулин за по-нисък кортизол, по-добър сън и хормонален баланс. Без захар.",
  openGraph: {
    title: "LURA Corti-Glow — 7 Съставки. 1 Саше. По-нисък Кортизол.",
    description:
      "Формула с клинични дозировки за жени, които искат да спят по-добре, да се подуват по-малко и да върнат хормоналния си баланс.",
  },
  alternates: {
    canonical: "https://luralab.eu",
  },
};

function mapVariants(dbVariants: ProductVariantDB[]): ProductVariant[] {
  return dbVariants.map((v) => ({
    id: v.id,
    name: v.name,
    description: v.description,
    price: v.price,
    compareAtPrice: v.compare_at_price,
    quantity: v.quantity,
    isBestSeller: v.is_best_seller,
    savings: v.savings,
    image: v.image,
  }));
}

export default async function HomePage() {
  let variants: ProductVariant[] | undefined;
  if (!IS_PRELAUNCH) {
    try {
      const { product } = await getProduct("corti-glow");
      if (product?.variants) {
        variants = mapVariants(product.variants as unknown as ProductVariantDB[]);
      }
    } catch {
      // Silently fall back to hardcoded data
    }
  }

  return (
    <>
      <PremiumBackground />
      <ImmersiveHero />
      <CortisolEducation />
      <ScienceScrollytelling />
      <TheRitual />
      <ExpectationsTimeline />
      <TesterWall />
      <FullTransparency />
      <FrictionlessCheckout variants={variants} />
      <GuaranteeFooterCTA />
    </>
  );
}
```

**Step 2: Run build**

Run: `npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/app/\(marketing\)/page.tsx
git commit -m "feat: wire up all 9 homepage sections"
```

---

### Task 12: Update Barrel Exports

**Files:**
- Modify: `src/components/home/index.ts`

**Step 1: Update exports**

```typescript
// v4.0 — Full Cinematic (2026-03-06)
export { ImmersiveHero } from "./ImmersiveHero";
export { CortisolEducation } from "./CortisolEducation";
export { ScienceScrollytelling } from "./ScienceScrollytelling";
export { TheRitual } from "./TheRitual";
export { ExpectationsTimeline } from "./ExpectationsTimeline";
export { TesterWall } from "./TesterWall";
export { FullTransparency } from "./FullTransparency";
export { FrictionlessCheckout } from "./FrictionlessCheckout";
export { GuaranteeFooterCTA } from "./GuaranteeFooterCTA";
export { PremiumBackground } from "./PremiumBackground";

// Legacy exports (kept for other pages that may reference them)
export { RawSocialProof } from "./RawSocialProof";
export { PremiumBundles } from "./PremiumBundles";
export { PremiumFAQ } from "./PremiumFAQ";
export { MobileStickyBar } from "./MobileStickyBar";
```

**Step 2: Run build**

Run: `npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/home/index.ts
git commit -m "feat: update barrel exports for v4.0 homepage"
```

---

### Task 13: Full Build Verification

**Step 1: Run full build**

Run: `npm run build`
Expected: PASS — no TS errors, no import errors

**Step 2: Run lint**

Run: `npm run lint`
Expected: PASS or only pre-existing warnings

**Step 3: Verify no KSM-66 references remain**

Run: `grep -r "KSM-66" src/`
Expected: No results

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: homepage v4.0 full cinematic — 9 sections complete"
```

---

## Dependency Graph

```
Task 1 (KSM-66 fix) ──┐
Task 2 (Background)  ──┤── Independent, can run in parallel
Task 5 (Education)   ──┤
Task 7 (Timeline)    ──┤
Task 8 (TesterWall)  ──┤
Task 9 (Transparency)──┤
Task 10 (Guarantee)  ──┘
                        │
Task 3 (Hero rewrite)───┤── Depends on concern IDs from Task 5
Task 4 (Scrollytelling)─┤── Supersedes Task 1
                        │
Task 6 (Ritual copy)  ──┤── Independent
                        │
Task 11 (page.tsx)   ───┤── Depends on ALL component tasks (3-10)
Task 12 (index.ts)   ───┤── Depends on ALL component tasks (3-10)
Task 13 (Verification)──┘── Depends on ALL tasks
```

## Post-Implementation

After all 13 tasks, the remaining work is:
- **AI Image Generation** via OpenRouter (hero product, lifestyle, UGC backgrounds)
- **Mobile sticky CTA bar** (can reuse existing MobileStickyBar or create new)
- **Video-ready slots** (architecture is ready, waiting for video models)
- **GA4 scroll depth tracking** for success metrics
