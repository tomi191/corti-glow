import type { Metadata } from "next";
import { Shield, Lock, Eye, UserCheck, Trash2, Mail } from "lucide-react";
import { COMPANY } from "@/lib/constants";
import { BreadcrumbJsonLd } from "@/components/ui/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "Политика за Поверителност",
  description: "Политика за поверителност на LURA — как събираме, използваме и защитаваме личните ви данни.",
  alternates: {
    canonical: "https://luralab.eu/poveritelnost",
  },
  openGraph: {
    title: "Политика за Поверителност | LURA",
    description: "Как събираме, използваме и защитаваме личните ви данни.",
  },
};

const rights = [
  { icon: Eye, label: "Достъп до вашите лични данни" },
  { icon: UserCheck, label: "Корекция на неточни данни" },
  { icon: Trash2, label: "Изтриване на данните" },
  { icon: Mail, label: "Оттегляне на маркетинг съгласие" },
];

export default function PrivacyPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Начало", url: "https://luralab.eu" },
          { name: "Поверителност", url: "https://luralab.eu/poveritelnost" },
        ]}
      />

      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F2EF] via-white to-[#B2D8C6]/10" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 text-[#2D4A3E] text-sm font-medium uppercase tracking-widest mb-6">
            <Shield className="w-4 h-4" />
            Поверителност
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-light text-[#2D4A3E] mb-4 leading-tight">
            Политика за <span className="italic font-normal">Поверителност</span>
          </h1>
          <div className="h-[3px] w-16 bg-[#B2D8C6] rounded-full mx-auto mb-6" />
          <p className="text-sm text-stone-500">
            Последна актуализация: 15 януари 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-6">

          {/* Section 1 */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#B2D8C6]/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#B2D8C6]" />
              </div>
              <h2 className="text-xl font-semibold text-[#2D4A3E]">1. Събиране на Информация</h2>
            </div>
            <div className="pl-[52px] space-y-3 text-stone-600 font-light leading-relaxed">
              <p>
                {COMPANY.name} събира лична информация, когато правите поръчка,
                регистрирате се за нашия бюлетин или се свързвате с нас. Тази
                информация може да включва:
              </p>
              <ul className="space-y-2">
                {["Име и фамилия", "Имейл адрес", "Телефонен номер", "Адрес за доставка"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B2D8C6]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 2 */}
          <div className="mb-10 p-6 bg-[#FFC1CC]/5 rounded-2xl border border-[#FFC1CC]/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#FFC1CC]/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#FFC1CC]" />
              </div>
              <h2 className="text-xl font-semibold text-[#2D4A3E]">2. Данни от LURA Навигатор (PWA)</h2>
            </div>
            <div className="pl-[52px] space-y-3 text-stone-600 font-light leading-relaxed">
              <p>
                Ако използвате приложението LURA Навигатор (luralab.eu/app), събираме
                допълнителни данни, свързани със здравето ви:
              </p>
              <ul className="space-y-2">
                {[
                  "Данни за менструалния цикъл (продължителност, фази)",
                  "Самооценка на нива на стрес (скала 1-10)",
                  "Качество на съня (скала 1-10)",
                  "Симптоми (подуване, главоболие, умора и др.)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFC1CC] mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="p-4 bg-white/80 rounded-xl border border-[#FFC1CC]/20 mt-4">
                <p className="text-sm">
                  <strong className="text-[#2D4A3E]">Важно:</strong> Тези данни се съхраняват{" "}
                  <strong>локално на вашето устройство</strong> (localStorage) и се
                  синхронизират със сървъра само ако изрично дадете съгласие. Съгласно
                  GDPR, тези данни попадат в категорията &quot;данни за здравословно
                  състояние&quot; (чл. 9) и се обработват единствено с вашето изрично
                  съгласие.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#F4E3B2]/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-[#F4E3B2]" />
              </div>
              <h2 className="text-xl font-semibold text-[#2D4A3E]">3. Използване на Информацията</h2>
            </div>
            <div className="pl-[52px] space-y-2 text-stone-600 font-light leading-relaxed">
              <p>Използваме вашата информация за:</p>
              <ul className="space-y-2">
                {[
                  "Обработка и доставка на поръчки",
                  "Комуникация относно вашите поръчки",
                  "Маркетингови съобщения (само с ваше съгласие)",
                  "Подобряване на нашите продукти и услуги",
                  "Персонализирани препоръки в LURA Навигатор",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F4E3B2] mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#B2D8C6]/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#B2D8C6]" />
              </div>
              <h2 className="text-xl font-semibold text-[#2D4A3E]">4. Защита на Данните</h2>
            </div>
            <div className="pl-[52px] text-stone-600 font-light leading-relaxed">
              <p>
                Прилагаме подходящи технически и организационни мерки за защита на
                вашите лични данни срещу неоторизиран достъп, загуба или унищожаване.
              </p>
            </div>
          </div>

          {/* Section 5 - Rights */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#2D4A3E]/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-[#2D4A3E]" />
              </div>
              <h2 className="text-xl font-semibold text-[#2D4A3E]">5. Вашите Права</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-[52px]">
              {rights.map((right) => (
                <div
                  key={right.label}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-[#F5F2EF] border border-stone-100"
                >
                  <right.icon className="w-5 h-5 text-[#2D4A3E] flex-shrink-0" />
                  <span className="text-sm text-stone-700">{right.label}</span>
                </div>
              ))}
            </div>
            <div className="pl-[52px] mt-4 space-y-2 text-stone-600 font-light leading-relaxed">
              <p>Също имате право на:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2D4A3E] mt-2 flex-shrink-0" />
                  Изтриване на здравните данни от LURA Навигатор
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2D4A3E] mt-2 flex-shrink-0" />
                  Преносимост на данните (чл. 20 GDPR)
                </li>
              </ul>
            </div>
          </div>

          {/* Section 6 - Contact */}
          <div className="p-6 bg-[#F5F2EF] rounded-3xl border border-stone-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#B2D8C6]/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-[#B2D8C6]" />
              </div>
              <h2 className="text-xl font-semibold text-[#2D4A3E]">6. Контакт</h2>
            </div>
            <div className="pl-[52px] text-stone-600 font-light leading-relaxed">
              <p className="mb-4">
                За въпроси относно тази политика, моля свържете се с нас:
              </p>
              <div className="text-sm">
                <p className="font-medium text-[#2D4A3E]">{COMPANY.name}</p>
                <p>{COMPANY.address}</p>
                <p>
                  <a href={`mailto:${COMPANY.email}`} className="text-[#2D4A3E] font-medium hover:underline">
                    {COMPANY.email}
                  </a>
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
