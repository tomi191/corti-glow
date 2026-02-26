import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { z } from "zod";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

// 60 requests per 5 minutes per IP (generous for batched analytics)
const limiter = createRateLimiter(60, 5 * 60 * 1000);

// Zod schema for incoming events
const eventSchema = z.object({
  event_name: z.string().min(1).max(100),
  event_data: z.record(z.string(), z.unknown()).default({}),
  session_id: z.string().min(1).max(200),
  timestamp: z.string().optional(),
});

const batchSchema = z.object({
  events: z.array(eventSchema).min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    if (limiter.isLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }
    limiter.recordAttempt(ip);

    const body = await request.json();

    // Validate with Zod
    const validated = batchSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { events } = validated.data;

    // Map events for Supabase insert
    const rows = events.map((event) => ({
      session_id: event.session_id,
      event_name: event.event_name,
      event_data: event.event_data,
      user_id: null as string | null, // No auth on this route
      // Use client timestamp if provided, otherwise server will use DEFAULT NOW()
      ...(event.timestamp ? { created_at: event.timestamp } : {}),
    }));

    // Batch insert using service role client
    const supabase = createServerClient();
    const { error } = await (supabase as any).from("pwa_events").insert(rows);

    if (error) {
      console.error("PWA events insert error:", error.message);
      return NextResponse.json(
        { error: "Failed to store events" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: rows.length,
    });
  } catch (error) {
    console.error("PWA events API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
