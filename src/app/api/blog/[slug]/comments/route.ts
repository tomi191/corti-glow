import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const commentSchema = z.object({
  author_name: z.string().min(2, "Минимум 2 символа").max(100),
  author_email: z.string().email("Невалиден имейл"),
  content: z.string().min(10, "Минимум 10 символа").max(2000, "Максимум 2000 символа"),
  parent_id: z.string().uuid().optional(),
  website: z.string().max(255).optional(), // honeypot
});

// GET /api/blog/[slug]/comments — fetch approved comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const supabase = createServerClient();

    // Get post ID from slug
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: post, error: postError } = await (supabase as any)
      .from("blog_posts")
      .select("id")
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (postError || !post) {
      return NextResponse.json({ comments: [] });
    }

    // Fetch approved comments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: comments, error } = await (supabase as any)
      .from("blog_comments")
      .select("id, author_name, content, parent_id, created_at")
      .eq("blog_post_id", post.id)
      .eq("status", "approved")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      return NextResponse.json({ comments: [] });
    }

    return NextResponse.json({ comments: comments || [] });
  } catch (error) {
    console.error("Comments GET error:", error);
    return NextResponse.json({ comments: [] });
  }
}

// POST /api/blog/[slug]/comments — submit a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const body = await request.json();
    const validated = commentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Невалидни данни", errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Honeypot check — if website field is filled, it's a bot
    if (validated.data.website) {
      // Silently accept but don't save
      return NextResponse.json({ success: true, message: "Коментарът ви ще бъде прегледан от модератор." });
    }

    const supabase = createServerClient();

    // Get post ID
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: post, error: postError } = await (supabase as any)
      .from("blog_posts")
      .select("id")
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: "Статията не е намерена" }, { status: 404 });
    }

    // Rate limit: max 1 comment per 5 minutes per email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: recent } = await (supabase as any)
      .from("blog_comments")
      .select("id")
      .eq("author_email", validated.data.author_email)
      .gte("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .limit(1);

    if (recent && recent.length > 0) {
      return NextResponse.json(
        { error: "Моля, изчакайте 5 минути преди да публикувате нов коментар." },
        { status: 429 }
      );
    }

    // Get IP address
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

    // Insert comment as pending
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase as any)
      .from("blog_comments")
      .insert({
        blog_post_id: post.id,
        parent_id: validated.data.parent_id || null,
        author_name: validated.data.author_name,
        author_email: validated.data.author_email,
        content: validated.data.content,
        status: "pending",
        ip_address: ip,
      });

    if (insertError) {
      console.error("Comment insert error:", insertError);
      return NextResponse.json({ error: "Грешка при запазване на коментара" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Коментарът ви ще бъде прегледан от модератор.",
    });
  } catch (error) {
    console.error("Comments POST error:", error);
    return NextResponse.json({ error: "Сървърна грешка" }, { status: 500 });
  }
}
