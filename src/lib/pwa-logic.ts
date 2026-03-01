// Pure TypeScript - no React. Types + functions for the LURA PWA (Nervous System Navigator).
import { isValidDateString, getDiffDays } from "@/lib/date-utils";

export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

export interface PhaseInfo {
  name: string; // BG name
  description: string;
  explanation: string; // plain-language explanation of what this phase IS
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

// ─── Concern Options (Onboarding) ───

export const CONCERN_OPTIONS = [
  { key: "stress", label: "Стрес" },
  { key: "sleep", label: "Лош сън" },
  { key: "skin", label: "Кожа и акне" },
  { key: "pms", label: "ПМС и раздразнителност" },
  { key: "bloating", label: "Подуване" },
  { key: "fatigue", label: "Умора" },
  { key: "anxiety", label: "Тревожност" },
  { key: "irregular", label: "Нередовен цикъл" },
] as const;

export type ConcernOption = (typeof CONCERN_OPTIONS)[number]["key"];

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
  if (!lastPeriodDate || !isValidDateString(lastPeriodDate)) return 0;
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const diffDays = getDiffDays(lastPeriodDate, todayStr);
  // Normalize to positive cycle day (handles dates before lastPeriodDate)
  return ((diffDays % cycleLength) + cycleLength) % cycleLength + 1;
}

export function getCyclePhase(
  cycleDay: number,
  periodDuration = 5,
  cycleLength = 28
): CyclePhase {
  if (cycleDay <= 0) return "follicular";
  // Luteal phase is ~14 days; ovulation adapts to cycle length
  // Ensure ovulationDay leaves at least 1 day for follicular phase
  const rawOvulationDay = cycleLength - 14;
  const ovulationDay = Math.max(rawOvulationDay, periodDuration + 3);
  if (cycleDay <= periodDuration) return "menstrual";
  if (cycleDay <= ovulationDay - 2) return "follicular";
  if (cycleDay <= ovulationDay + 1) return "ovulation";
  return "luteal";
}

const PHASE_INFO: Record<CyclePhase, PhaseInfo> = {
  menstrual: {
    name: "Менструална фаза",
    description: "Тялото ти обикновено иска повече почивка тези дни",
    explanation: "Период — тялото ти се нуждае от повече почивка",
    season: "Зима",
    iconName: "Snowflake",
    colorClass: "text-red-400 bg-red-50",
  },
  follicular: {
    name: "Фоликуларна фаза",
    description: "Повечето жени усещат повече енергия в тази фаза",
    explanation: "След период — енергията постепенно се връща",
    season: "Пролет",
    iconName: "Sprout",
    colorClass: "text-emerald-600 bg-emerald-50",
  },
  ovulation: {
    name: "Овулация",
    description: "Енергията обикновено е най-висока около тези дни",
    explanation: "Среда на цикъла — най-енергичните ти дни",
    season: "Лято",
    iconName: "Sun",
    colorClass: "text-amber-500 bg-amber-50",
  },
  luteal: {
    name: "Лутеална фаза",
    description: "Нормално е да нямаш толкова сили — не е лентяйство",
    explanation: "Преди период — тялото забавя темпо",
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
  if (!lastPeriodDate || !isValidDateString(lastPeriodDate) || !isValidDateString(dateStr)) return null;
  const diffDays = getDiffDays(lastPeriodDate, dateStr);
  const cycleDay = ((diffDays % cycleLength) + cycleLength) % cycleLength + 1;
  return getCyclePhase(cycleDay, periodDuration, cycleLength);
}

export function isPeriodDay(
  dateStr: string,
  lastPeriodDate: string | null,
  cycleLength = 28,
  periodDuration = 5
): boolean {
  if (!lastPeriodDate || !isValidDateString(lastPeriodDate) || !isValidDateString(dateStr)) return false;
  const diffDays = getDiffDays(lastPeriodDate, dateStr);
  const cycleDay = ((diffDays % cycleLength) + cycleLength) % cycleLength + 1;
  return cycleDay <= periodDuration;
}

// ─── Glow Score ───

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function calculateGlowScore(
  sleep: number,
  stress: number,
  symptomsCount = 0
): number {
  return clamp(30 + sleep * 7 - stress * 5 - symptomsCount * 3, 10, 100);
}

// ─── Daily Tips ───

const TIPS: Record<CyclePhase, [string, string]> = {
  menstrual: [
    "Магнезий преди лягане може да помогне за по-спокоен сън в тези дни.",
    "При висок стрес в менструалната фаза, 5 минути дихателно упражнение реално помага.",
  ],
  follicular: [
    "Ако ти се тренира — хвани момента, тялото обикновено е готово за натоварване сега.",
    "Чувстваш натоварване? 20 минути разходка навън — не е малко, реално помага.",
  ],
  ovulation: [
    "Енергията обикновено е добра тези дни — използвай я за нещо, което отлагаш.",
    "Ако стресът е висок въпреки добрата енергия — не го пренебрегвай, направи пауза.",
  ],
  luteal: [
    "Нормално е да нямаш сили. Спести си тежката тренировка и не се обвинявай.",
    "Стресът може да засили ПМС симптомите — ашваганда и топъл чай наистина помагат.",
  ],
};

export function getDailyTip(phase: CyclePhase, stressLevel: number): string {
  const [lowStress, highStress] = TIPS[phase];
  return stressLevel >= 6 ? highStress : lowStress;
}

// ─── Always-visible phase tip (no check-in needed) ───

const DAILY_PHASE_TIPS: Record<CyclePhase, string> = {
  menstrual:
    "Не се натоварвай допълнително. Топла храна, почивка и магнезий — тялото ти знае какво иска.",
  follicular:
    "Тялото ти обикновено е по-енергично сега. Добър момент за неща, които си отлагала.",
  ovulation:
    "Енергията обикновено е на максимум. Ако имаш нещо важно или разговор, който отлагаш — сега е моментът.",
  luteal:
    "Ако се чувстваш по-уморена или раздразнителна — не е нещо нередно с теб. Забави темпото и не се обвинявай.",
};

export function getDailyPhaseTip(phase: CyclePhase): string {
  return DAILY_PHASE_TIPS[phase];
}

// ─── Daily Actions ───

export interface DailyAction {
  type: "food" | "exercise" | "supplement";
  title: string;
  description: string;
}

const DAILY_ACTIONS: Record<CyclePhase, { low: DailyAction[]; high: DailyAction[] }> = {
  menstrual: {
    low: [
      { type: "food", title: "Храни с желязо", description: "Спанак, леща, червено месо — тялото губи желязо тези дни и го усеща." },
      { type: "exercise", title: "Лека разходка или йога", description: "15 мин. бавно движение. Не тренирай през болка, няма смисъл." },
      { type: "supplement", title: "Магнезий", description: "Магнезиев бисглицинат преди лягане — доказано облекчава крампите." },
    ],
    high: [
      { type: "food", title: "Топла супа", description: "Топла, лесна храна. Не се натоварвай с готвене — супата е достатъчна." },
      { type: "exercise", title: "Само дишане", description: "4-7-8 дихателна техника. Звучи просто, но реално намалява кортизола." },
      { type: "supplement", title: "Магнезий + L-Теанин", description: "Комбинацията работи за стрес и крампи едновременно." },
    ],
  },
  follicular: {
    low: [
      { type: "food", title: "Ферментирали храни", description: "Кисело зеле, кефир — подкрепят храносмилането и имунитета." },
      { type: "exercise", title: "Тренировка по избор", description: "Тялото обикновено е готово за натоварване. Ако ти се тренира — сега е моментът." },
      { type: "supplement", title: "B-витамини", description: "Подкрепят енергийния метаболизъм, особено ако пиеш много кафе." },
    ],
    high: [
      { type: "food", title: "Авокадо и зеленчуци", description: "Здрави мазнини и магнезий — помагат на нервната система." },
      { type: "exercise", title: "30 мин. бързо ходене", description: "Навън, не в залата. Движението на открито понижава кортизола по-ефективно." },
      { type: "supplement", title: "Ашваганда + B-витамини", description: "Ашвагандата е доказан адаптоген — помага на тялото да се справя със стрес." },
    ],
  },
  ovulation: {
    low: [
      { type: "food", title: "Плодове и зеленчуци", description: "Боровинки, домати, зелен чай — антиоксидантите помагат в тази фаза." },
      { type: "exercise", title: "Интензивна тренировка", description: "Ако имаш енергия — използвай я. HIIT, бягане, каквото ти харесва." },
      { type: "supplement", title: "Цинк + Витамин D", description: "Подкрепят хормоналния баланс, особено ако рядко излизаш на слънце." },
    ],
    high: [
      { type: "food", title: "Риба и орехи", description: "Омега-3 помага на мозъка и намалява възпалението." },
      { type: "exercise", title: "Йога или плуване", description: "Движение без допълнителен кортизол — тялото има енергия, но стресът краде от нея." },
      { type: "supplement", title: "L-Теанин + Цинк", description: "L-теанинът дава спокоен фокус без сънливост." },
    ],
  },
  luteal: {
    low: [
      { type: "food", title: "Сложни въглехидрати", description: "Овесени ядки, сладки картофи — стабилна енергия, без скокове на кръвна захар." },
      { type: "exercise", title: "Разходка или пилатес", description: "Забави темпото. Тялото обикновено иска по-спокойно движение тези дни." },
      { type: "supplement", title: "Ашваганда + Магнезий", description: "Съставките в Corti-Glow (KSM-66, Магнезий) са клинично доказани за тази фаза." },
    ],
    high: [
      { type: "food", title: "Шоколад и банани", description: "Тъмен шоколад (70%+) и банани — магнезий и триптофан, не са лакомия, а нужда." },
      { type: "exercise", title: "Разходка навън", description: "20 мин. сред зеленина. Не е тренировка — но за кортизола работи по-добре от залата." },
      { type: "supplement", title: "Ашваганда + Магнезий + L-Теанин", description: "Пълната комбинация в Corti-Glow — клинично доказана за намаляване на кортизола." },
    ],
  },
};

export function getDailyActions(phase: CyclePhase, stressLevel = 0): DailyAction[] {
  const actions = DAILY_ACTIONS[phase];
  return stressLevel >= 6 ? actions.high : actions.low;
}

// ─── Phase Recommendations (for Shop) ───

export interface PhaseRecommendation {
  benefit: string;
  ingredients: string[];
}

const PHASE_RECOMMENDATIONS: Record<CyclePhase, PhaseRecommendation> = {
  menstrual: {
    benefit: "Магнезият и L-Теанинът са сред най-изследваните съставки за крампи и сън",
    ingredients: ["Магнезиев Бисглицинат (300mg)", "L-Теанин (200mg)"],
  },
  follicular: {
    benefit: "L-Теанинът подкрепя фокуса, а Мио-инозитолът — хормоналния баланс",
    ingredients: ["L-Теанин (200mg)", "Мио-инозитол (2000mg)"],
  },
  ovulation: {
    benefit: "Мио-инозитолът помага за хормоналния баланс, Бромелаинът — за възпалението",
    ingredients: ["Мио-инозитол (2000mg)", "Бромелаин (100mg)"],
  },
  luteal: {
    benefit: "KSM-66 Ашваганда е клинично доказана за намаляване на кортизола при стрес",
    ingredients: ["Ашваганда KSM-66 (300mg)", "Магнезиев Бисглицинат (300mg)"],
  },
};

export function getPhaseRecommendation(phase: CyclePhase): PhaseRecommendation {
  return PHASE_RECOMMENDATIONS[phase];
}

// ─── Concern → Ingredient Mapping (Monetization) ───

export interface ConcernRecommendation {
  concern: string; // BG label
  ingredient: string;
  dosage: string;
  claim: string; // one-liner science-backed claim
}

const CONCERN_INGREDIENT_MAP: Record<ConcernOption, ConcernRecommendation[]> = {
  stress: [
    { concern: "Стрес", ingredient: "Ашваганда KSM-66", dosage: "300mg", claim: "Клинично доказано намаляване на кортизола с до 27%" },
    { concern: "Стрес", ingredient: "L-Теанин", dosage: "200mg", claim: "Стимулира алфа вълните за спокоен фокус без сънливост" },
  ],
  sleep: [
    { concern: "Лош сън", ingredient: "Магнезиев Бисглицинат", dosage: "300mg", claim: "Най-усвоимата форма на магнезий — подобрява качеството на съня" },
    { concern: "Лош сън", ingredient: "L-Теанин", dosage: "200mg", claim: "Помага за по-бързо заспиване без сънливост на сутринта" },
  ],
  skin: [
    { concern: "Кожа и акне", ingredient: "Мио-инозитол", dosage: "2000mg", claim: "Подкрепя хормоналния баланс, свързан с акне" },
    { concern: "Кожа и акне", ingredient: "Бромелаин", dosage: "100mg", claim: "Намалява възпалението, което влияе на кожата" },
  ],
  pms: [
    { concern: "ПМС", ingredient: "Ашваганда KSM-66", dosage: "300mg", claim: "Намалява кортизола, който усилва ПМС симптомите" },
    { concern: "ПМС", ingredient: "Магнезиев Бисглицинат", dosage: "300mg", claim: "Доказано облекчава крампи, раздразнителност и задържане на вода" },
  ],
  bloating: [
    { concern: "Подуване", ingredient: "Бромелаин", dosage: "100mg", claim: "Ензим от ананас — премахва задържаната вода" },
    { concern: "Подуване", ingredient: "Магнезиев Бисглицинат", dosage: "300mg", claim: "Помага за нормалния електролитен баланс" },
  ],
  fatigue: [
    { concern: "Умора", ingredient: "Ашваганда KSM-66", dosage: "300mg", claim: "Адаптоген — помага на тялото да се справя с натоварване" },
    { concern: "Умора", ingredient: "Магнезиев Бисглицинат", dosage: "300mg", claim: "Участва в 300+ ензимни реакции за енергиен метаболизъм" },
  ],
  anxiety: [
    { concern: "Тревожност", ingredient: "L-Теанин", dosage: "200mg", claim: "Насърчава алфа мозъчни вълни — спокойствие без сънливост" },
    { concern: "Тревожност", ingredient: "Ашваганда KSM-66", dosage: "300mg", claim: "Клинично доказано намаляване на тревожността с до 56%" },
  ],
  irregular: [
    { concern: "Нередовен цикъл", ingredient: "Мио-инозитол", dosage: "2000mg", claim: "Подкрепя инсулиновата чувствителност и хормоналния баланс" },
    { concern: "Нередовен цикъл", ingredient: "Ашваганда KSM-66", dosage: "300mg", claim: "Балансира кортизола, който влияе на хормоналната ос" },
  ],
};

/**
 * Returns personalized ingredient recommendations based on user's onboarding concerns.
 * Deduplicates ingredients (same ingredient may appear for multiple concerns).
 */
export function getConcernRecommendations(concerns: ConcernOption[]): ConcernRecommendation[] {
  if (concerns.length === 0) return [];

  const seen = new Set<string>();
  const results: ConcernRecommendation[] = [];

  for (const concern of concerns) {
    const recs = CONCERN_INGREDIENT_MAP[concern];
    if (!recs) continue;
    for (const rec of recs) {
      if (!seen.has(rec.ingredient)) {
        seen.add(rec.ingredient);
        results.push(rec);
      }
    }
  }

  return results;
}

// ─── Smart Insights ───

export interface WeeklyInsight {
  type: "positive" | "warning" | "neutral";
  title: string;
  description: string;
}

export function generateWeeklyInsights(
  checkIns: DailyCheckIn[],
  phase: CyclePhase,
  cycleConfig?: { lastPeriodDate: string | null; cycleLength: number; periodDuration: number }
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
          description: "Добрият сън е едно от малкото неща, които наистина влияят на всичко останало.",
        });
      } else if (diff <= -1) {
        insights.push({
          type: "warning",
          title: `Сънят ти спадна тази седмица`,
          description: "Магнезий преди лягане и по-малко екрани вечер — звучи просто, но работи.",
        });
      }
    }

    // High stress pattern
    const avgStress = thisWeek.reduce((s, c) => s + c.stress, 0) / thisWeek.length;
    if (avgStress >= 6) {
      insights.push({
        type: "warning",
        title: "Стресът ти е висок тази седмица",
        description: "Пробвай дихателното упражнение — 4 минути звучат малко, но кортизолът реално спада.",
      });
    } else if (avgStress <= 3) {
      insights.push({
        type: "positive",
        title: "Ниско ниво на стрес тази седмица",
        description: "Тялото ти се възстановява по-добре, когато стресът е нисък. Не е случайност.",
      });
    }
  }

  // 30-day phase-stress correlation (luteal vs follicular)
  if (cycleConfig?.lastPeriodDate && checkIns.length >= 7) {
    const last30 = checkIns.filter((c) => {
      const [y, m, d] = c.date.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      const daysAgo = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    });

    const phaseStress: Record<string, number[]> = { luteal: [], follicular: [] };
    for (const ci of last30) {
      const ciPhase = getPhaseForDate(
        ci.date,
        cycleConfig.lastPeriodDate,
        cycleConfig.cycleLength,
        cycleConfig.periodDuration
      );
      if (ciPhase === "luteal" || ciPhase === "follicular") {
        phaseStress[ciPhase].push(ci.stress);
      }
    }

    const lutealData = phaseStress.luteal;
    const follicularData = phaseStress.follicular;
    if (lutealData.length >= 2 && follicularData.length >= 2) {
      const avgLuteal = lutealData.reduce((a, b) => a + b, 0) / lutealData.length;
      const avgFollicular = follicularData.reduce((a, b) => a + b, 0) / follicularData.length;
      if (avgLuteal > avgFollicular + 2.0) {
        insights.push({
          type: "warning",
          title: "Стресът ти расте в лутеалната фаза",
          description: `Средно ${avgLuteal.toFixed(1)} vs ${avgFollicular.toFixed(1)} във фоликуларната. Не си ти — тялото реагира различно в тази фаза.`,
        });
      }
    }
  }

  // Phase-specific insight
  const phaseInsights: Record<CyclePhase, WeeklyInsight> = {
    menstrual: {
      type: "neutral",
      title: "Менструална фаза",
      description: "Нормално е да нямаш енергия. Не се обвинявай — тялото ти буквално се възстановява.",
    },
    follicular: {
      type: "positive",
      title: "Фоликуларна фаза",
      description: "Повечето жени усещат повече енергия сега. Ако ти се тренира или започне нещо ново — хвани момента.",
    },
    ovulation: {
      type: "positive",
      title: "Овулация",
      description: "Енергията обикновено е най-висока тези дни. Ако имаш нещо, което отлагаш — сега е моментът.",
    },
    luteal: {
      type: "neutral",
      title: "Лутеална фаза",
      description: "Ако се чувстваш по-раздразнителна или уморена — не си ти, това е фазата. Забави темпото.",
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
        title: `„${topSymptom[0]}" се появява в ${pct}% от дните`,
        description: "Виж дали е свързано с определена фаза — ако е, значи не е случайно и можеш да се подготвиш.",
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
