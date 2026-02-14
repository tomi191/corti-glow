import type { Metadata } from "next";
import { COMPANY } from "@/lib/constants";
import { BreadcrumbJsonLd } from "@/components/ui/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "Политика за Поверителност",
  description: "Политика за поверителност на LURA",
};

export default function PrivacyPage() {
  return (
    <section className="py-16 bg-white">
      <BreadcrumbJsonLd
        items={[
          { name: "Начало", url: "https://luralab.eu" },
          { name: "Поверителност", url: "https://luralab.eu/poveritelnost" },
        ]}
      />
      <div className="max-w-3xl mx-auto px-6 prose prose-stone">
        <h1 className="text-3xl font-semibold text-[#2D4A3E] mb-8">
          Политика за Поверителност
        </h1>

        <p className="text-sm text-stone-500 mb-8">
          Последна актуализация: 15 януари 2026
        </p>

        <h2>1. Събиране на Информация</h2>
        <p>
          {COMPANY.name} събира лична информация, когато правите поръчка,
          регистрирате се за нашия бюлетин или се свързвате с нас. Тази
          информация може да включва:
        </p>
        <ul>
          <li>Име и фамилия</li>
          <li>Имейл адрес</li>
          <li>Телефонен номер</li>
          <li>Адрес за доставка</li>
        </ul>

        <h2>2. Използване на Информацията</h2>
        <p>Използваме вашата информация за:</p>
        <ul>
          <li>Обработка и доставка на поръчки</li>
          <li>Комуникация относно вашите поръчки</li>
          <li>
            Изпращане на маркетингови съобщения (само с ваше съгласие)
          </li>
          <li>Подобряване на нашите продукти и услуги</li>
        </ul>

        <h2>3. Защита на Данните</h2>
        <p>
          Прилагаме подходящи технически и организационни мерки за защита на
          вашите лични данни срещу неоторизиран достъп, загуба или унищожаване.
        </p>

        <h2>4. Вашите Права</h2>
        <p>Имате право да:</p>
        <ul>
          <li>Получите достъп до вашите лични данни</li>
          <li>Поискате корекция на неточни данни</li>
          <li>Поискате изтриване на данните</li>
          <li>Оттеглите съгласието си за маркетингови съобщения</li>
        </ul>

        <h2>5. Контакт</h2>
        <p>
          За въпроси относно тази политика, моля свържете се с нас на{" "}
          {COMPANY.email}.
        </p>

        <div className="mt-12 p-6 bg-stone-50 rounded-xl">
          <p className="text-sm text-stone-600">
            <strong>{COMPANY.name}</strong>
            <br />
            {COMPANY.address}
            <br />
            {COMPANY.email}
          </p>
        </div>
      </div>
    </section>
  );
}
