import type { Metadata } from "next";
import { Mail, Phone, Clock, Truck, RotateCcw, HelpCircle, ChevronDown, MessageCircle } from "lucide-react";
import { faqs } from "@/data/faqs";
import { COMPANY, CARRIERS, DELIVERY_DAYS } from "@/lib/constants";
import { BreadcrumbJsonLd } from "@/components/ui/BreadcrumbJsonLd";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Помощ и Поддръжка",
  description:
    "Имате въпроси за Corti-Glow или вашата поръчка? Свържете се с LURA по имейл или телефон. Отговаряме в рамките на 24 часа. Вижте FAQ секцията за бързи отговори.",
  alternates: { canonical: "https://luralab.eu/pomosht" },
  openGraph: {
    title: "Помощ и Поддръжка | LURA",
    description:
      "Свържете се с нас по имейл или телефон. Отговаряме в рамките на 24 часа.",
  },
};

const contactMethods = [
  {
    icon: Mail,
    color: "#B2D8C6",
    title: "Имейл",
    value: COMPANY.email,
    description: "Отговаряме в рамките на 24 часа",
  },
  {
    icon: Phone,
    color: "#FFC1CC",
    title: "Телефон",
    value: COMPANY.phone,
    description: "Пон-Пет, 9:00 - 18:00",
  },
];

const shippingInfo = [
  {
    icon: Truck,
    color: "#B2D8C6",
    title: "Бърза Доставка",
    description: `${DELIVERY_DAYS} работни дни с ${CARRIERS.join(" или ")}`,
  },
  {
    icon: Clock,
    color: "#F4E3B2",
    title: "Безплатна Доставка",
    description: "За поръчки над 80 € доставката е безплатна",
  },
  {
    icon: RotateCcw,
    color: "#FFC1CC",
    title: "14-Дневно Връщане",
    description: "Неотворени продукти могат да бъдат върнати в рамките на 14 дни",
  },
];

export default function SupportPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Начало", url: "https://luralab.eu" },
          { name: "Помощ", url: "https://luralab.eu/pomosht" },
        ]}
      />

      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F2EF] via-white to-[#FFC1CC]/10" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 text-[#2D4A3E] text-sm font-medium uppercase tracking-widest mb-6">
            <HelpCircle className="w-4 h-4" />
            Поддръжка
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-light text-[#2D4A3E] mb-4 leading-tight">
            Как можем да <span className="italic font-normal">помогнем?</span>
          </h1>
          <div className="h-[3px] w-16 bg-[#B2D8C6] rounded-full mx-auto mb-6" />
          <p className="text-lg text-stone-600 font-light">
            Намерете отговори на най-честите въпроси или се свържете с нас.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contactMethods.map((method) => (
              <div
                key={method.title}
                className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${method.color}20` }}
                >
                  <method.icon className="w-6 h-6" style={{ color: method.color }} />
                </div>
                <h3 className="font-semibold text-[#2D4A3E] mb-1">
                  {method.title}
                </h3>
                <p className="text-[#2D4A3E] font-medium mb-1">{method.value}</p>
                <p className="text-sm text-stone-500">{method.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <span className="text-[#B2D8C6] text-xs font-bold tracking-widest uppercase mb-4 block">
                Пишете ни
              </span>
              <h2 className="text-2xl md:text-3xl font-serif font-light text-[#2D4A3E] mb-4 leading-tight">
                Изпрати ни <span className="italic">съобщение</span>
              </h2>
              <p className="text-stone-600 font-light mb-6">
                Попълни формата и ще ти отговорим в рамките на 24 часа.
              </p>
              <ContactForm />
            </div>
            <div className="flex flex-col justify-center">
              <div className="bg-[#F5F2EF] rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F4E3B2]/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#F4E3B2]" />
                  </div>
                  <h3 className="font-semibold text-[#2D4A3E]">Работно време</h3>
                </div>
                <div className="space-y-2 text-sm text-stone-600 pl-[52px]">
                  <p>Понеделник – Петък: 9:00 – 18:00</p>
                  <p>Събота – Неделя: Затворено</p>
                </div>
                <div className="h-px bg-stone-200 ml-[52px]" />
                <p className="text-sm text-stone-500 pl-[52px]">
                  Обикновено отговаряме в рамките на няколко часа в работно време.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shipping & Returns Info */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <span className="text-[#B2D8C6] text-xs font-bold tracking-widest uppercase mb-4 block">
              Информация
            </span>
            <h2 className="text-2xl md:text-4xl font-serif font-light text-[#2D4A3E] leading-tight">
              Доставка и <span className="italic">Връщане</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shippingInfo.map((info) => (
              <div
                key={info.title}
                className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-3xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${info.color}20` }}
                >
                  <info.icon className="w-6 h-6" style={{ color: info.color }} />
                </div>
                <h3 className="font-medium text-[#2D4A3E] mb-2">
                  {info.title}
                </h3>
                <p className="text-sm text-stone-600 font-light">
                  {info.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-[#F5F2EF]">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 text-[#2D4A3E] text-sm font-medium uppercase tracking-widest mb-4">
              <MessageCircle className="w-4 h-4" />
              FAQ
            </span>
            <h2 className="text-2xl md:text-4xl font-serif font-light text-[#2D4A3E] leading-tight">
              Често Задавани <span className="italic">Въпроси</span>
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group p-5 bg-white/80 backdrop-blur-sm rounded-2xl cursor-pointer border border-white/50 shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
              >
                <summary className="flex justify-between items-center font-medium text-[#2D4A3E]">
                  {faq.question}
                  <ChevronDown className="w-5 h-5 text-[#B2D8C6] group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
                </summary>
                <div className="h-px bg-gradient-to-r from-transparent via-[#B2D8C6]/30 to-transparent mt-4 mb-3" />
                <p className="text-stone-600 text-sm leading-relaxed font-light">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
