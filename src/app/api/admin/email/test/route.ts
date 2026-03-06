import { NextRequest, NextResponse } from "next/server";
import { getResendClient, EMAIL_FROM } from "@/lib/resend/client";
import { render } from "@react-email/render";
import { createElement } from "react";
import { z } from "zod";
import { DripDay0 } from "@/emails/drip-day0";
import { DripDay2 } from "@/emails/drip-day2";
import { DripDay5 } from "@/emails/drip-day5";
import { Welcome } from "@/emails/welcome";
import { WaitlistWelcome } from "@/emails/waitlist-welcome";

const templateMap: Record<string, React.ComponentType<any>> = {
  "drip-day0": DripDay0,
  "drip-day2": DripDay2,
  "drip-day5": DripDay5,
  welcome: Welcome,
  "waitlist-welcome": WaitlistWelcome,
};

const testSchema = z.object({
  to: z.string().email(),
  template: z.string().min(1),
  subject: z.string().min(1).max(200),
});

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
    const validated = testSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { to, template, subject } = validated.data;
    const Component = templateMap[template];

    if (!Component) {
      return NextResponse.json(
        { error: `Unknown template: ${template}` },
        { status: 400 }
      );
    }

    const html = await render(
      createElement(Component, { firstName: "Тест" })
    );

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `[ТЕСТ] ${subject}`,
      html,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      emailId: data?.id,
      sentTo: to,
    });
  } catch (err) {
    console.error("[Admin Email] Test send error:", err);
    return NextResponse.json(
      { error: "Failed to send test email" },
      { status: 500 }
    );
  }
}
