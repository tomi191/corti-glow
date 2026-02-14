import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { generateText } from "@/lib/ai/openrouter";
import { calculateScore, validateAnswers } from "@/lib/quiz/scoring";
import { getQuizSystemPrompt, getQuizUserPrompt } from "@/lib/quiz/ai-prompt";
import { QUIZ_VARIANTS } from "@/data/glow-guide";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

// 10 requests per 5 minutes
const limiter = createRateLimiter(10, 5 * 60 * 1000);

const quizSchema = z.object({
  answers: z.record(z.string(), z.number().min(0).max(4)),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    if (limiter.isLimited(ip)) {
      return NextResponse.json(
        { error: "Твърде много опити. Опитайте отново по-късно." },
        { status: 429 }
      );
    }
    limiter.recordAttempt(ip);

    const body = await request.json();

    // 1. Validate with Zod
    const validated = quizSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Невалидни данни", errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // 2. Validate all question IDs present with valid values
    if (!validateAnswers(validated.data.answers)) {
      return NextResponse.json(
        { error: "Непълни или невалидни отговори" },
        { status: 400 }
      );
    }

    // 3. Calculate score server-side (never trust client)
    const result = calculateScore(validated.data.answers);
    const variant = QUIZ_VARIANTS[result.level];

    // 4. Generate AI recommendation
    let aiRecommendation = "";
    try {
      aiRecommendation = await generateText(
        getQuizUserPrompt(result),
        getQuizSystemPrompt()
      );
    } catch (err) {
      console.error("AI recommendation failed:", err);
      // Fallback: use variant description if AI fails
      aiRecommendation = variant.description;
    }

    // 5. Store in database
    const supabase = createServerClient();
    const userAgent = request.headers.get("user-agent") || "";
    const referrer = request.headers.get("referer") || "";

    const { data: savedResponse, error: dbError } = await (supabase
      .from("quiz_responses") as any)
      .insert({
        score: result.score,
        level: result.level,
        category_scores: result.categoryScores,
        answers: validated.data.answers,
        recommended_variant: variant.id,
        ai_recommendation: aiRecommendation,
        user_agent: userAgent.slice(0, 500),
        referrer: referrer.slice(0, 500),
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("Failed to save quiz response:", dbError);
      // Don't block the user — return results even if DB save fails
    }

    // 6. Return results
    return NextResponse.json({
      score: result.score,
      level: result.level,
      categoryScores: result.categoryScores,
      recommendation: aiRecommendation,
      variant: {
        id: variant.id,
        name: variant.name,
        price: variant.price,
        tagline: variant.tagline,
      },
      responseId: savedResponse?.id || null,
    });
  } catch (error) {
    console.error("Quiz API error:", error);
    return NextResponse.json(
      { error: "Грешка при обработка на теста" },
      { status: 500 }
    );
  }
}
