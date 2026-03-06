import { NextResponse } from "next/server";

// Available email templates metadata
const templates = [
  {
    id: "order-confirmation",
    name: "Потвърждение на поръчка",
    category: "transactional",
    description: "Изпраща се автоматично при успешно плащане",
  },
  {
    id: "shipping-notification",
    name: "Изпратена пратка",
    category: "transactional",
    description: "Изпраща се при изпращане на поръчка с Еконт",
  },
  {
    id: "delivery-confirmation",
    name: "Доставено",
    category: "transactional",
    description: "Изпраща се при потвърдена доставка",
  },
  {
    id: "waitlist-welcome",
    name: "PWA Welcome",
    category: "transactional",
    description: "Изпраща се при нов PWA subscriber",
  },
  {
    id: "welcome",
    name: "Welcome + 10% отстъпка",
    category: "marketing",
    description: "Welcome email с код WELCOME10",
  },
  {
    id: "contact-notification",
    name: "Контактна форма",
    category: "internal",
    description: "Изпраща се до support@ при ново съобщение",
  },
  {
    id: "drip-day0",
    name: "Drip Day 0 — Welcome",
    category: "drip",
    description: "Добре дошла + 3 ключови съставки",
  },
  {
    id: "drip-day2",
    name: "Drip Day 2 — Наука",
    category: "drip",
    description: "5 проблема, 1 корен — кортизолът",
  },
  {
    id: "drip-day5",
    name: "Drip Day 5 — Exclusivity",
    category: "drip",
    description: "Запази своята кутия — лимитирана партида",
  },
];

export async function GET() {
  return NextResponse.json({ templates });
}
