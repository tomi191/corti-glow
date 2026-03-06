import { NextRequest, NextResponse } from "next/server";
import { getResendClient, EMAIL_FROM, AUDIENCE_ID } from "@/lib/resend/client";
import { z } from "zod";
import { render } from "@react-email/render";
import { createElement } from "react";
import { DripDay0 } from "@/emails/drip-day0";
import { DripDay2 } from "@/emails/drip-day2";
import { DripDay5 } from "@/emails/drip-day5";

const templateMap: Record<string, React.ComponentType<any>> = {
  "drip-day0": DripDay0,
  "drip-day2": DripDay2,
  "drip-day5": DripDay5,
};

const broadcastSchema = z.object({
  template: z.string().min(1),
  subject: z.string().min(1).max(200),
  audienceId: z.string().optional(),
});

// List broadcasts (placeholder — Resend doesn't have a list broadcasts endpoint yet)
export async function GET() {
  return NextResponse.json({
    broadcasts: [],
    message:
      "Broadcast history tracking coming soon. Use Resend dashboard for now.",
  });
}

// Create and send a broadcast
export async function POST(request: NextRequest) {
  const resend = getResendClient();
  if (!resend) {
    return NextResponse.json(
      { error: "Resend not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const validated = broadcastSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { template, subject, audienceId } = validated.data;
    const Component = templateMap[template];

    if (!Component) {
      return NextResponse.json(
        { error: `Unknown template: ${template}` },
        { status: 400 }
      );
    }

    // Render template to HTML
    const html = await render(createElement(Component, {}));

    const targetAudience = audienceId || AUDIENCE_ID;
    if (!targetAudience) {
      return NextResponse.json(
        { error: "No audience ID configured" },
        { status: 400 }
      );
    }

    // Send broadcast via Resend batch/broadcast
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: targetAudience, // Audience ID sends to all contacts
      subject,
      html,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      emailId: data?.id,
      template,
      subject,
    });
  } catch (err) {
    console.error("[Admin Email] Broadcast error:", err);
    return NextResponse.json(
      { error: "Failed to send broadcast" },
      { status: 500 }
    );
  }
}
