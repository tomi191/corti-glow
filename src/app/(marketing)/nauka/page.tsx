import type { Metadata } from "next";
import { InteractiveSciencePage } from "@/components/science/InteractiveSciencePage";

export const metadata: Metadata = {
  title: "Науката зад Corti-Glow",
  description:
    "Научете как Corti-Glow помага за намаляване на кортизола и подобрява хормоналния баланс с клинично доказани съставки.",
};

export default function SciencePage() {
  return <InteractiveSciencePage />;
}
