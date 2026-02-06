import type { Metadata } from "next";
import Link from "next/link";
import {
  Truck,
  Package,
  Clock,
  MapPin,
  RefreshCcw,
  Shield,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
} from "lucide-react";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Доставка и Връщане",
  description:
    "Информация за доставка с Еконт и Спиди, срокове, безплатна доставка над 80 € и политика за връщане.",
  alternates: {
    canonical: "https://luralab.eu/dostavka-i-vrashtane",
  },
};

const shippingFaqs = [
  {
    q: "Колко време отнема доставката?",
    a: "Повечето поръчки се доставят в рамките на 1-2 работни дни. В пиковите периоди (празници) може да отнеме до 3-4 дни.",
  },
  {
    q: "Мога ли да променя адреса за доставка?",
    a: "Да, свържи се с нас възможно най-бързо след поръчката. Ако пратката вече е изпратена, можеш да се свържеш директно с Еконт.",
  },
  {
    q: "Какво става ако не съм вкъщи при доставка до адрес?",
    a: "Куриерът ще се опита да се свърже с теб. Ако не те открие, пратката ще бъде оставена в най-близкия офис на Еконт.",
  },
  {
    q: "Доставяте ли в чужбина?",
    a: "Засега доставяме само в България. Планираме международна доставка скоро!",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: shippingFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F2EF] to-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Hero */}
      <section className="pt-24 md:pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#B2D8C6]/20 mb-6">
            <Truck className="w-8 h-8 text-[#2D4A3E]" />
          </div>
          <h1 className="text-3xl md:text-5xl font-semibold text-[#2D4A3E] mb-6">
            Доставка & Връщане
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Бърза и надеждна доставка до всяка точка в България. 14-дневна
            гаранция за връщане.
          </p>
        </div>
      </section>

      {/* Shipping Info */}
      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-[#2D4A3E] mb-8 flex items-center gap-3">
            <Package className="w-6 h-6 text-[#B2D8C6]" />
            Доставка
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Free Shipping Card */}
            <div className="bg-gradient-to-br from-[#B2D8C6]/20 to-[#B2D8C6]/5 rounded-2xl p-8 border border-[#B2D8C6]/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#B2D8C6] flex items-center justify-center">
                  <Truck className="w-6 h-6 text-[#2D4A3E]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2D4A3E]">
                    Безплатна доставка
                  </h3>
                  <p className="text-sm text-stone-600">За поръчки над 80 €</p>
                </div>
              </div>
              <p className="text-stone-600 text-sm">
                Поръчай за над 80 € и получи безплатна доставка до офис на
                Еконт или до адрес.
              </p>
            </div>

            {/* Delivery Time Card */}
            <div className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#FFC1CC]/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#2D4A3E]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2D4A3E]">1-2 работни дни</h3>
                  <p className="text-sm text-stone-600">Бърза доставка</p>
                </div>
              </div>
              <p className="text-stone-600 text-sm">
                Повечето поръчки се доставят в рамките на 1-2 работни дни след
                обработка.
              </p>
            </div>
          </div>

          {/* Shipping Options */}
          <div className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm mb-8">
            <h3 className="text-lg font-semibold text-[#2D4A3E] mb-6">
              Опции за доставка
            </h3>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#B2D8C6]/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-[#2D4A3E]" />
                </div>
                <div>
                  <h4 className="font-medium text-[#2D4A3E]">До офис на Еконт</h4>
                  <p className="text-sm text-stone-600 mt-1">
                    Избери удобен за теб офис. Можеш да вземеш пратката в удобно
                    за теб време.
                  </p>
                  <p className="text-sm font-medium text-[#2D4A3E] mt-2">
                    Цена: 5.99 € (безплатно над 80 €)
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#FFC1CC]/20 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-[#2D4A3E]" />
                </div>
                <div>
                  <h4 className="font-medium text-[#2D4A3E]">До адрес</h4>
                  <p className="text-sm text-stone-600 mt-1">
                    Получи пратката директно на посочен от теб адрес. Куриерът
                    ще се свърже с теб преди доставката.
                  </p>
                  <p className="text-sm font-medium text-[#2D4A3E] mt-2">
                    Цена: 7.99 € (безплатно над 80 €)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm">
            <h3 className="text-lg font-semibold text-[#2D4A3E] mb-6">
              Начини на плащане
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <CheckCircle2 className="w-5 h-5 text-[#B2D8C6] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-[#2D4A3E]">Карта онлайн</h4>
                  <p className="text-sm text-stone-600 mt-1">
                    Visa, Mastercard, American Express. Сигурно плащане чрез
                    Stripe.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="w-5 h-5 text-[#B2D8C6] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-[#2D4A3E]">Наложен платеж</h4>
                  <p className="text-sm text-stone-600 mt-1">
                    Плащаш при получаване на пратката. Без допълнителна такса.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Returns Info */}
      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-[#2D4A3E] mb-8 flex items-center gap-3">
            <RefreshCcw className="w-6 h-6 text-[#B2D8C6]" />
            Връщане и Рекламации
          </h2>

          <div className="bg-gradient-to-br from-[#FFC1CC]/20 to-[#FFC1CC]/5 rounded-2xl p-8 border border-[#FFC1CC]/30 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-[#2D4A3E]" />
              <h3 className="text-xl font-semibold text-[#2D4A3E]">
                14-дневна гаранция
              </h3>
            </div>
            <p className="text-stone-600">
              Ако не си доволна от продукта, можеш да го върнеш в рамките на 14
              дни от получаването. Без въпроси.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm">
            <h3 className="text-lg font-semibold text-[#2D4A3E] mb-6">
              Как да върна продукт?
            </h3>

            <ol className="space-y-6">
              <li className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-[#B2D8C6] text-[#2D4A3E] font-semibold flex items-center justify-center flex-shrink-0">
                  1
                </span>
                <div>
                  <h4 className="font-medium text-[#2D4A3E]">Свържи се с нас</h4>
                  <p className="text-sm text-stone-600 mt-1">
                    Изпрати ни имейл на{" "}
                    <a
                      href="mailto:hello@luralab.eu"
                      className="text-[#2D4A3E] underline"
                    >
                      hello@luralab.eu
                    </a>{" "}
                    с номера на поръчката и причината за връщане.
                  </p>
                </div>
              </li>

              <li className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-[#B2D8C6] text-[#2D4A3E] font-semibold flex items-center justify-center flex-shrink-0">
                  2
                </span>
                <div>
                  <h4 className="font-medium text-[#2D4A3E]">Изпрати продукта</h4>
                  <p className="text-sm text-stone-600 mt-1">
                    Ще ти изпратим инструкции за връщане. Продуктът трябва да е в
                    оригинална опаковка.
                  </p>
                </div>
              </li>

              <li className="flex gap-4">
                <span className="w-8 h-8 rounded-full bg-[#B2D8C6] text-[#2D4A3E] font-semibold flex items-center justify-center flex-shrink-0">
                  3
                </span>
                <div>
                  <h4 className="font-medium text-[#2D4A3E]">Получи възстановяване</h4>
                  <p className="text-sm text-stone-600 mt-1">
                    След получаване и проверка, ще възстановим сумата в рамките
                    на 5-7 работни дни.
                  </p>
                </div>
              </li>
            </ol>

            <div className="mt-8 p-4 bg-amber-50 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <strong>Важно:</strong> Разходите за обратна доставка са за сметка
                на клиента, освен ако продуктът не е дефектен или грешно изпратен.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-[#2D4A3E] mb-8">
            Често задавани въпроси
          </h2>

          <div className="space-y-4">
            {shippingFaqs.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 border border-stone-100 shadow-sm"
              >
                <h3 className="font-medium text-[#2D4A3E] mb-2">{item.q}</h3>
                <p className="text-sm text-stone-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto bg-[#2D4A3E] rounded-2xl p-8 md:p-12">
          <div className="text-center text-white mb-8">
            <h2 className="text-2xl font-semibold mb-3">Имаш още въпроси?</h2>
            <p className="text-stone-300">
              Екипът ни е тук да помогне. Свържи се с нас!
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a
              href="mailto:hello@luralab.eu"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#B2D8C6] text-[#2D4A3E] rounded-full font-medium hover:bg-[#FFC1CC] transition"
            >
              <Mail className="w-5 h-5" />
              hello@luralab.eu
            </a>
            <Link
              href="/pomosht"
              className="flex items-center justify-center gap-2 px-6 py-3 border border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition"
            >
              <Phone className="w-5 h-5" />
              Контакти
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
