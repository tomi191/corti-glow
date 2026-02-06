import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Проследи Поръчка",
  description: "Проследи статуса на твоята поръчка от LURA.",
};

export default function TrackOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
