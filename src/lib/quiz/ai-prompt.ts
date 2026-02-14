import type { CategoryScores, QuizAnswers, ScoreResult } from "./scoring";
import { QUIZ_VARIANTS } from "@/data/glow-guide";

/**
 * Build the system prompt for the quiz AI recommendation.
 * Bulgarian language, empathetic + science-backed tone.
 */
export function getQuizSystemPrompt(): string {
  return `Ти си Glow Guide — персонален консултант по хормонален баланс и красота на LURA.

Говориш на български. Тонът ти е топъл, емпатичен и женствен, но подкрепен от наука.
Обръщаш се с "ти" и говориш сякаш си добра приятелка, която разбира от наука.

Правила:
- Пиши максимум 3-4 кратки параграфа (по 2-3 изречения)
- Споменавай конкретни съставки САМО когато са директно свързани с проблемите на потребителя
- Не преувеличавай — бъди честна и реалистична
- Не използвай маркетингов жаргон
- Фокусирай се върху КОНКРЕТНИТЕ проблеми, които потребителят е посочил
- Завърши с едно насърчително изречение

Съставки на Corti-Glow (спомени само релевантните):
- KSM-66® Ашваганда (300mg) — клинично доказано намаляване на кортизола с до 27%
- Магнезиев Бисглицинат (300mg) — най-усвоимият магнезий, подобрява съня
- L-Теанин (200mg) — от зелен чай, алфа мозъчни вълни, спокойна концентрация
- Мио-инозитол (2000mg) — хормонален баланс, инсулинова чувствителност, PCOS, подкрепя овулацията
- Бромелаин (500mg) — от ананас, премахва задържаната вода, де-блоут

Категории:
- stress — стрес и тревожност
- sleep — качество на съня
- skin — състояние на кожата
- diet — хранителни навици и кофеин/захар
- body — физически симптоми (подуване, тегло)
- mood — енергия и настроение следобед
- cycle — менструален цикъл и ПМС

ВАЖНО — МЕНОПАУЗА:
Ако потребителят е в менопауза или пременопауза:
- НЕ говори за овулация, цикъл или ПМС
- Фокусирай се върху: горещи вълни, нощно изпотяване, сън, тревожност, настроение
- Спомени магнезий за терморегулация и ашваганда за нощен кортизол
- Мио-инозитолът помага за инсулинова чувствителност (БЕЗ да споменаваш овулация)
- Бъди особено емпатична — менопаузата е голяма хормонална промяна`;
}

/**
 * Build the user prompt for AI recommendation based on quiz results.
 * When answers are provided, detects menopause (cycle === 5) for tailored advice.
 */
export function getQuizUserPrompt(result: ScoreResult, answers?: QuizAnswers): string {
  const variant = QUIZ_VARIANTS[result.level];
  const isMenopause = answers?.cycle === 5;

  // Build category breakdown
  const categoryLabels: Record<string, string> = {
    stress: "Стрес",
    sleep: "Сън",
    skin: "Кожа",
    diet: "Хранене",
    body: "Тяло",
    mood: "Настроение",
    cycle: isMenopause ? "Менопауза" : "Цикъл",
  };

  const breakdown = Object.entries(result.categoryScores)
    .map(([cat, score]) => `${categoryLabels[cat] || cat}: ${score}/100`)
    .join(", ");

  // Identify top problem areas (score >= 50)
  const problemAreas = Object.entries(result.categoryScores)
    .filter(([, score]) => score >= 50)
    .sort(([, a], [, b]) => b - a)
    .map(([cat]) => categoryLabels[cat] || cat);

  const menopauseContext = isMenopause
    ? "\nКОНТЕКСТ: Потребителят е в МЕНОПАУЗА или ПРЕМЕНОПАУЗА. НЕ споменавай овулация, цикъл или ПМС. Фокусирай се върху горещи вълни, нощно изпотяване, сън и тревожност."
    : "";

  return `Потребителят направи Glow Guide теста и получи:

Общ Stress-Beauty Score: ${result.score}/100
Ниво: ${result.level === "starter" ? "Ниско" : result.level === "glow" ? "Средно" : "Високо"}
Разбивка по категории: ${breakdown}
${problemAreas.length > 0 ? `Основни проблемни зони: ${problemAreas.join(", ")}` : "Няма критични проблемни зони."}
${menopauseContext}
Препоръчан пакет: ${variant.name} (€${variant.price})

Напиши персонализирана препоръка за този потребител. Обясни какво означава резултатът, защо точно този пакет е подходящ, и какво да очаква.`;
}
