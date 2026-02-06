import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { createServerClient } from "@/lib/supabase/server";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

// Require ADMIN_PASSWORD to be set - no default fallback for security
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  console.error("CRITICAL: ADMIN_PASSWORD environment variable is not set!");
}

// 5 attempts per 15 minutes
const limiter = createRateLimiter(5, 15 * 60 * 1000);

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // Rate limiting check
    if (limiter.isLimited(ip)) {
      return NextResponse.json(
        { error: "Твърде много опити. Опитайте отново след 15 минути." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { password } = body;

    // Check if password is configured
    if (!ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Admin authentication not configured" },
        { status: 503 }
      );
    }

    if (password === ADMIN_PASSWORD) {
      limiter.clearAttempts(ip);

      // Generate a secure random session token
      const sessionToken = crypto.randomUUID();

      // Store session in Supabase
      const supabase = createServerClient();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 1 day

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("admin_sessions")
        .insert({ token: sessionToken, expires_at: expiresAt });

      const cookieStore = await cookies();
      cookieStore.set("admin_session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
      });

      return NextResponse.json({ success: true });
    }

    // Record failed attempt
    limiter.recordAttempt(ip);

    return NextResponse.json(
      { error: "Invalid password" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;

  // Remove session from database
  if (token) {
    const supabase = createServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("admin_sessions")
      .delete()
      .eq("token", token);
  }

  cookieStore.delete("admin_session");
  return NextResponse.json({ success: true });
}
