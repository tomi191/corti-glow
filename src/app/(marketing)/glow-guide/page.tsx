import type { Metadata } from "next";
import { QuizPage } from "@/components/quiz";

export const metadata: Metadata = {
  title: "Glow Guide — Открий Твоя Stress-Beauty Score",
  description:
    "Направи безплатния 2-минутен тест и разбери как стресът влияе на красотата ти. Получи персонализирана AI препоръка за Corti-Glow.",
  openGraph: {
    title: "Glow Guide — Какъв е Твоят Stress-Beauty Score?",
    description:
      "6 въпроса. 2 минути. Персонална AI препоръка за хормонален баланс.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
  },
  alternates: {
    canonical: "https://luralab.eu/glow-guide",
  },
};

export default function GlowGuidePage() {
  return <QuizPage />;
}
