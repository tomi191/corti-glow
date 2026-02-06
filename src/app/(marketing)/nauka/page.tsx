import type { Metadata } from "next";
import { InteractiveSciencePage } from "@/components/science/InteractiveSciencePage";
import { BreadcrumbJsonLd } from "@/components/ui/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "Науката зад Corti-Glow",
  description:
    "Научете как Corti-Glow помага за намаляване на кортизола и подобрява хормоналния баланс с клинично доказани съставки.",
  alternates: { canonical: "https://luralab.eu/nauka" },
};

export default function SciencePage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Начало", url: "https://luralab.eu" },
          { name: "Наука", url: "https://luralab.eu/nauka" },
        ]}
      />
      <InteractiveSciencePage />
    </>
  );
}
