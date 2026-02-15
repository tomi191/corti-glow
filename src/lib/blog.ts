/**
 * Server-side blog data layer
 * Reads from Supabase, falls back to hardcoded data
 */
import { createServerClient } from "@/lib/supabase/server";
import type { BlogPostRow } from "@/lib/supabase/types";
import { blogPosts as staticPosts, categoryLabels, categoryColors } from "@/data/blog";

// Re-export for convenience
export { categoryLabels, categoryColors };
export type { BlogPostRow };

const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL;

/** Map static blog post to DB row shape */
function staticToRow(post: (typeof staticPosts)[number], index: number): BlogPostRow {
  return {
    id: `static-${index}`,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    image: post.image,
    category: post.category,
    author: post.author as unknown as BlogPostRow["author"],
    published_at: post.publishedAt,
    updated_at: post.updatedAt || post.publishedAt,
    read_time: post.readTime,
    featured: post.featured || false,
    published: true,
    tldr: post.tldr || null,
    key_takeaways: (post.keyTakeaways || []) as unknown as BlogPostRow["key_takeaways"],
    faq: (post.faq || []) as unknown as BlogPostRow["faq"],
    sources: (post.sources || []) as unknown as BlogPostRow["sources"],
    meta_title: null,
    meta_description: null,
    keywords: [] as unknown as BlogPostRow["keywords"],
    content_type: null,
    ai_generated: false,
    ai_model: null,
    word_count: null,
    created_at: post.publishedAt,
  };
}

/** Get all published blog posts, sorted by date descending */
export async function getPublishedPosts(): Promise<BlogPostRow[]> {
  if (isDemoMode) {
    return staticPosts.map(staticToRow);
  }

  try {
    const supabase = createServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching published posts:", error);
      return staticPosts.map(staticToRow);
    }

    // Fall back to static if DB is empty
    if (!data || data.length === 0) {
      return staticPosts.map(staticToRow);
    }

    return data as BlogPostRow[];
  } catch (error) {
    console.error("Blog fetch error:", error);
    return staticPosts.map(staticToRow);
  }
}

/** Get a single post by slug */
export async function getPostBySlug(slug: string): Promise<BlogPostRow | null> {
  if (isDemoMode) {
    const post = staticPosts.find((p) => p.slug === slug);
    return post ? staticToRow(post, staticPosts.indexOf(post)) : null;
  }

  try {
    const supabase = createServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (error || !data) {
      // Fall back to static data
      const post = staticPosts.find((p) => p.slug === slug);
      return post ? staticToRow(post, staticPosts.indexOf(post)) : null;
    }

    return data as BlogPostRow;
  } catch {
    const post = staticPosts.find((p) => p.slug === slug);
    return post ? staticToRow(post, staticPosts.indexOf(post)) : null;
  }
}

/** Get featured posts */
export async function getFeaturedPosts(): Promise<BlogPostRow[]> {
  if (isDemoMode) {
    return staticPosts.filter((p) => p.featured).map(staticToRow);
  }

  try {
    const supabase = createServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .eq("featured", true)
      .order("published_at", { ascending: false })
      .limit(4);

    if (error || !data || data.length === 0) {
      return staticPosts.filter((p) => p.featured).map(staticToRow);
    }

    return data as BlogPostRow[];
  } catch {
    return staticPosts.filter((p) => p.featured).map(staticToRow);
  }
}

/** Get all published slugs (for generateStaticParams) */
export async function getAllPublishedSlugs(): Promise<string[]> {
  if (isDemoMode) {
    return staticPosts.map((p) => p.slug);
  }

  try {
    const supabase = createServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("blog_posts")
      .select("slug")
      .eq("published", true);

    if (error || !data || data.length === 0) {
      return staticPosts.map((p) => p.slug);
    }

    return (data as { slug: string }[]).map((p) => p.slug);
  } catch {
    return staticPosts.map((p) => p.slug);
  }
}
