// Pure TypeScript - no React. Types + functions for the Glow Tracker PWA.

export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

export interface PhaseInfo {
  name: string; // BG name
  description: string;
  season: string; // metaphor
  iconName: "Snowflake" | "Sprout" | "Sun" | "Leaf";
  colorClass: string; // Tailwind class
}

export interface DailyCheckIn {
  date: string; // YYYY-MM-DD
  periodStarted: boolean;
  sleep: number; // 0-10
  stress: number; // 0-10
  symptoms: string[];
  glowScore: number; // 0-100
}

// ─── Cycle helpers ───

export function getCycleDay(
  lastPeriodDate: string | null,
  cycleLength = 28
): number {
  if (!lastPeriodDate) return 0;
  const start = new Date(lastPeriodDate);
  const today = new Date();
  const diffMs = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  // Mod to keep within cycle, add 1 for 1-based day
  return (diffDays % cycleLength) + 1;
}

export function getCyclePhase(
  cycleDay: number,
  periodDuration = 5
): CyclePhase {
  if (cycleDay <= 0) return "follicular";
  if (cycleDay <= periodDuration) return "menstrual";
  if (cycleDay < 12) return "follicular";
  if (cycleDay <= 16) return "ovulation";
  return "luteal";
}

const PHASE_INFO: Record<CyclePhase, PhaseInfo> = {
  menstrual: {
    name: "Менструална фаза",
    description: "Време за почивка и грижа за себе си",
    season: "Зима",
    iconName: "Snowflake",
    colorClass: "text-red-400 bg-red-50",
  },
  follicular: {
    name: "Фоликуларна фаза",
    description: "Енергията расте, идеално за нови начала",
    season: "Пролет",
    iconName: "Sprout",
    colorClass: "text-emerald-600 bg-emerald-50",
  },
  ovulation: {
    name: "Овулация",
    description: "Пикова енергия и увереност",
    season: "Лято",
    iconName: "Sun",
    colorClass: "text-amber-500 bg-amber-50",
  },
  luteal: {
    name: "Лутеална фаза",
    description: "Забави темпото и се наслади на уюта",
    season: "Есен",
    iconName: "Leaf",
    colorClass: "text-orange-500 bg-orange-50",
  },
};

export function getPhaseInfo(phase: CyclePhase): PhaseInfo {
  return PHASE_INFO[phase];
}

// ─── Glow Score ───

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function calculateGlowScore(sleep: number, stress: number): number {
  return clamp(sleep * 10 - stress * 5, 0, 100);
}

// ─── Daily Tips ───

const TIPS: Record<CyclePhase, [string, string]> = {
  menstrual: [
    "Добави магнезий преди лягане - помага за по-спокоен сън по време на менструация.",
    "Стресът е висок - опитай 5 минути дихателно упражнение преди да заспиш.",
  ],
  follicular: [
    "Перфектно време за нов фитнес ритуал! Енергията ти расте.",
    "Чувстваш натоварване? Кратка разходка на открито ще върне баланса.",
  ],
  ovulation: [
    "Ти си в пикова форма! Използвай енергията за нещо, което ти носи радост.",
    "При висок стрес по време на овулация - L-теанинът е твоят съюзник.",
  ],
  luteal: [
    "Тялото ти иска повече почивка. Позволи си я без вина.",
    "Стресът може да засили ПМС симптомите. Опитай ашваганда и топъл чай.",
  ],
};

export function getDailyTip(phase: CyclePhase, stressLevel: number): string {
  const [lowStress, highStress] = TIPS[phase];
  return stressLevel >= 6 ? highStress : lowStress;
}

// ─── Greeting ───

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "Лека нощ";
  if (hour < 12) return "Добро утро";
  if (hour < 18) return "Добър ден";
  return "Добър вечер";
}

// ─── Symptom Options ───

export const SYMPTOM_OPTIONS = [
  "Главоболие",
  "Умора",
  "Подуване",
  "Раздразнителност",
  "Болки в кръста",
  "Безсъние",
  "Тревожност",
  "Акне",
  "Желание за сладко",
  "Болки в гърдите",
  "Гадене",
  "Ниска енергия",
] as const;

export type SymptomOption = (typeof SYMPTOM_OPTIONS)[number];
