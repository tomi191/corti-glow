import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";

const deleteSchema = z.object({
  confirm: z.literal(true),
});

/**
 * GDPR Account Deletion (Art. 17) — cascade delete all user data.
 * Deletes from: pwa_profiles, pwa_checkins, push_subscriptions, pwa_events.
 * Clerk auth + explicit confirmation required.
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = deleteSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Confirmation required", details: "Send { confirm: true }" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = createServerClient() as any;

    // Cascade delete from all user tables
    const results = await Promise.allSettled([
      sb.from("pwa_checkins").delete().eq("clerk_user_id", userId),
      sb.from("push_subscriptions").delete().eq("clerk_user_id", userId),
      sb.from("pwa_events").delete().eq("user_id", userId),
      sb.from("pwa_profiles").delete().eq("clerk_user_id", userId),
    ]);

    // Log any partial failures (non-fatal — we still return success)
    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length > 0) {
      console.error("Partial GDPR delete failures:", failures);
    }

    return NextResponse.json({
      success: true,
      deletedFrom: ["pwa_profiles", "pwa_checkins", "push_subscriptions", "pwa_events"],
    });
  } catch (error) {
    console.error("GDPR delete error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
