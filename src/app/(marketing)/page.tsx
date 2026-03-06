import type { Metadata } from "next";
import {
  ImmersiveHero,
  ScienceScrollytelling,
  BrandEthos,
  TheRitual,
  DigitalCompanion,
  RawSocialProof,
  GlowGuidePromo,
  FrictionlessCheckout,
} from "@/components/home";
import { getProduct } from "@/lib/actions/products";
import type { ProductVariant } from "@/types";
import type { ProductVariantDB } from "@/lib/supabase/types";
import { IS_PRELAUNCH } from "@/lib/constants";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Corti-Glow — Когато кортизолът спадне, всичко се подрежда.",
  description:
    "7 активни съставки с клинични дозировки. 1 саше преди сън. Мио-инозитол, ашваганда, магнезий бисглицинат и инулин за по-нисък кортизол, по-добър сън и хормонален баланс. Без захар.",
  openGraph: {
    title: "LURA Corti-Glow — 7 Съставки. 1 Саше. По-нисък Кортизол.",
    description:
      "Формула с клинични дозировки за жени, които искат да спят по-добре, да се подуват по-малко и да върнат хормоналния си баланс.",
  },
  alternates: {
    canonical: "https://luralab.eu",
  },
};

function mapVariants(dbVariants: ProductVariantDB[]): ProductVariant[] {
  return dbVariants.map((v) => ({
    id: v.id,
    name: v.name,
    description: v.description,
    price: v.price,
    compareAtPrice: v.compare_at_price,
    quantity: v.quantity,
    isBestSeller: v.is_best_seller,
    savings: v.savings,
    image: v.image,
  }));
}

export default async function HomePage() {
  let variants: ProductVariant[] | undefined;
  if (!IS_PRELAUNCH) {
    try {
      const { product } = await getProduct("corti-glow");
      if (product?.variants) {
        variants = mapVariants(product.variants as unknown as ProductVariantDB[]);
      }
    } catch {
      // Silently fall back to hardcoded data
    }
  }

  return (
    <main className="bg-[#F7F4F0] min-h-[100svh] selection:bg-[#2D4A3E] selection:text-[#F7F4F0]">
      <ImmersiveHero />
      <ScienceScrollytelling />
      <BrandEthos />
      <TheRitual />
      <DigitalCompanion />
      <RawSocialProof />
      <GlowGuidePromo />
      <FrictionlessCheckout variants={variants} />
    </main>
  );
}
