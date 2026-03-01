import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * Vercel Cron: Aggregate yesterday's pwa_events into pwa_daily_stats.
 * Runs daily at 02:00 UTC (04:00 Bulgarian time).
 * Protected by CRON_SECRET header check.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServerClient();
    const sb = supabase as any;

    // Yesterday in YYYY-MM-DD
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split("T")[0];

    // Start/end timestamps for yesterday
    const dayStart = `${dateStr}T00:00:00.000Z`;
    const dayEnd = `${dateStr}T23:59:59.999Z`;

    // Fetch all events from yesterday
    const { data: events, error } = await sb
      .from("pwa_events")
      .select("event_name, event_data, user_id, session_id")
      .gte("created_at", dayStart)
      .lte("created_at", dayEnd);

    if (error) {
      console.error("Stats aggregation fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }

    if (!events || events.length === 0) {
      return NextResponse.json({ message: "No events yesterday", date: dateStr });
    }

    // Aggregate
    let totalCheckins = 0;
    let quickCheckins = 0;
    let fullCheckins = 0;
    let breathingSessions = 0;
    let totalBreathingCycles = 0;
    let shopClicks = 0;
    const uniqueUsers = new Set<string>();
    const stressValues: number[] = [];
    const sleepValues: number[] = [];

    for (const event of events) {
      if (event.user_id) uniqueUsers.add(event.user_id);

      switch (event.event_name) {
        case "checkin_completed": {
          totalCheckins++;
          const data = event.event_data as Record<string, unknown>;
          if (data?.type === "full") fullCheckins++;
          else quickCheckins++;
          if (typeof data?.stress === "number") stressValues.push(data.stress);
          if (typeof data?.sleep === "number") sleepValues.push(data.sleep);
          break;
        }
        case "breathing_completed":
        case "breathing_finished":
          breathingSessions++;
          if (typeof (event.event_data as Record<string, unknown>)?.cycles === "number") {
            totalBreathingCycles += (event.event_data as Record<string, unknown>).cycles as number;
          }
          break;
        case "shop_viewed":
        case "shop_waitlist_clicked":
          shopClicks++;
          break;
      }
    }

    const avgStress = stressValues.length > 0
      ? +(stressValues.reduce((a, b) => a + b, 0) / stressValues.length).toFixed(2)
      : null;
    const avgSleep = sleepValues.length > 0
      ? +(sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length).toFixed(2)
      : null;

    // Upsert into pwa_daily_stats
    const { error: upsertError } = await sb
      .from("pwa_daily_stats")
      .upsert(
        {
          date: dateStr,
          total_checkins: totalCheckins,
          quick_checkins: quickCheckins,
          full_checkins: fullCheckins,
          breathing_sessions: breathingSessions,
          total_breathing_cycles: totalBreathingCycles,
          shop_clicks: shopClicks,
          unique_users: uniqueUsers.size,
          avg_stress: avgStress,
          avg_sleep: avgSleep,
        },
        { onConflict: "date" }
      );

    if (upsertError) {
      console.error("Stats upsert error:", upsertError);
      return NextResponse.json({ error: "Failed to save stats" }, { status: 500 });
    }

    return NextResponse.json({
      date: dateStr,
      totalCheckins,
      quickCheckins,
      fullCheckins,
      breathingSessions,
      shopClicks,
      uniqueUsers: uniqueUsers.size,
      avgStress,
      avgSleep,
    });
  } catch (error) {
    console.error("Daily stats cron error:", error);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
