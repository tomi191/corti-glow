import {
  CATEGORY_WEIGHTS,
  SCORE_THRESHOLDS,
  QUIZ_QUESTIONS,
  type QuizQuestion,
} from "@/data/glow-guide";

export interface QuizAnswers {
  [questionId: string]: number; // questionId → selected option value (0-5, where 5 = menopause marker)
}

export interface CategoryScores {
  [category: string]: number; // category → normalized score (0-100)
}

export interface ScoreResult {
  score: number; // 0-100 final score
  level: "starter" | "glow" | "restart";
  categoryScores: CategoryScores;
}

/**
 * Calculate the Stress-Beauty Score from quiz answers.
 * Each answer is 0-4, normalized to 0-100 per category,
 * then weighted by CATEGORY_WEIGHTS to produce final 0-100 score.
 */
export function calculateScore(answers: QuizAnswers): ScoreResult {
  const MAX_PER_QUESTION = 4;

  // Calculate per-category normalized scores (0-100)
  const categoryScores: CategoryScores = {};

  for (const question of QUIZ_QUESTIONS) {
    const answerValue = answers[question.id];
    if (answerValue === undefined) continue;

    // Clamp to valid range
    const clamped = Math.max(0, Math.min(MAX_PER_QUESTION, answerValue));
    categoryScores[question.category] = Math.round(
      (clamped / MAX_PER_QUESTION) * 100
    );
  }

  // Calculate weighted final score
  let weightedSum = 0;
  let totalWeight = 0;

  for (const [category, weight] of Object.entries(CATEGORY_WEIGHTS)) {
    if (categoryScores[category] !== undefined) {
      weightedSum += categoryScores[category] * weight;
      totalWeight += weight;
    }
  }

  // Normalize in case some categories are missing
  const score =
    totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  // Determine level from thresholds
  let level: ScoreResult["level"] = "starter";
  if (score >= SCORE_THRESHOLDS.restart.min) {
    level = "restart";
  } else if (score >= SCORE_THRESHOLDS.glow.min) {
    level = "glow";
  }

  return { score, level, categoryScores };
}

/**
 * Validate that answers object has all required question IDs
 * and values are within valid range.
 */
export function validateAnswers(
  answers: unknown
): answers is QuizAnswers {
  if (!answers || typeof answers !== "object") return false;

  const ans = answers as Record<string, unknown>;
  const questionIds = QUIZ_QUESTIONS.map((q) => q.id);

  for (const id of questionIds) {
    const val = ans[id];
    if (typeof val !== "number" || val < 0 || val > 5) return false;
  }

  return true;
}
