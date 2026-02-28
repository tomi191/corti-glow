export const dynamic = "force-dynamic";

import PWALayoutClient from "./PWALayoutClient";
import PWAErrorBoundary from "@/components/pwa/PWAErrorBoundary";

export default function PWALayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PWAErrorBoundary>
      <PWALayoutClient>{children}</PWALayoutClient>
    </PWAErrorBoundary>
  );
}
