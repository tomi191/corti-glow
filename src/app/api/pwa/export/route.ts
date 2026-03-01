import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * GDPR Data Export (Art. 15) — returns all user data as JSON.
 * Clerk auth required.
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createServerClient() as any;

    // Fetch all user data in parallel
    const [profileRes, checkInsRes, pushRes, eventsRes] = await Promise.all([
      sb.from("pwa_profiles").select("*").eq("clerk_user_id", userId).single(),
      sb
        .from("pwa_checkins")
        .select("date, period_started, sleep, stress, symptoms, glow_score, created_at")
        .eq("clerk_user_id", userId)
        .order("date", { ascending: false }),
      sb
        .from("push_subscriptions")
        .select("endpoint, created_at")
        .eq("clerk_user_id", userId),
      sb
        .from("pwa_events")
        .select("event_name, event_data, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(500),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      userId,
      profile: profileRes.data ?? null,
      checkIns: checkInsRes.data ?? [],
      pushSubscriptions: (pushRes.data ?? []).map((s: { endpoint: string; created_at: string }) => ({
        endpoint: s.endpoint,
        createdAt: s.created_at,
      })),
      events: eventsRes.data ?? [],
    };

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="lura-data-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("GDPR export error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
