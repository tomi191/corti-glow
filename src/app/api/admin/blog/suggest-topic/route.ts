import { NextRequest, NextResponse } from "next/server";
import { createDefaultConfig } from "@content-engine/config";
import { complete } from "@content-engine/ai/openrouter-client";
import { createServerClient } from "@/lib/supabase/server";

export const maxDuration = 30;

// POST /api/admin/blog/suggest-topic - AI suggests a trending blog topic
export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "AI generation is not configured. Set OPENROUTER_API_KEY." },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const preferredCategory = body.category || "";

    // Fetch existing blog titles to avoid duplicates
    const supabase = createServerClient();
    const { data: existingPosts } = await supabase
      .from("blog_posts")
      .select("title, category")
      .order("created_at", { ascending: false })
      .limit(50);

    const existingTitles = (existingPosts as { title: string; category: string }[] | null)
      ?.map((p) => `- ${p.title} [${p.category}]`).join("\n") || "Няма публикации все още.";

    const config = createDefaultConfig();

    const prompt = `Ти си SEO стратег за LURA (luralab.eu) — български бранд за хранителни добавки, фокусиран върху Corti-Glow (формула за кортизолов баланс с ашваганда, инозитол, магнезий, L-теанин, бромелаин).

Целева аудитория: жени 25-45, работещи, стресирани, проблеми със сън/хормони/тегло.

СЪЩЕСТВУВАЩИ СТАТИИ (НЕ повтаряй тези теми):
${existingTitles}

${preferredCategory ? `Предпочитана категория: ${preferredCategory}` : "Избери най-подходящата категория."}

Предложи 1 КОНКРЕТНА тема за блог статия, която:
1. Е актуална и трендова за 2026 г. в нишата wellness/хормони/женско здраве
2. Има реален search intent (хората наистина го търсят)
3. Е полезна за SEO на сайта (свързана с продукта, но не директно рекламна)
4. НЕ е дубликат на съществуващите статии

Върни САМО валиден JSON:
{
  "topic": "Конкретна тема на български (ясна, searchable)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "category": "hormoni|stress|sŭn|hranene|wellness",
  "contentType": "tofu|mofu|bofu",
  "reasoning": "1-2 изречения ЗАЩО тази тема е добър избор (на български)"
}

Започни ДИРЕКТНО с { и завърши с }. Без друг текст!`;

    const result = await complete(config, {
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
      maxTokens: 1000,
    });

    // Parse JSON response
    let parsed;
    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : result.content);
    } catch {
      return NextResponse.json(
        { error: "AI отговорът не може да бъде парснат" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      suggestion: {
        topic: parsed.topic,
        keywords: parsed.keywords || [],
        category: parsed.category || "wellness",
        contentType: parsed.contentType || "tofu",
        reasoning: parsed.reasoning || "",
      },
    });
  } catch (error) {
    console.error("Topic suggestion error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Suggestion failed" },
      { status: 500 }
    );
  }
}
