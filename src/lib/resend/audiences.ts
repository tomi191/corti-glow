import { getResendClient, AUDIENCE_ID } from "./client";

// Add a contact to the main LURA audience
export async function addContact({
  email,
  firstName,
  lastName,
  source,
}: {
  email: string;
  firstName?: string;
  lastName?: string;
  source?: string;
}): Promise<{ success: boolean; error?: string }> {
  const resend = getResendClient();
  if (!resend || !AUDIENCE_ID) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[Audiences] Skipped (not configured):", email);
    }
    return { success: true };
  }

  try {
    const { error } = await resend.contacts.create({
      audienceId: AUDIENCE_ID,
      email,
      firstName: firstName || "",
      lastName: lastName || "",
      unsubscribed: false,
    });

    if (error) {
      // "Contact already exists" is not an error for us
      if (error.message?.includes("already exists")) {
        return { success: true };
      }
      console.error("[Audiences] Failed to add contact:", error);
      return { success: false, error: error.message };
    }

    console.log("[Audiences] Contact added:", email);
    return { success: true };
  } catch (err) {
    console.error("[Audiences] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// Update a contact's properties (e.g., after purchase)
export async function updateContact({
  email,
  firstName,
  lastName,
  unsubscribed,
}: {
  email: string;
  firstName?: string;
  lastName?: string;
  unsubscribed?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const resend = getResendClient();
  if (!resend || !AUDIENCE_ID) {
    return { success: true };
  }

  try {
    // First get contacts to find the ID
    const { data: contacts } = await resend.contacts.list({
      audienceId: AUDIENCE_ID,
    });

    const contact = contacts?.data?.find(
      (c) => c.email.toLowerCase() === email.toLowerCase()
    );

    if (!contact) {
      // Contact doesn't exist yet — create it
      return addContact({ email, firstName, lastName });
    }

    const updateData: Parameters<typeof resend.contacts.update>[0] = {
      audienceId: AUDIENCE_ID,
      id: contact.id,
    };

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (unsubscribed !== undefined) updateData.unsubscribed = unsubscribed;

    const { error } = await resend.contacts.update(updateData);

    if (error) {
      console.error("[Audiences] Failed to update contact:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("[Audiences] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// Remove a contact (unsubscribe)
export async function removeContact(
  email: string
): Promise<{ success: boolean; error?: string }> {
  return updateContact({ email, unsubscribed: true });
}

// List contacts from the audience (for admin)
export async function listContacts(): Promise<{
  success: boolean;
  contacts: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    unsubscribed: boolean;
    createdAt: string;
  }>;
  error?: string;
}> {
  const resend = getResendClient();
  if (!resend || !AUDIENCE_ID) {
    return { success: true, contacts: [] };
  }

  try {
    const { data, error } = await resend.contacts.list({
      audienceId: AUDIENCE_ID,
    });

    if (error) {
      console.error("[Audiences] Failed to list contacts:", error);
      return { success: false, contacts: [], error: error.message };
    }

    const contacts = (data?.data || []).map((c) => ({
      id: c.id,
      email: c.email,
      firstName: c.first_name || "",
      lastName: c.last_name || "",
      unsubscribed: c.unsubscribed,
      createdAt: c.created_at,
    }));

    return { success: true, contacts };
  } catch (err) {
    console.error("[Audiences] Error:", err);
    return {
      success: false,
      contacts: [],
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
