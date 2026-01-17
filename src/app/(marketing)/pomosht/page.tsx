import type { Metadata } from "next";
import { Mail, Phone, Clock, Truck, RotateCcw, HelpCircle } from "lucide-react";
import { faqs } from "@/data/faqs";
import { ChevronDown } from "lucide-react";
import { COMPANY, CARRIERS, DELIVERY_DAYS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Помощ и Поддръжка",
  description: "Имате въпроси? Свържете се с нас или проверете FAQ секцията.",
};

const contactMethods = [
  {
    icon: Mail,
    title: "Имейл",
    value: COMPANY.email,
    description: "Отговаряме в рамките на 24 часа",
  },
  {
    icon: Phone,
    title: "Телефон",
    value: "+359 888 123 456",
    description: "Пон-Пет, 9:00 - 18:00",
  },
];

export default function SupportPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-semibold text-[#2D4A3E] mb-4">
            Как можем да помогнем?
          </h1>
          <p className="text-lg text-stone-600">
            Намерете отговори на най-честите въпроси или се свържете с нас.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12 bg-stone-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contactMethods.map((method) => (
              <div
                key={method.title}
                className="bg-white rounded-2xl p-6 border border-stone-100"
              >
                <method.icon className="w-8 h-8 text-[#2D4A3E] mb-4" />
                <h3 className="font-semibold text-stone-800 mb-1">
                  {method.title}
                </h3>
                <p className="text-[#2D4A3E] font-medium mb-1">{method.value}</p>
                <p className="text-sm text-stone-500">{method.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping & Returns Info */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-[#2D4A3E] text-center mb-8">
            Доставка и Връщане
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-stone-50 rounded-2xl">
              <Truck className="w-8 h-8 text-[#2D4A3E] mx-auto mb-4" />
              <h3 className="font-medium text-stone-800 mb-2">
                Бърза Доставка
              </h3>
              <p className="text-sm text-stone-600">
                {DELIVERY_DAYS} работни дни с {CARRIERS.join(" или ")}
              </p>
            </div>
            <div className="text-center p-6 bg-stone-50 rounded-2xl">
              <Clock className="w-8 h-8 text-[#2D4A3E] mx-auto mb-4" />
              <h3 className="font-medium text-stone-800 mb-2">
                Безплатна Доставка
              </h3>
              <p className="text-sm text-stone-600">
                За поръчки над 160 лв доставката е безплатна
              </p>
            </div>
            <div className="text-center p-6 bg-stone-50 rounded-2xl">
              <RotateCcw className="w-8 h-8 text-[#2D4A3E] mx-auto mb-4" />
              <h3 className="font-medium text-stone-800 mb-2">
                14-Дневно Връщане
              </h3>
              <p className="text-sm text-stone-600">
                Неотворени продукти могат да бъдат върнати в рамките на 14 дни
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-[#2D4A3E] text-center mb-8">
            Често Задавани Въпроси
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group p-4 bg-white rounded-xl cursor-pointer shadow-sm"
              >
                <summary className="flex justify-between items-center font-medium text-stone-800">
                  {faq.question}
                  <ChevronDown className="w-5 h-5 text-[#B2D8C6] group-open:rotate-180 transition-transform" />
                </summary>
                <p className="text-stone-500 text-sm mt-3 leading-relaxed">
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
