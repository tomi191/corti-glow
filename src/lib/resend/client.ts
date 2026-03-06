import { Resend } from "resend";

// Singleton Resend client
let resendClient: Resend | null = null;

export function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

// Email configuration
export const EMAIL_FROM =
  process.env.EMAIL_FROM || "LURA <noreply@luralab.eu>";
export const SUPPORT_EMAIL =
  process.env.EMAIL_SUPPORT || "support@luralab.eu";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://luralab.eu";
export const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || "";
