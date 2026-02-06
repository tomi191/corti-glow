import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Моят Акаунт",
  description: "Преглед на поръчки и история на покупките в LURA.",
  robots: { index: false, follow: false },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
