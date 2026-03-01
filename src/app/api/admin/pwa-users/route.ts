// Admin PWA Users API — lists PWA users with check-in stats

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    const supabase = createServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;

    // Query profiles with pagination
    let query = sb
      .from("pwa_profiles")
      .select("clerk_user_id, user_name, email, age_range, concerns, push_enabled, created_at", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      const sanitized = search.replace(/[%_,()]/g, "").trim().slice(0, 100);
      if (sanitized) {
        query = query.or(`user_name.ilike.%${sanitized}%,email.ilike.%${sanitized}%`);
      }
    }

    const { data: profiles, count, error } = await query;

    if (error) {
      console.error("PWA users query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Enrich each profile with check-in stats
    const users = await Promise.all(
      (profiles || []).map(async (p: Record<string, unknown>) => {
        const { count: checkinCount } = await sb
          .from("pwa_checkins")
          .select("id", { count: "exact", head: true })
          .eq("clerk_user_id", p.clerk_user_id);

        const { data: recentCheckins } = await sb
          .from("pwa_checkins")
          .select("date, stress, sleep")
          .eq("clerk_user_id", p.clerk_user_id)
          .order("date", { ascending: false })
          .limit(30);

        const lastDate = recentCheckins?.[0]?.date || null;
        const avgStress =
          recentCheckins && recentCheckins.length > 0
            ? (recentCheckins.reduce((s: number, c: { stress: number }) => s + c.stress, 0) / recentCheckins.length).toFixed(1)
            : null;
        const avgSleep =
          recentCheckins && recentCheckins.length > 0
            ? (recentCheckins.reduce((s: number, c: { sleep: number }) => s + c.sleep, 0) / recentCheckins.length).toFixed(1)
            : null;

        return {
          clerk_user_id: p.clerk_user_id,
          user_name: p.user_name,
          email: p.email,
          age_range: p.age_range,
          concerns: p.concerns,
          push_enabled: p.push_enabled,
          created_at: p.created_at,
          total_checkins: checkinCount || 0,
          last_checkin_date: lastDate,
          avg_stress: avgStress,
          avg_sleep: avgSleep,
        };
      })
    );

    return NextResponse.json({ users, count: count || 0 });
  } catch (error) {
    console.error("PWA users fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch PWA users" }, { status: 500 });
  }
}
