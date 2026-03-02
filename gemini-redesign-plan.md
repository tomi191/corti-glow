# LURA PWA Premium Redesign Plan (от Gemini, Feb 2026)

## Визуална Концепция: "Органична Плавност" (The 2026 Vibe)

- **Край на перфектните геометрии**: Заменяме твърдите кръгове и квадратни карти с "органика" – squircle (заоблени квадрати), плавно преливащи форми (blobs).
- **Текстура (Шум / Grain)**: Добавяме фин SVG noise (зърнестост) върху фоновете. Това убива "пластмасовото" усещане на дигиталния екран и го прави да изглежда като рециклирана хартия или матово стъкло. Усеща се много по-скъпо.
- **Mesh Gradients**: Вместо плоски фонове, използваме бавно движещи се, размити цветни петна (аврора ефект), които се променят според фазата на цикъла (зелено за фоликуларна, топло оранжево/крем за лутеална).
- **Микро-физика**: Всеки елемент реагира на допир с "пружинна" физика (springs), не с линейни транзишъни.

## Техническият Стак (Библиотеките за 2026)

- **Framer Motion (Основата)**: Остава. 90% от микро-интеракциите, layout транзишъни и drag.
- **Rive (@rive-app/react-canvas)**: Тайното оръжие. 10x по-малки от Lottie, интерактивни (State Machines). За интерактивни икони и "дихателното упражнение".
- **Spline (@splinetool/react-spline)**: МНОГО пестеливо. Само 1-2 Hero елемента (3D абстрактно цвете/сфера в Dashboard). Внимание: Твърде много Spline ще стопи батерията.
- **Visx (от Airbnb)**: За Insights графиките. Low-level D3 мощност с React компоненти. Светещи Area charts с градиенти.
- **View Transitions API**: Плавно преминаване между страниците. Не зареждаме нови HTML страници, а се местим из едно общо пространство.

## Екран по Екран

### Dashboard (Главен екран)
- Background: Анимиран Mesh Gradient + Grain текстура
- Glow Ring → Morphing Blob (Framer Motion `d` атрибут, "диша" 2%)
- Карти: Тънки рамки (border-white/20), inner shadow, дълбока мека сянка

### Quick Check-in
- Custom Framer Motion drag слайдери (не input[type=range])
- Линията се "огъва" като ластик, цветът преминава от Sage → Blush
- Haptics: `navigator.vibrate([10])` при всяка единица

### Box Breathing (Дихателно упражнение)
- Spline или Rive: 3D стъклена сфера
- Вдишване → разширява + светлина
- Задържане → пулсира
- Издишване → свива + матова

### Insights & Calendar
- Visx Area Chart с curveMonotoneX, полупрозрачен градиент
- Графиката се "разгръща" от ляво надясно при скрол
- Календар: хоризонтален скролващ timeline (pills по фаза)

## Приоритизация (Impact vs. Effort)

1. 🔥 **P1 (Max Impact, Low Effort)**: Noise + Mesh Gradients (1 час, променя цялото усещане)
2. 🔥 **P2 (Max Impact, Med Effort)**: Custom Framer Motion Слайдери за Check-in
3. ⚡ **P3 (Med Impact, Med Effort)**: Morphing SVG за Дневния баланс ("диша")
4. 🛠️ **P4 (High Impact, High Effort)**: Spline/Rive за Box Breathing

## Код: PremiumBackground.tsx

```tsx
"use client";
import { motion } from "framer-motion";

export default function PremiumBackground() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-[-1] bg-brand-sand">
      {/* Animated Mesh Gradient Blurs */}
      <motion.div
        animate={{
          x: ["0%", "-10%", "5%", "0%"],
          y: ["0%", "15%", "-5%", "0%"],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] bg-brand-sage rounded-full mix-blend-multiply filter blur-[80px] opacity-40"
      />
      <motion.div
        animate={{
          x: ["0%", "15%", "-10%", "0%"],
          y: ["0%", "-10%", "10%", "0%"],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[60%] bg-brand-cream rounded-full mix-blend-multiply filter blur-[90px] opacity-50"
      />

      {/* SVG Noise / Grain Filter */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04] mix-blend-overlay">
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  );
}
```
