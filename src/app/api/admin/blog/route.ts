import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { BlogPostInsert } from "@/lib/supabase/types";
import { blogPosts as demoPosts, categoryLabels } from "@/data/blog";

const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL;

/** Map static posts to DB row shape */
function getStaticPosts() {
  return demoPosts.map((p, i) => ({
    id: `demo-${i}`,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    image: p.image,
    category: p.category,
    author: p.author,
    published_at: p.publishedAt,
    updated_at: p.updatedAt || p.publishedAt,
    read_time: p.readTime,
    featured: p.featured || false,
    published: true,
    tldr: p.tldr || null,
    key_takeaways: p.keyTakeaways || [],
    faq: p.faq || [],
    sources: p.sources || [],
    meta_title: null,
    meta_description: null,
    keywords: [],
    content_type: null,
    ai_generated: false,
    ai_model: null,
    word_count: null,
    created_at: p.publishedAt,
  }));
}

/** Filter static posts by query params */
function filterStaticPosts(
  posts: ReturnType<typeof getStaticPosts>,
  opts: { category?: string | null; published?: string | null; search?: string | null; limit: number; offset: number }
) {
  let filtered = posts;
  if (opts.category) filtered = filtered.filter((p) => p.category === opts.category);
  if (opts.published === "true") filtered = filtered.filter((p) => p.published);
  if (opts.published === "false") filtered = filtered.filter((p) => !p.published);
  if (opts.search) {
    const s = opts.search.toLowerCase();
    filtered = filtered.filter(
      (p) => p.title.toLowerCase().includes(s) || p.slug.toLowerCase().includes(s)
    );
  }
  return {
    posts: filtered.slice(opts.offset, opts.offset + opts.limit),
    total: filtered.length,
    limit: opts.limit,
    offset: opts.offset,
    demo: true,
  };
}

// GET /api/admin/blog - List blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const published = searchParams.get("published");
    const search = searchParams.get("search");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const filterOpts = { category, published, search, limit, offset };

    // Demo mode — no Supabase configured
    if (isDemoMode) {
      return NextResponse.json(filterStaticPosts(getStaticPosts(), filterOpts));
    }

    // Production mode
    const supabase = createServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from("blog_posts")
      .select("*", { count: "exact" })
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) query = query.eq("category", category);
    if (published === "true") query = query.eq("published", true);
    if (published === "false") query = query.eq("published", false);

    if (search) {
      const sanitized = search.replace(/[%_,()]/g, "").trim().slice(0, 100);
      if (sanitized) {
        query = query.or(`title.ilike.%${sanitized}%,slug.ilike.%${sanitized}%`);
      }
    }

    const { data: posts, error, count } = await query;

    if (error) {
      console.error("Error fetching blog posts:", error);
      // Fallback to static data when table doesn't exist yet
      return NextResponse.json(filterStaticPosts(getStaticPosts(), filterOpts));
    }

    // Fallback to static if DB is empty
    if (!posts || posts.length === 0) {
      return NextResponse.json(filterStaticPosts(getStaticPosts(), filterOpts));
    }

    return NextResponse.json({
      posts,
      total: count || 0,
      limit,
      offset,
      categories: categoryLabels,
    });
  } catch (error) {
    console.error("Blog API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/blog - Create a new blog post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const post: BlogPostInsert = {
      slug: body.slug,
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      image: body.image || "",
      category: body.category,
      author: body.author,
      published_at: body.published_at || new Date().toISOString(),
      read_time: body.read_time || 5,
      featured: body.featured ?? false,
      published: body.published ?? false,
      tldr: body.tldr || null,
      key_takeaways: body.key_takeaways || [],
      faq: body.faq || [],
      sources: body.sources || [],
      meta_title: body.meta_title || null,
      meta_description: body.meta_description || null,
      keywords: body.keywords || [],
      content_type: body.content_type || null,
      ai_generated: body.ai_generated ?? false,
      ai_model: body.ai_model || null,
      word_count: body.word_count || null,
    };

    if (isDemoMode) {
      return NextResponse.json(
        { post: { ...post, id: `demo-${Date.now()}`, created_at: new Date().toISOString() }, demo: true },
        { status: 201 }
      );
    }

    const supabase = createServerClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("blog_posts")
      .insert(post)
      .select()
      .single();

    if (error) {
      console.error("Error creating blog post:", error);
      if (error.code === "23505") {
        return NextResponse.json({ error: "Post with this slug already exists" }, { status: 400 });
      }
      return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }

    return NextResponse.json({ post: data }, { status: 201 });
  } catch (error) {
    console.error("Create blog post error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
