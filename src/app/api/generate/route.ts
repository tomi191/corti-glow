import { NextRequest, NextResponse } from "next/server";
import {
  generateBlogArticle,
  generateReview,
  generateMarketingCopy,
  generateProductDescription,
} from "@/lib/ai/openrouter";

// POST /api/generate
export async function POST(request: NextRequest) {
  try {
    const { type, ...params } = await request.json();

    let result;

    switch (type) {
      case "blog":
        result = await generateBlogArticle(params.topic, params.keywords || []);
        break;

      case "review":
        result = await generateReview();
        break;

      case "marketing":
        result = await generateMarketingCopy(params.copyType, params.context);
        break;

      case "product":
        result = await generateProductDescription(
          params.name,
          params.ingredients,
          params.benefits
        );
        break;

      default:
        return NextResponse.json(
          { error: "Invalid generation type" },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
