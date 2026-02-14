import type { Metadata } from "next";
import Link from "next/link";
import { CartDrawer } from "@/components/cart";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Minimal Header */}
      <nav className="bg-white border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-center">
          <Link
            href="/"
            className="text-xl font-semibold tracking-widest text-[#2D4A3E]"
          >
            LURA
          </Link>
        </div>
      </nav>

      <main>{children}</main>
      <CartDrawer />
    </>
  );
}
