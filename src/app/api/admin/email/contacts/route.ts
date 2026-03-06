import { NextResponse } from "next/server";
import { listContacts } from "@/lib/resend/audiences";

export async function GET() {
  const result = await listContacts();

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "Failed to list contacts" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    contacts: result.contacts,
    total: result.contacts.length,
  });
}
