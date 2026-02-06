import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendContactEmail } from "@/lib/email";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

const rateLimiter = createRateLimiter(3, 60 * 60 * 1000); // 3 per hour

const contactSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа").max(100),
  email: z.string().email("Невалиден имейл"),
  message: z.string().min(10, "Минимум 10 символа").max(2000),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    if (rateLimiter.isLimited(ip)) {
      return NextResponse.json(
        { error: "Твърде много заявки. Опитайте отново по-късно." },
        { status: 429 }
      );
    }

    const body = await request.json();

    const validated = contactSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Моля, попълнете всички полета коректно.", errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    rateLimiter.recordAttempt(ip);

    const result = await sendContactEmail(validated.data);

    if (!result.success) {
      return NextResponse.json(
        { error: "Грешка при изпращане на съобщението." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Вътрешна грешка на сървъра." },
      { status: 500 }
    );
  }
}
