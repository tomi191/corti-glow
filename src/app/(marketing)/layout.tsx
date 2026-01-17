import { Header, Footer } from "@/components/layout";
import { CartDrawer } from "@/components/cart";
import { MobileStickyBar } from "@/components/home";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="pb-24 md:pb-0">{children}</main>
      <Footer />
      <CartDrawer />
      <MobileStickyBar />
    </>
  );
}
