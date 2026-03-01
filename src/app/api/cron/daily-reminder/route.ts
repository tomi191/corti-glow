import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import webpush from "web-push";
import { createServerClient } from "@/lib/supabase/server";
import type { PushSubscriptionRow } from "@/lib/supabase/types";

/**
 * Vercel Cron: Daily push reminder for users who haven't checked in today.
 * Runs at 10:00 UTC (12:00 Bulgarian time).
 * Protected by CRON_SECRET header check.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sets this header automatically)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Configure VAPID
    webpush.setVapidDetails(
      "mailto:caspere63@gmail.com",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );

    const supabase = createServerClient();
    const sb = supabase as any;
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Get all users with push subscriptions
    const { data: subscriptions, error: subError } = await sb
      .from("push_subscriptions")
      .select("*");

    if (subError || !subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: "No subscriptions", sent: 0 });
    }

    const allSubs = subscriptions as PushSubscriptionRow[];

    // Get unique user IDs who have subscriptions
    const userIds = [...new Set(allSubs.map((s: PushSubscriptionRow) => s.clerk_user_id))];

    // Find which users already checked in today
    const { data: todayCheckins } = await sb
      .from("pwa_checkins")
      .select("clerk_user_id")
      .eq("date", today)
      .in("clerk_user_id", userIds);

    const checkedInUsers = new Set(
      (todayCheckins || []).map((c: { clerk_user_id: string }) => c.clerk_user_id)
    );

    // Filter to users who HAVEN'T checked in
    const subsToNotify = allSubs.filter(
      (s: PushSubscriptionRow) => !checkedInUsers.has(s.clerk_user_id)
    );

    if (subsToNotify.length === 0) {
      return NextResponse.json({ message: "All users checked in", sent: 0 });
    }

    // Send push notifications
    const payload = JSON.stringify({
      title: "Как си днес? 💚",
      body: "4 секунди — запиши как спа и как се чувстваш.",
      data: { url: "/app/checkin" },
    });

    let sent = 0;
    let failed = 0;
    const staleEndpoints: string[] = [];

    await Promise.allSettled(
      subsToNotify.map(async (sub: PushSubscriptionRow) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth_key },
            },
            payload
          );
          sent++;
        } catch (err: unknown) {
          failed++;
          const statusCode = (err as { statusCode?: number })?.statusCode;
          if (statusCode === 404 || statusCode === 410) {
            staleEndpoints.push(sub.endpoint);
          }
        }
      })
    );

    // Cleanup stale subscriptions
    let cleaned = 0;
    if (staleEndpoints.length > 0) {
      const { count } = await sb
        .from("push_subscriptions")
        .delete()
        .in("endpoint", staleEndpoints);
      cleaned = count || 0;
    }

    return NextResponse.json({
      sent,
      failed,
      cleaned,
      total: subsToNotify.length,
      skipped: checkedInUsers.size,
    });
  } catch (error) {
    console.error("Daily reminder cron error:", error);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
