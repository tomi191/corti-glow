import { z } from "zod";

export const checkoutSchema = z.object({
  firstName: z.string().min(2, "Минимум 2 символа"),
  lastName: z.string().min(2, "Минимум 2 символа"),
  phone: z
    .string()
    .regex(/^(\+359|0)[0-9]{9}$/, "Невалиден телефонен номер (пр. 0888123456)"),
  email: z.string().email("Невалиден имейл адрес"),
  address: z.string().min(10, "Моля, въведете пълен адрес"),
  city: z.string().min(2, "Моля, въведете град"),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
