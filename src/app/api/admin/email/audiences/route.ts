import { NextResponse } from "next/server";
import { getResendClient, AUDIENCE_ID } from "@/lib/resend/client";

export async function GET() {
  const resend = getResendClient();
  if (!resend || !AUDIENCE_ID) {
    return NextResponse.json(
      { error: "Resend not configured" },
      { status: 503 }
    );
  }

  try {
    const { data: contacts, error } = await resend.contacts.list({
      audienceId: AUDIENCE_ID,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const allContacts = contacts?.data || [];
    const subscribed = allContacts.filter((c) => !c.unsubscribed);
    const unsubscribed = allContacts.filter((c) => c.unsubscribed);

    return NextResponse.json({
      audienceId: AUDIENCE_ID,
      total: allContacts.length,
      subscribed: subscribed.length,
      unsubscribed: unsubscribed.length,
    });
  } catch (err) {
    console.error("[Admin Email] Audiences error:", err);
    return NextResponse.json(
      { error: "Failed to fetch audience data" },
      { status: 500 }
    );
  }
}
