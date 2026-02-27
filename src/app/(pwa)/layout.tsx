export const dynamic = "force-dynamic";

import PWALayoutClient from "./PWALayoutClient";

export default function PWALayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PWALayoutClient>{children}</PWALayoutClient>;
}
