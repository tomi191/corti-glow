// Pure TypeScript - no React. Types + functions for the Glow Tracker PWA.

export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

export interface PhaseInfo {
  name: string; // BG name
  description: string;
  season: string; // metaphor
  iconName: "Snowflake" | "Sprout" | "Sun" | "Leaf";
  colorClass: string; // Tailwind class
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

export interface DailyCheckIn {
  date: string; // YYYY-MM-DD
  periodStarted: boolean;
  sleep: number; // 0-10
  stress: number; // 0-10
  symptoms: SymptomOption[];
  glowScore: number; // 0-100
}

// ─── Cycle helpers ───

export function getCycleDay(
  lastPeriodDate: string | null,
  cycleLength = 28
): number {
  if (!lastPeriodDate) return 0;
  // Parse as local midnight to avoid UTC timezone offset
  const [y, m, d] = lastPeriodDate.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
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

// ─── Phase for arbitrary date ───

export function getPhaseForDate(
  dateStr: string,
  lastPeriodDate: string | null,
  cycleLength = 28,
  periodDuration = 5
): CyclePhase | null {
  if (!lastPeriodDate) return null;
  const [y1, m1, d1] = lastPeriodDate.split("-").map(Number);
  const start = new Date(y1, m1 - 1, d1);
  const [y2, m2, d2] = dateStr.split("-").map(Number);
  const target = new Date(y2, m2 - 1, d2);
  const diffMs = target.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  // Normalize to positive cycle day (works for dates before lastPeriodDate too)
  const cycleDay = ((diffDays % cycleLength) + cycleLength) % cycleLength + 1;
  return getCyclePhase(cycleDay, periodDuration);
}

export function isPeriodDay(
  dateStr: string,
  lastPeriodDate: string | null,
  cycleLength = 28,
  periodDuration = 5
): boolean {
  if (!lastPeriodDate) return false;
  const [y1, m1, d1] = lastPeriodDate.split("-").map(Number);
  const start = new Date(y1, m1 - 1, d1);
  const [y2, m2, d2] = dateStr.split("-").map(Number);
  const target = new Date(y2, m2 - 1, d2);
  const diffMs = target.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const cycleDay = ((diffDays % cycleLength) + cycleLength) % cycleLength + 1;
  return cycleDay <= periodDuration;
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

// ─── Daily Actions ───

export interface DailyAction {
  type: "food" | "exercise" | "supplement";
  title: string;
  description: string;
}

const DAILY_ACTIONS: Record<CyclePhase, DailyAction[]> = {
  menstrual: [
    { type: "food", title: "Богати на желязо храни", description: "Спанак, леща и червено месо за възстановяване на желязото." },
    { type: "exercise", title: "Лека йога", description: "15 мин. нежни пози за облекчаване на дискомфорта." },
    { type: "supplement", title: "Магнезий за крампи", description: "Магнезиевият бисглицинат облекчава менструалните болки." },
  ],
  follicular: [
    { type: "food", title: "Ферментирали храни", description: "Кисело зеле, кефир — подкрепят чревната флора и имунитета." },
    { type: "exercise", title: "Кардио или сила", description: "Енергията расте — идеално за интензивна тренировка." },
    { type: "supplement", title: "B-витамини", description: "Засилват енергийния метаболизъм и ясния ум." },
  ],
  ovulation: [
    { type: "food", title: "Антиоксидантни храни", description: "Боровинки, домати, зелен чай — за пикова форма." },
    { type: "exercise", title: "HIIT или групово", description: "Използвай пиковата си енергия за максимална ефективност." },
    { type: "supplement", title: "Цинк + Витамин D", description: "Поддържат хормоналния баланс по време на овулация." },
  ],
  luteal: [
    { type: "food", title: "Комплексни въглехидрати", description: "Овесени ядки, сладки картофи — за стабилна енергия." },
    { type: "exercise", title: "Пилатес или разходка", description: "Забави темпото — тялото иска по-спокойно движение." },
    { type: "supplement", title: "Corti-Glow Ритуал", description: "Ашваганда + Магнезий за по-лек ПМС и по-добър сън." },
  ],
};

export function getDailyActions(phase: CyclePhase): DailyAction[] {
  return DAILY_ACTIONS[phase];
}

// ─── Phase Recommendations (for Shop) ───

export interface PhaseRecommendation {
  benefit: string;
  ingredients: string[];
}

const PHASE_RECOMMENDATIONS: Record<CyclePhase, PhaseRecommendation> = {
  menstrual: {
    benefit: "Облекчава крампите и подобрява съня по време на менструация",
    ingredients: ["Магнезиев Бисглицинат (300mg)", "L-Теанин (200mg)"],
  },
  follicular: {
    benefit: "Подкрепя растящата енергия и фокус във фоликуларната фаза",
    ingredients: ["L-Теанин (200mg)", "Мио-инозитол (2000mg)"],
  },
  ovulation: {
    benefit: "Максимизира пиковата форма и поддържа баланса при овулация",
    ingredients: ["Мио-инозитол (2000mg)", "Бромелаин (500mg)"],
  },
  luteal: {
    benefit: "Намалява ПМС симптомите и кортизола в лутеалната фаза",
    ingredients: ["Ашваганда KSM-66 (300mg)", "Магнезиев Бисглицинат (300mg)"],
  },
};

export function getPhaseRecommendation(phase: CyclePhase): PhaseRecommendation {
  return PHASE_RECOMMENDATIONS[phase];
}

// ─── Smart Insights ───

export interface WeeklyInsight {
  type: "positive" | "warning" | "neutral";
  title: string;
  description: string;
}

export function generateWeeklyInsights(
  checkIns: DailyCheckIn[],
  phase: CyclePhase
): WeeklyInsight[] {
  const insights: WeeklyInsight[] = [];
  if (checkIns.length < 3) return insights;

  const now = new Date();
  const thisWeek = checkIns.filter((c) => {
    const [y, m, d] = c.date.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const daysAgo = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 7;
  });
  const prevWeek = checkIns.filter((c) => {
    const [y, m, d] = c.date.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const daysAgo = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo > 7 && daysAgo <= 14;
  });

  // Sleep trend
  if (thisWeek.length >= 2) {
    const avgSleepNow = thisWeek.reduce((s, c) => s + c.sleep, 0) / thisWeek.length;
    if (prevWeek.length >= 2) {
      const avgSleepPrev = prevWeek.reduce((s, c) => s + c.sleep, 0) / prevWeek.length;
      const diff = avgSleepNow - avgSleepPrev;
      if (diff >= 1) {
        insights.push({
          type: "positive",
          title: `Сънят ти се подобри с ${Math.round((diff / avgSleepPrev) * 100)}%`,
          description: "Продължавай така! Добрият сън е основата на хормоналния баланс.",
        });
      } else if (diff <= -1) {
        insights.push({
          type: "warning",
          title: `Сънят ти спадна тази седмица`,
          description: "Опитай магнезий преди лягане и намали екраните 1 час преди сън.",
        });
      }
    }

    // High stress pattern
    const avgStress = thisWeek.reduce((s, c) => s + c.stress, 0) / thisWeek.length;
    if (avgStress >= 6) {
      insights.push({
        type: "warning",
        title: "Стресът ти е висок тази седмица",
        description: "Пробвай дихателното упражнение в приложението — 4 минути правят разлика.",
      });
    } else if (avgStress <= 3) {
      insights.push({
        type: "positive",
        title: "Ниско ниво на стрес — браво!",
        description: "Тялото ти се възстановява по-бързо, когато си спокойна.",
      });
    }
  }

  // Phase-specific insight
  const phaseInsights: Record<CyclePhase, WeeklyInsight> = {
    menstrual: {
      type: "neutral",
      title: "Менструална фаза — време за грижа",
      description: "Нормално е енергията да е по-ниска. Фокусирай се на почивка и богати на желязо храни.",
    },
    follicular: {
      type: "positive",
      title: "Фоликуларна фаза — енергията расте",
      description: "Идеален момент за нови проекти и по-интензивни тренировки.",
    },
    ovulation: {
      type: "positive",
      title: "Овулация — ти си в пикова форма",
      description: "Използвай тази енергия! Социалните контакти и тренировките ще ти се отразят страхотно.",
    },
    luteal: {
      type: "neutral",
      title: "Лутеална фаза — забави темпото",
      description: "Ако се чувстваш по-раздразнителна — нормално е. Ашваганда и топъл чай помагат.",
    },
  };
  insights.push(phaseInsights[phase]);

  // Symptom pattern
  if (checkIns.length >= 5) {
    const symptomCounts = new Map<SymptomOption, number>();
    for (const ci of checkIns) {
      for (const s of ci.symptoms) {
        symptomCounts.set(s, (symptomCounts.get(s) || 0) + 1);
      }
    }
    const topSymptom = Array.from(symptomCounts.entries()).sort((a, b) => b[1] - a[1])[0];
    if (topSymptom && topSymptom[1] >= 3) {
      const pct = Math.round((topSymptom[1] / checkIns.length) * 100);
      insights.push({
        type: "neutral",
        title: `"${topSymptom[0]}" се появява в ${pct}% от дните`,
        description: "Следи дали е свързано с определена фаза — това ще ти помогне да го управляваш.",
      });
    }
  }

  return insights;
}

export function getGlowScoreTrend(checkIns: DailyCheckIn[]): {
  current: number | null;
  previous: number | null;
  change: number | null;
  direction: "up" | "down" | "same";
} {
  const now = new Date();
  const thisWeek = checkIns.filter((c) => {
    const [y, m, d] = c.date.split("-").map(Number);
    const daysAgo = (now.getTime() - new Date(y, m - 1, d).getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 7;
  });
  const prevWeek = checkIns.filter((c) => {
    const [y, m, d] = c.date.split("-").map(Number);
    const daysAgo = (now.getTime() - new Date(y, m - 1, d).getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo > 7 && daysAgo <= 14;
  });

  const current = thisWeek.length > 0
    ? Math.round(thisWeek.reduce((s, c) => s + c.glowScore, 0) / thisWeek.length)
    : null;
  const previous = prevWeek.length > 0
    ? Math.round(prevWeek.reduce((s, c) => s + c.glowScore, 0) / prevWeek.length)
    : null;

  if (current === null || previous === null) {
    return { current, previous, change: null, direction: "same" };
  }

  const change = current - previous;
  return {
    current,
    previous,
    change,
    direction: change > 2 ? "up" : change < -2 ? "down" : "same",
  };
}

// ─── Greeting ───

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "Лека нощ";
  if (hour < 12) return "Добро утро";
  if (hour < 18) return "Добър ден";
  return "Добър вечер";
}
