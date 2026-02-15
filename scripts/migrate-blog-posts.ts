/**
 * One-time migration script: Migrate hardcoded blog posts from src/data/blog.ts to Supabase
 *
 * Usage: npx tsx scripts/migrate-blog-posts.ts
 *
 * Requires env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

// Load .env.local manually
const envPath = resolve(process.cwd(), ".env.local");
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  console.warn("Could not load .env.local, using existing env vars");
}

// Import blog data directly
import { blogPosts, type BlogPost } from "../src/data/blog";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Simple markdown to HTML conversion (same as used in the [slug] page)
function markdownToHtml(content: string): string {
  return content
    .replace(
      /^> (.*$)/gim,
      '<blockquote class="border-l-4 border-[#B2D8C6] pl-4 my-6 text-stone-600 italic">$1</blockquote>'
    )
    .replace(
      /^### (.*$)/gim,
      '<h3 class="text-xl font-semibold text-[#2D4A3E] mt-8 mb-4">$1</h3>'
    )
    .replace(
      /^## (.*$)/gim,
      '<h2 class="text-2xl font-semibold text-[#2D4A3E] mt-10 mb-4">$1</h2>'
    )
    .replace(
      /^# (.*$)/gim,
      '<h1 class="text-3xl font-bold text-[#2D4A3E] mb-6">$1</h1>'
    )
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^- (.*$)/gim, '<li class="ml-4 mb-2">$1</li>')
    .replace(
      /(<li.*<\/li>\n?)+/g,
      '<ul class="list-disc list-inside mb-6 text-stone-600">$&</ul>'
    )
    .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4 mb-2">$2</li>')
    .replace(/✅/g, '<span class="text-green-600">✅</span>')
    .replace(/❌/g, '<span class="text-red-500">❌</span>')
    .replace(
      /\n\n/g,
      '</p><p class="text-stone-600 mb-4 leading-relaxed">'
    )
    .replace(
      /^(?!<[hulo])/gm,
      '<p class="text-stone-600 mb-4 leading-relaxed">'
    )
    .replace(/(?<![>])$/gm, "</p>");
}

function mapPost(post: BlogPost) {
  const htmlContent = markdownToHtml(post.content);
  const wordCount = post.content
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: htmlContent,
    image: post.image,
    category: post.category,
    author: post.author,
    published_at: new Date(post.publishedAt).toISOString(),
    updated_at: post.updatedAt
      ? new Date(post.updatedAt).toISOString()
      : new Date(post.publishedAt).toISOString(),
    read_time: post.readTime,
    featured: post.featured || false,
    published: true, // All existing posts are published
    tldr: post.tldr || null,
    key_takeaways: post.keyTakeaways || [],
    faq: post.faq || [],
    sources: post.sources || [],
    meta_title: null,
    meta_description: null,
    keywords: [],
    content_type: null,
    ai_generated: false,
    ai_model: null,
    word_count: wordCount,
  };
}

async function migrate() {
  console.log(`Migrating ${blogPosts.length} blog posts to Supabase...`);

  let successCount = 0;
  let errorCount = 0;

  for (const post of blogPosts) {
    const mapped = mapPost(post);

    const { error } = await supabase.from("blog_posts").upsert(mapped, {
      onConflict: "slug",
    });

    if (error) {
      console.error(`  ✗ ${post.slug}: ${error.message}`);
      errorCount++;
    } else {
      console.log(`  ✓ ${post.slug}`);
      successCount++;
    }
  }

  console.log(`\nDone! ${successCount} succeeded, ${errorCount} failed.`);
}

migrate().catch(console.error);
