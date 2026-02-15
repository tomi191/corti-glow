import { NextRequest, NextResponse } from "next/server";
import { createDefaultConfig } from "@content-engine/config";
import { generateBlogPost } from "@content-engine/ai/blog-generator";
import type { ContentType } from "@content-engine/types";

// Allow longer execution time for AI generation
export const maxDuration = 60;

// POST /api/admin/blog/generate - Generate blog post with AI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      topic,
      keywords = [],
      contentType = "tofu",
      category = "wellness",
      targetWordCount = 1500,
      author = "lura-team",
    } = body;

    if (!topic || typeof topic !== "string" || topic.trim().length < 5) {
      return NextResponse.json(
        { error: "Topic is required (minimum 5 characters)" },
        { status: 400 }
      );
    }

    // Check for OpenRouter API key
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "AI generation is not configured. Set OPENROUTER_API_KEY environment variable." },
        { status: 503 }
      );
    }

    const config = createDefaultConfig();
    config.siteName = "LURA Wellness";
    config.siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://luralab.eu";

    const result = await generateBlogPost(config, {
      topic: topic.trim(),
      keywords: Array.isArray(keywords) ? keywords : [],
      contentType: contentType as ContentType,
      category,
      targetWordCount: Math.min(Math.max(targetWordCount, 500), 5000),
      author: author as "dr-maria" | "lura-team",
    }, {
      internalLinks: {
        "Corti-Glow": "/produkt",
        "кортизол": "/nauka",
        "блога": "/blog",
        "пакетни предложения": "/produkt#bundles",
      },
    });

    return NextResponse.json({
      success: true,
      generated: {
        title: result.title,
        slug: result.suggestedSlug,
        excerpt: result.excerpt,
        content: result.content,
        meta_title: result.metaTitle,
        meta_description: result.metaDescription,
        keywords: result.keywords,
        read_time: result.readingTime,
        word_count: result.wordCount,
        tldr: result.tldr || null,
        key_takeaways: result.keyTakeaways || [],
        faq: result.faq || [],
        sources: result.sources || [],
        category,
        content_type: contentType,
        ai_generated: true,
        ai_model: config.defaultTextModel,
        image_prompts: result.imagePrompts || [],
      },
    });
  } catch (error) {
    console.error("Blog generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
