import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getSubscription,
  updateSubscription,
} from "@/lib/actions/subscriptions";
import {
  pauseStripeSubscription,
  resumeStripeSubscription,
  cancelStripeSubscription,
  skipNextCycle,
} from "@/lib/stripe/subscription-actions";

const actionSchema = z.object({
  action: z.enum(["pause", "resume", "cancel", "skip"]),
});

// GET: Read subscription details
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { subscription, error } = await getSubscription(id);

    if (error || !subscription) {
      return NextResponse.json(
        { error: "Абонаментът не е намерен" },
        { status: 404 }
      );
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("Get subscription error:", error);
    return NextResponse.json(
      { error: "Грешка при зареждане на абонамента" },
      { status: 500 }
    );
  }
}

// PATCH: Update subscription (pause, resume, cancel, skip)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validated = actionSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Невалидно действие" },
        { status: 400 }
      );
    }

    const { action } = validated.data;

    // Get subscription
    const { subscription, error: fetchError } = await getSubscription(id);
    if (fetchError || !subscription) {
      return NextResponse.json(
        { error: "Абонаментът не е намерен" },
        { status: 404 }
      );
    }

    const stripeSubId = subscription.stripe_subscription_id;
    if (!stripeSubId) {
      return NextResponse.json(
        { error: "Абонаментът няма Stripe идентификатор" },
        { status: 400 }
      );
    }

    switch (action) {
      case "pause":
        if (subscription.status !== "active") {
          return NextResponse.json(
            { error: "Може да паузирате само активен абонамент" },
            { status: 400 }
          );
        }
        await pauseStripeSubscription(stripeSubId);
        await updateSubscription(id, {
          status: "paused",
          paused_at: new Date().toISOString(),
        });
        break;

      case "resume":
        if (subscription.status !== "paused") {
          return NextResponse.json(
            { error: "Може да възобновите само паузиран абонамент" },
            { status: 400 }
          );
        }
        await resumeStripeSubscription(stripeSubId);
        await updateSubscription(id, {
          status: "active",
          paused_at: null,
        });
        break;

      case "cancel":
        if (subscription.status === "cancelled") {
          return NextResponse.json(
            { error: "Абонаментът вече е отменен" },
            { status: 400 }
          );
        }
        await cancelStripeSubscription(stripeSubId);
        await updateSubscription(id, {
          cancel_at_period_end: true,
        });
        break;

      case "skip":
        if (subscription.status !== "active") {
          return NextResponse.json(
            { error: "Може да пропуснете само при активен абонамент" },
            { status: 400 }
          );
        }
        await skipNextCycle(stripeSubId);
        break;
    }

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error("Subscription update error:", error);
    return NextResponse.json(
      { error: "Грешка при обновяване на абонамента" },
      { status: 500 }
    );
  }
}
