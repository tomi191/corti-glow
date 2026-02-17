import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import webpush from "web-push";
import { createServerClient } from "@/lib/supabase/server";
import type { PushSubscriptionRow } from "@/lib/supabase/types";

const sendSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  url: z.string().optional(),
  userId: z.string().optional(),
});

let vapidConfigured = false;

export async function POST(request: NextRequest) {
  try {
    if (!vapidConfigured) {
      webpush.setVapidDetails(
        "mailto:caspere63@gmail.com",
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        process.env.VAPID_PRIVATE_KEY!
      );
      vapidConfigured = true;
    }

    // Admin auth is handled by middleware
    const body = await request.json();
    const validated = sendSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, body: notifBody, url, userId } = validated.data;
    const supabase = createServerClient();

    // Fetch subscriptions — optionally filtered by user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;
    const { data, error } = userId
      ? await sb.from("push_subscriptions").select("*").eq("clerk_user_id", userId)
      : await sb.from("push_subscriptions").select("*");
    const subscriptions = data as PushSubscriptionRow[] | null;

    if (error) {
      console.error("Fetch subscriptions error:", error);
      return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0, cleaned: 0, total: 0 });
    }

    const payload = JSON.stringify({
      title,
      body: notifBody,
      data: { url: url || "/app" },
    });

    let sent = 0;
    let failed = 0;
    const staleEndpoints: string[] = [];

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
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
          // 404 or 410 means subscription is stale
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
      total: subscriptions.length,
    });
  } catch (error) {
    console.error("Admin push error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
