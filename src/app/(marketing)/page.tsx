import type { Metadata } from "next";
import {
  PremiumHero,
  SocialProofBanner,
  PremiumFeatures,
  GlowGuideCTA,
  RealResults,
  PremiumIngredients,
  PremiumHowTo,
  GlowGuideCTAMini,
  PremiumBundles,
  BentoReviews,
  PremiumFAQ,
  PremiumCTA,
} from "@/components/home";
import { homepageFaqs } from "@/data/homepage-faqs";
import { getProduct } from "@/lib/actions/products";
import type { ProductVariant } from "@/types";
import type { ProductVariantDB } from "@/lib/supabase/types";
import { IS_PRELAUNCH } from "@/lib/constants";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Corti-Glow — Науката зад Красотата Без Стрес",
  description:
    "Corti-Glow е вечерният моктейл с KSM-66® Ashwagandha, магнезий и инозитол, който понижава кортизола и връща сиянието на кожата. Без захар. Горска ягода & лайм.",
  openGraph: {
    title: "LURA | Науката зад Красотата Без Стрес",
    description:
      "Corti-Glow — вечерният моктейл, който понижава кортизола и връща сиянието на кожата. 7 активни съставки, без захар.",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
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
  // Fetch product variants from DB (with fallback to hardcoded in PremiumBundles)
  // Skip DB call in prelaunch mode — bundles use hardcoded data anyway
  let variants: ProductVariant[] | undefined;
  if (!IS_PRELAUNCH) {
    try {
      const { product } = await getProduct("corti-glow");
      if (product?.variants) {
        variants = mapVariants(product.variants as unknown as ProductVariantDB[]);
      }
    } catch {
      // Silently fall back to hardcoded data in PremiumBundles
    }
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: homepageFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PremiumHero />
      <SocialProofBanner />
      <PremiumFeatures />
      <GlowGuideCTA />
      <RealResults />
      <PremiumIngredients />
      <PremiumHowTo />
      <GlowGuideCTAMini />
      <PremiumBundles variants={variants} />
      <BentoReviews />
      <PremiumFAQ />
      <PremiumCTA />
    </>
  );
}
