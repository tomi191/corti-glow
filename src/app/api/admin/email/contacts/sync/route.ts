import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { addContact } from "@/lib/resend/audiences";

// Sync all newsletter_subscribers to Resend Audiences
export async function POST() {
  const supabase = createServerClient();

  try {
    const { data: subscribers, error } = await (supabase as any)
      .from("newsletter_subscribers")
      .select("email, source, subscribed_at")
      .eq("active", true)
      .order("subscribed_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch subscribers" },
        { status: 500 }
      );
    }

    let synced = 0;
    let failed = 0;

    // Process in batches of 10 to avoid rate limits
    for (let i = 0; i < (subscribers || []).length; i += 10) {
      const batch = subscribers!.slice(i, i + 10);
      const results = await Promise.allSettled(
        batch.map((sub: { email: string; source: string | null }) =>
          addContact({
            email: sub.email,
            source: sub.source || "website",
          })
        )
      );

      results.forEach((r) => {
        if (r.status === "fulfilled" && r.value.success) synced++;
        else failed++;
      });
    }

    return NextResponse.json({
      success: true,
      synced,
      failed,
      total: (subscribers || []).length,
    });
  } catch (err) {
    console.error("[Admin Email] Sync error:", err);
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}
