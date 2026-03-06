import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Проследи Поръчка",
  description:
    "Проследи статуса на твоята поръчка от LURA. Въведи номера на поръчката и имейла си, за да видиш доставката в реално време.",
  alternates: { canonical: "https://luralab.eu/prosledi-porachka" },
  openGraph: {
    title: "Проследи Поръчка | LURA",
    description:
      "Провери статуса на твоята поръчка — обработка, изпращане и доставка.",
  },
};

export default function TrackOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
