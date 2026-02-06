import type { Metadata } from "next";
import {
  PremiumHero,
  PremiumFeatures,
  PremiumIngredients,
  PremiumHowTo,
  PremiumBundles,
  BentoReviews,
  PremiumFAQ,
  PremiumCTA,
} from "@/components/home";
import { homepageFaqs } from "@/data/homepage-faqs";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Corti-Glow Ритуал — Анти-Стрес & Де-Блоут",
  description:
    "Открий Corti-Glow – вкусният моктейл с горска ягода, който понижава кортизола с до 27%. 500+ доволни клиенти.",
  openGraph: {
    title: "LURA | Corti-Glow Ритуал",
    description: "Изпий стреса. Прибери коремчето.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
  },
  alternates: {
    canonical: "https://luralab.eu",
  },
};

export default function HomePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: homepageFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PremiumHero />
      <PremiumFeatures />
      <PremiumIngredients />
      <PremiumHowTo />
      <PremiumBundles />
      <BentoReviews />
      <PremiumFAQ />
      <PremiumCTA />
    </>
  );
}
