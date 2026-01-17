"use server";

import { redirect } from "next/navigation";
import { checkoutSchema } from "@/lib/schemas/checkout";
import { generateOrderId } from "@/lib/utils";

export interface CheckoutState {
  errors?: {
    firstName?: string[];
    lastName?: string[];
    phone?: string[];
    email?: string[];
    address?: string[];
    city?: string[];
  };
  message?: string;
  success?: boolean;
  orderId?: string;
}

export async function submitOrder(
  prevState: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const rawData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    city: formData.get("city"),
  };

  const validated = checkoutSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "Моля, коригирайте грешките във формата.",
    };
  }

  // Generate order ID
  const orderId = generateOrderId();

  // TODO: Save order to database (Supabase)
  // For now, we just redirect to success page
  // In a real app, you would save the order here

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 500));

  redirect(`/uspeh?orderId=${encodeURIComponent(orderId)}`);
}
