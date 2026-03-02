# Briefing from Claude (Opus 4.6) to Gemini

Hi Gemini! I'm Claude (Opus 4.6), working as the lead AI developer on the LuraLab PWA project. I'm sharing our full PWA codebase so you can understand what we've built and potentially help review or extend it.

---

## Project: LuraLab Glow Tracker PWA

**What it is:** A Progressive Web App for tracking menstrual cycles + cortisol/stress levels, built inside a Next.js 16 e-commerce platform (LuraLab sells Corti-Glow supplements).

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Framer Motion 12, Zustand 5, Clerk Auth, localStorage persistence.

**UI Language:** Bulgarian | **Code Language:** English

**Design Aesthetic:** "Soft Sage" / "Glossier" minimalist - glass morphism, rounded corners, brand colors (forest green, sage, blush pink).

---

## Architecture Overview

```
src/
├── app/(pwa)/                    # PWA Route Group (routes at /app/*)
│   ├── layout.tsx                # Glass nav, FAB, iOS banner
│   └── app/
│       ├── page.tsx              # Dashboard (Glow Ring, Cycle Card, Actions)
│       ├── checkin/page.tsx      # 4-step check-in wizard
│       ├── calendar/page.tsx     # Monthly cycle calendar
│       ├── insights/page.tsx     # Smart analytics & trends
│       ├── shop/page.tsx         # Phase-based product recommendations
│       ├── profile/page.tsx      # Settings, cycle config, notifications
│       └── settings/page.tsx     # Redirect to /app/profile
├── lib/pwa-logic.ts              # Pure TS business logic (no React)
├── stores/pwa-store.ts           # Zustand store + localStorage
└── components/pwa/
    ├── GlowRing.tsx              # Animated SVG progress bar (NEW - just built!)
    ├── BoxBreathingFAB.tsx       # 4-7-8 breathing overlay
    ├── OnboardingWizard.tsx      # 3-step first-time setup
    ├── CycleCalendar.tsx         # Monthly phase-colored calendar
    ├── AppTourModal.tsx          # 5-step feature walkthrough
    └── IOSInstallBanner.tsx      # iOS PWA install instructions
```

---

## Data Flow

```
User opens /app → Clerk Auth → Dashboard loads
  ↓ (first time)
  OnboardingWizard → sets lastPeriodDate, cycleLength, periodDuration
  ↓
  Dashboard: getCycleDay() → getCyclePhase() → shows phase info, actions, tips
  ↓
  User taps GlowRing → /app/checkin (4-step wizard: period, sleep, stress, symptoms)
  ↓
  saveCheckIn() → calculateGlowScore(sleep*10 - stress*5) → localStorage
  ↓
  Dashboard: GlowRing animates to score, shows Glow Insight tip
  ↓
  Calendar: phase-colored month view with check-in dots
  Insights: weekly trends, sleep/stress analysis, symptom patterns (needs 3+ check-ins)
  Shop: phase-specific supplement recommendations
```

---

## Key Business Logic (`src/lib/pwa-logic.ts`)

```typescript
// Cycle calculation
getCycleDay(lastPeriodDate, cycleLength=28) → 1-based day number
getCyclePhase(cycleDay, periodDuration=5) → "menstrual"|"follicular"|"ovulation"|"luteal"
  - Day 1-5: menstrual
  - Day 6-11: follicular
  - Day 12-16: ovulation
  - Day 17+: luteal

// Glow Score
calculateGlowScore(sleep, stress) → clamp(sleep*10 - stress*5, 0, 100)

// Smart Features
getDailyTip(phase, stressLevel) → stress-aware tip per phase
getDailyActions(phase) → [food, exercise, supplement] recommendations
generateWeeklyInsights(checkIns, phase) → sleep trends, stress patterns, symptom analysis
getGlowScoreTrend(checkIns) → this week vs last week comparison
```

---

## State Management (`src/stores/pwa-store.ts`)

Zustand store with `persist` middleware → localStorage key: `"lura-pwa"`

**Persisted:** lastPeriodDate, cycleLength (28), periodDuration (5), checkIns[] (max 90), hasSeenTour, pushEnabled, iosInstallDismissed

**Actions:** saveCheckIn (auto-updates lastPeriodDate if period started), cycle settings, tour/notification flags

**Getters:** getTodayCheckIn, getCurrentCycleDay, getCurrentPhase, getTodayGlowScore

---

## Latest Change: GlowRing Upgrade

I just upgraded the Glow Ring from a static CSS `conic-gradient` to an **animated Framer Motion SVG circular progress bar**:

- SVG `<circle>` with `strokeDashoffset` animation
- `linearGradient` stroke: forest (#2D4A3E) → sage (#B2D8C6) → blush (#FFC1CC)
- `useSpring` + `useMotionValueEvent` for animated score counter (0 → score)
- Two states: empty (check-in CTA with Link) vs filled (animated ring + score)
- Accessibility: `role="img"` + `aria-label`

---

## Full File Contents

### 1. `src/lib/pwa-logic.ts` — Core Business Logic

```typescript
// Pure TypeScript - no React. Types + functions for the Glow Tracker PWA.

export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

export interface PhaseInfo {
  name: string;
  description: string;
  season: string;
  iconName: "Snowflake" | "Sprout" | "Sun" | "Leaf";
  colorClass: string;
}

export const SYMPTOM_OPTIONS = [
  "Главоболие", "Умора", "Подуване", "Раздразнителност",
  "Болки в кръста", "Безсъние", "Тревожност", "Акне",
  "Желание за сладко", "Болки в гърдите", "Гадене", "Ниска енергия",
] as const;

export type SymptomOption = (typeof SYMPTOM_OPTIONS)[number];

export interface DailyCheckIn {
  date: string;
  periodStarted: boolean;
  sleep: number;
  stress: number;
  symptoms: SymptomOption[];
  glowScore: number;
}

export function getCycleDay(lastPeriodDate: string | null, cycleLength = 28): number {
  if (!lastPeriodDate) return 0;
  const [y, m, d] = lastPeriodDate.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return (diffDays % cycleLength) + 1;
}

export function getCyclePhase(cycleDay: number, periodDuration = 5): CyclePhase {
  if (cycleDay <= 0) return "follicular";
  if (cycleDay <= periodDuration) return "menstrual";
  if (cycleDay < 12) return "follicular";
  if (cycleDay <= 16) return "ovulation";
  return "luteal";
}

export function calculateGlowScore(sleep: number, stress: number): number {
  return Math.max(0, Math.min(100, sleep * 10 - stress * 5));
}

// + getPhaseInfo, getPhaseForDate, isPeriodDay, getDailyTip, getDailyActions,
//   getPhaseRecommendation, generateWeeklyInsights, getGlowScoreTrend, getGreeting
// (Full implementations with Bulgarian text, phase-specific tips, smart insights)
```

### 2. `src/stores/pwa-store.ts` — Zustand State

```typescript
"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Full store with: saveCheckIn, cycle settings, getters
// localStorage key: "lura-pwa", max 90 check-ins
// Auto-updates lastPeriodDate when period starts
```

### 3. `src/components/pwa/GlowRing.tsx` — Animated SVG Progress Ring (NEW)

```typescript
"use client";
import { motion, useSpring, useTransform, useMotionValueEvent } from "framer-motion";

const SIZE = 200, STROKE_WIDTH = 8;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;  // 96
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ~603

// SVG circle with animated strokeDashoffset
// linearGradient: forest → sage → blush
// useSpring for animated counter
// Two states: hasCheckIn (score) vs empty (CTA link)
```

### 4. `src/app/(pwa)/layout.tsx` — PWA Shell

```typescript
// Glass header (Lura logo + Clerk UserButton)
// Main content area with gradient background
// BoxBreathingFAB (floating action button)
// IOSInstallBanner
// 5-tab glass bottom navigation (Home, Calendar, Analysis, Shop, Profile)
```

### 5. `src/app/(pwa)/app/page.tsx` — Dashboard

```typescript
// Greeting header with user name + current phase/day
// GlowRing component (animated SVG)
// Sleep & Balance stat cards
// Cycle Card (progress bar, phase labels, days until period)
// Daily Actions (food, exercise, supplement per phase)
// Glow Insight tip (stress-aware, phase-specific)
// OnboardingWizard for first-time users
// AppTourModal after onboarding
```

### 6. `src/app/(pwa)/app/checkin/page.tsx` — 4-Step Check-In Wizard

```typescript
// Step 0: Period toggle (Да/Не)
// Step 1: Sleep slider (0-10) with animated icons
// Step 2: Stress slider (0-10) with color gradient
// Step 3: Symptom selection (12 Bulgarian symptoms)
// Re-check-in warning if already checked in today
// AnimatePresence slide transitions
// beforeunload protection against accidental navigation
```

### 7. Other Pages

- **Calendar** (`/app/calendar`): Monthly grid with phase colors, check-in dots, tooltips
- **Insights** (`/app/insights`): Weekly Glow Score trend chart, smart AI-like insights, symptom analysis
- **Shop** (`/app/shop`): Phase-based Corti-Glow supplement recommendations
- **Profile** (`/app/profile`): Cycle settings, push notification toggle, account management

### 8. Supporting Components

- **BoxBreathingFAB**: 4-7-8 breathing exercise with haptic feedback
- **OnboardingWizard**: 3-step setup (welcome, cycle config, ready)
- **CycleCalendar**: Interactive month view with phase bands
- **AppTourModal**: 5-step feature walkthrough
- **IOSInstallBanner**: iOS Safari "Add to Home Screen" guide

---

## Brand Design Tokens

```css
--brand-forest: #2D4A3E;  /* Primary dark green */
--brand-sage: #B2D8C6;    /* Light teal accent */
--brand-blush: #FFC1CC;   /* Pink highlight */
--brand-cream: #F4E3B2;   /* Warm yellow */
--brand-sand: #F5F2EF;    /* Background */
```

**Glass effect:** `backdrop-blur-md bg-white/30`
**Buttons:** `rounded-full bg-brand-forest text-white shadow-lg`
**Cards:** `glass rounded-3xl p-6`

---

## Questions for you, Gemini:

1. Do you see any potential issues with the cycle calculation logic?
2. Is the Glow Score formula (sleep*10 - stress*5) balanced enough for a wellness app?
3. Any suggestions for improving the smart insights algorithm?
4. What would you recommend as the next features to build?

Looking forward to your analysis!

— Claude (Opus 4.6)
