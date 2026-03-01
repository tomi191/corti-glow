import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";

// --- Validation ---

const checkInSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodStarted: z.boolean(),
  sleep: z.number().int().min(0).max(10),
  stress: z.number().int().min(0).max(10),
  symptoms: z.array(z.string()),
  glowScore: z.number().int().min(0).max(100),
});

const syncRequestSchema = z.object({
  profile: z.object({
    lastPeriodDate: z.string().nullable(),
    cycleLength: z.number().int().min(18).max(45),
    periodDuration: z.number().int().min(2).max(10),
    userName: z.string().nullable(),
    ageRange: z.string().nullable(),
    concerns: z.array(z.string()),
    contraception: z.enum(["yes", "no", "unsure"]).nullable(),
    hasSeenTour: z.boolean(),
    pushEnabled: z.boolean(),
    iosInstallDismissed: z.boolean(),
  }),
  checkIns: z.array(checkInSchema),
  // Client sends its last sync timestamp so we know if server data is newer
  lastSyncedAt: z.string().nullable(),
});

// --- Handler ---

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = syncRequestSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { profile, checkIns, lastSyncedAt } = validated.data;
    const supabase = createServerClient();
    const now = new Date().toISOString();

    // --- 1. Sync Profile ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any;

    // Fetch existing server profile
    const { data: existingProfile } = await sb
      .from("pwa_profiles")
      .select("*")
      .eq("clerk_user_id", userId)
      .single();

    let serverProfile;

    if (!existingProfile) {
      // First sync ever: create server profile from client data
      const { data, error } = await sb.from("pwa_profiles").insert({
        clerk_user_id: userId,
        last_period_date: profile.lastPeriodDate,
        cycle_length: profile.cycleLength,
        period_duration: profile.periodDuration,
        user_name: profile.userName,
        age_range: profile.ageRange,
        concerns: profile.concerns,
        contraception: profile.contraception,
        has_seen_tour: profile.hasSeenTour,
        push_enabled: profile.pushEnabled,
        ios_install_dismissed: profile.iosInstallDismissed,
        updated_at: now,
      }).select().single();

      if (error) {
        console.error("Profile insert error:", error);
        return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
      }
      serverProfile = data;
    } else {
      // Determine who wins: client or server
      // - New device (lastSyncedAt null) + server exists → server wins
      // - Another device updated since our last sync → server wins
      // - Otherwise → client wins (local changes are newer)
      const serverUpdatedAt = existingProfile.updated_at;
      const clientIsNewer = lastSyncedAt && serverUpdatedAt <= lastSyncedAt;

      if (clientIsNewer) {
        // Client wins: update server with client data
        const { data, error } = await sb
          .from("pwa_profiles")
          .update({
            last_period_date: profile.lastPeriodDate,
            cycle_length: profile.cycleLength,
            period_duration: profile.periodDuration,
            user_name: profile.userName,
            age_range: profile.ageRange,
            concerns: profile.concerns,
            contraception: profile.contraception,
            has_seen_tour: profile.hasSeenTour,
            push_enabled: profile.pushEnabled,
            ios_install_dismissed: profile.iosInstallDismissed,
            updated_at: now,
          })
          .eq("clerk_user_id", userId)
          .select()
          .single();

        if (error) {
          console.error("Profile update error:", error);
          return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
        }
        serverProfile = data;
      } else {
        // Server wins: return existing server data (don't overwrite)
        serverProfile = existingProfile;
      }
    }

    // --- 2. Sync Check-ins ---
    // Fetch ALL server check-ins for this user
    const { data: serverCheckIns } = await sb
      .from("pwa_checkins")
      .select("*")
      .eq("clerk_user_id", userId)
      .order("date", { ascending: false })
      .limit(90);

    const serverCheckInMap = new Map<string, typeof serverCheckIns[0]>();
    for (const ci of serverCheckIns ?? []) {
      serverCheckInMap.set(ci.date, ci);
    }

    // Upsert client check-ins to server
    if (checkIns.length > 0) {
      const upsertRows = checkIns.map((ci) => ({
        clerk_user_id: userId,
        date: ci.date,
        period_started: ci.periodStarted,
        sleep: ci.sleep,
        stress: ci.stress,
        symptoms: ci.symptoms,
        glow_score: ci.glowScore,
      }));

      const { error: upsertError } = await sb
        .from("pwa_checkins")
        .upsert(upsertRows, { onConflict: "clerk_user_id,date" });

      if (upsertError) {
        console.error("Check-in upsert error:", upsertError);
        // Non-fatal: continue with what we have
      }
    }

    // Fetch merged check-ins (server now has union of both)
    const { data: mergedCheckIns } = await sb
      .from("pwa_checkins")
      .select("date, period_started, sleep, stress, symptoms, glow_score")
      .eq("clerk_user_id", userId)
      .order("date", { ascending: false })
      .limit(90);

    // --- 3. Build response ---
    const responseCheckIns = (mergedCheckIns ?? []).map((ci: {
      date: string;
      period_started: boolean;
      sleep: number;
      stress: number;
      symptoms: string[];
      glow_score: number;
    }) => ({
      date: ci.date,
      periodStarted: ci.period_started,
      sleep: ci.sleep,
      stress: ci.stress,
      symptoms: ci.symptoms,
      glowScore: ci.glow_score,
    }));

    return NextResponse.json({
      success: true,
      profile: {
        lastPeriodDate: serverProfile.last_period_date,
        cycleLength: serverProfile.cycle_length,
        periodDuration: serverProfile.period_duration,
        userName: serverProfile.user_name,
        ageRange: serverProfile.age_range,
        concerns: serverProfile.concerns,
        contraception: serverProfile.contraception,
        hasSeenTour: serverProfile.has_seen_tour,
        pushEnabled: serverProfile.push_enabled,
        iosInstallDismissed: serverProfile.ios_install_dismissed,
      },
      checkIns: responseCheckIns,
      syncedAt: now,
    });
  } catch (error) {
    console.error("PWA sync error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
