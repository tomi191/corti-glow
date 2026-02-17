import { NextRequest, NextResponse } from "next/server";
import { createDefaultConfig } from "@content-engine/config";
import { generateImage } from "@content-engine/ai/image-generator";
import fs from "fs";
import path from "path";

export const maxDuration = 60;

// POST /api/admin/blog/generate-images - Generate a single blog image
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, slug, imageId } = body;

    if (!prompt || !slug || !imageId) {
      return NextResponse.json(
        { error: "prompt, slug, and imageId are required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "AI generation is not configured. Set OPENROUTER_API_KEY." },
        { status: 503 }
      );
    }

    // Sanitize slug and imageId to prevent path traversal
    const safeSlug = slug.replace(/[^a-z0-9-]/gi, "-").slice(0, 100);
    const safeImageId = imageId.replace(/[^a-z0-9-]/gi, "-").slice(0, 50);

    const config = createDefaultConfig();
    config.siteName = "LURA Wellness";

    const result = await generateImage(config, prompt, {
      quality: 85,
      maxWidth: 1200,
    });

    // Save to public/images/blog/{slug}/{imageId}.webp
    const dir = path.join(process.cwd(), "public", "images", "blog", safeSlug);
    fs.mkdirSync(dir, { recursive: true });

    const ext = result.contentType === "image/webp" ? "webp" : "png";
    const filename = `${safeImageId}.${ext}`;
    const filePath = path.join(dir, filename);

    fs.writeFileSync(filePath, result.buffer);

    const url = `/images/blog/${safeSlug}/${filename}`;

    return NextResponse.json({
      success: true,
      url,
      size: result.size,
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Image generation failed" },
      { status: 500 }
    );
  }
}
