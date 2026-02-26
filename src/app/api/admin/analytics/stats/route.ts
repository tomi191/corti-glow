import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// Valid period options
const PERIODS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

// Typed helpers for untyped Supabase responses
interface PwaEventRow {
  id?: string;
  user_id?: string | null;
  session_id: string;
  event_name: string;
  event_data: Record<string, unknown>;
  created_at?: string;
}

interface PwaDailyStatRow {
  date: string;
  total_checkins: number;
  breathing_sessions: number;
  unique_users: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const periodParam = searchParams.get("period") || "7d";
    const days = PERIODS[periodParam] ?? 7;

    const supabase = createServerClient();
    const db = supabase as any; // Cast for pwa_events/pwa_daily_stats tables

    // Date boundaries
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - days);
    const periodStartStr = periodStart.toISOString();

    // --- Pulse: today's metrics ---

    // DAU: unique session_ids today (proxy for unique users)
    const { count: dauCount } = await db
      .from("pwa_events")
      .select("session_id", { count: "exact", head: true })
      .gte("created_at", `${todayStr}T00:00:00Z`)
      .lt("created_at", `${todayStr}T23:59:59Z`);

    // Total checkins today
    const { count: totalCheckinsToday } = await db
      .from("pwa_events")
      .select("*", { count: "exact", head: true })
      .eq("event_name", "checkin_completed")
      .gte("created_at", `${todayStr}T00:00:00Z`);

    // Breathing sessions today - sum cycles from event_data
    const { data: breathingToday } = await db
      .from("pwa_events")
      .select("event_data")
      .eq("event_name", "breathing_finished")
      .gte("created_at", `${todayStr}T00:00:00Z`);

    const totalBreathingCycles = ((breathingToday ?? []) as PwaEventRow[]).reduce(
      (sum: number, row: PwaEventRow) => {
        const cycles = typeof row.event_data?.cycles === "number" ? row.event_data.cycles : 0;
        return sum + (cycles as number);
      },
      0
    );
    // Each breathing cycle is ~16 seconds
    const sosMinutes = Math.round((totalBreathingCycles * 16) / 60 * 10) / 10;

    // --- Feature Usage: over the period ---

    const { count: quickCheckins } = await db
      .from("pwa_events")
      .select("*", { count: "exact", head: true })
      .eq("event_name", "checkin_completed")
      .eq("event_data->>type", "quick")
      .gte("created_at", periodStartStr);

    const { count: fullCheckins } = await db
      .from("pwa_events")
      .select("*", { count: "exact", head: true })
      .eq("event_name", "checkin_completed")
      .eq("event_data->>type", "full")
      .gte("created_at", periodStartStr);

    // --- Funnel: high stress -> shop clicks ---

    // Get sessions with high stress (stress > 6)
    const { data: highStressEvents } = await db
      .from("pwa_events")
      .select("session_id, event_data")
      .eq("event_name", "checkin_completed")
      .gte("created_at", periodStartStr);

    const highStressSessions = new Set<string>();
    ((highStressEvents ?? []) as PwaEventRow[]).forEach((row: PwaEventRow) => {
      const stress = typeof row.event_data?.stress === "number" ? row.event_data.stress : 0;
      if ((stress as number) > 6) {
        highStressSessions.add(row.session_id);
      }
    });

    // Shop clicks from those high-stress sessions
    let shopClicksFromStress = 0;
    if (highStressSessions.size > 0) {
      const sessionArray = Array.from(highStressSessions);
      const { count: shopClicks } = await db
        .from("pwa_events")
        .select("*", { count: "exact", head: true })
        .eq("event_name", "shop_clicked_from_pwa")
        .in("session_id", sessionArray)
        .gte("created_at", periodStartStr);

      shopClicksFromStress = shopClicks ?? 0;
    }

    const conversionRate =
      highStressSessions.size > 0
        ? Math.round((shopClicksFromStress / highStressSessions.size) * 100 * 10) / 10
        : 0;

    // --- Daily Trend: from pwa_daily_stats table ---

    const trendStart = new Date(now);
    trendStart.setDate(trendStart.getDate() - days);
    const trendStartStr = trendStart.toISOString().split("T")[0];

    const { data: dailyStats } = await db
      .from("pwa_daily_stats")
      .select("date, total_checkins, breathing_sessions, unique_users")
      .gte("date", trendStartStr)
      .order("date", { ascending: true });

    const dailyTrend = ((dailyStats ?? []) as PwaDailyStatRow[]).map((row: PwaDailyStatRow) => ({
      date: row.date,
      checkins: row.total_checkins,
      breathingSessions: row.breathing_sessions,
      uniqueUsers: row.unique_users,
    }));

    return NextResponse.json({
      pulse: {
        dau: dauCount ?? 0,
        totalCheckins: totalCheckinsToday ?? 0,
        sosMinutes,
      },
      featureUsage: {
        quickCheckins: quickCheckins ?? 0,
        fullCheckins: fullCheckins ?? 0,
      },
      funnel: {
        highStressSessions: highStressSessions.size,
        shopClicks: shopClicksFromStress,
        conversionRate,
      },
      dailyTrend,
    });
  } catch (error) {
    console.error("Analytics stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
