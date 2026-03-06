// Admin Orders CSV Export

import { NextRequest, NextResponse } from "next/server";
import { listOrders } from "@/lib/actions/orders";
import type { OrderStatus, PaymentStatus } from "@/lib/supabase/types";

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status") as OrderStatus | null;
    const paymentStatus = searchParams.get("paymentStatus") as PaymentStatus | null;
    const search = searchParams.get("search") || undefined;

    // Fetch all matching orders (up to 10000)
    const result = await listOrders({
      status: status || undefined,
      paymentStatus: paymentStatus || undefined,
      search,
      limit: 10000,
      offset: 0,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    const headers = [
      "Номер",
      "Дата",
      "Име",
      "Фамилия",
      "Имейл",
      "Телефон",
      "Статус",
      "Плащане",
      "Метод на плащане",
      "Доставка",
      "Подобща",
      "Отстъпка",
      "Доставка цена",
      "Обща сума",
      "Валута",
      "Промо код",
      "Tracking номер",
    ];

    const rows = result.orders.map((order) => [
      escapeCSV(order.order_number),
      escapeCSV(new Date(order.created_at).toLocaleDateString("bg-BG")),
      escapeCSV(order.customer_first_name),
      escapeCSV(order.customer_last_name),
      escapeCSV(order.customer_email),
      escapeCSV(order.customer_phone),
      escapeCSV(order.status),
      escapeCSV(order.payment_status),
      escapeCSV(order.payment_method),
      escapeCSV(order.shipping_method),
      escapeCSV(order.subtotal),
      escapeCSV(order.discount_amount),
      escapeCSV(order.shipping_price),
      escapeCSV(order.total),
      escapeCSV(order.currency),
      escapeCSV(order.discount_code),
      escapeCSV(order.econt_tracking_number),
    ]);

    // BOM for Excel UTF-8 compatibility
    const BOM = "\uFEFF";
    const csv = BOM + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const filename = `porachki-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("CSV export error:", error);
    return NextResponse.json(
      { error: "Failed to export orders" },
      { status: 500 }
    );
  }
}
