import type { Metadata } from "next";
import { ChevronDown, CheckCircle, Shield, Truck, Clock, Star } from "lucide-react";
import { notFound } from "next/navigation";
import { getProduct, listProducts } from "@/lib/actions/products";
import { faqs } from "@/data/faqs";
import { ProductBundles } from "../ProductBundles";
import { ProductGallery } from "../ProductGallery";
import { TrustBar, GuaranteeBadge, PaymentMethods } from "../TrustBar";
import { ProductReviews } from "../ProductReviews";
import { WhyCortiGlow } from "../WhyCortiGlow";
import { HowToUseVisual } from "../HowToUseVisual";
import type { ProductVariant } from "@/types";
import type { ProductVariantDB, ProductIngredientDB, ProductFeatureDB, ProductHowToUseDB } from "@/lib/supabase/types";
import { BreadcrumbJsonLd } from "@/components/ui/BreadcrumbJsonLd";

export const revalidate = 3600; // 1 hour ISR

// Hardcoded gallery for corti-glow (until DB images are richer)
const CORTI_GLOW_GALLERY = [
  "/images/product-hero-box.webp",
  "/images/product-sachet-marble.webp",
  "/images/product-sachet-open.webp",
  "/images/product-pouring.webp",
  "/images/product-glass-ready.webp",
  "/images/product-hand-sachet.webp",
  "/images/product-splash-pour.webp",
  "/images/lifestyle-evening-mocktail.webp",
  "/images/lifestyle-sofa-mocktail.webp",
  "/images/lifestyle-nightstand-ritual.webp",
  "/images/mocktail-ashwagandha-flatlay.webp",
];

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { products } = await listProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await getProduct(slug);

  if (!product) {
    return { title: "Продукт не е намерен" };
  }

  const title = product.meta_title || `${product.name} | LURA`;
  const description =
    product.meta_description ||
    product.tagline ||
    `${product.name} - премиум добавка от LURA`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: `https://luralab.eu${product.image}`, width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `https://luralab.eu/produkt/${slug}`,
    },
  };
}

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

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const { product, error } = await getProduct(slug);

  if (!product || error) {
    if (error) console.error(error);
    notFound();
  }

  const variants = mapVariants(product.variants as unknown as ProductVariantDB[]);
  const ingredients = product.ingredients as unknown as ProductIngredientDB[];
  const features = product.features as unknown as ProductFeatureDB[];
  const howToUse = product.how_to_use as unknown as ProductHowToUseDB[];
  const outOfStock = product.track_inventory && product.stock <= 0;

  // Use curated gallery for corti-glow, DB images for other products
  const images =
    slug === "corti-glow" && !(product.images?.length > CORTI_GLOW_GALLERY.length)
      ? CORTI_GLOW_GALLERY
      : product.images?.length > 0
        ? product.images
        : [product.image];

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.tagline,
    image: `https://luralab.eu${product.image}`,
    brand: { "@type": "Brand", name: "LURA" },
    sku: product.sku || product.slug,
    category: "Health Supplements",
    offers: variants.map((v) => ({
      "@type": "Offer",
      price: v.price,
      priceCurrency: "EUR",
      availability: outOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: `https://luralab.eu/produkt/${slug}`,
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "BG",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "BG",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "d" },
          transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "d" },
        },
      },
    })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "487",
      bestRating: "5",
      worstRating: "1",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
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
      <BreadcrumbJsonLd
        items={[
          { name: "Начало", url: "https://luralab.eu" },
          { name: "Магазин", url: "https://luralab.eu/magazin" },
          { name: product.name, url: `https://luralab.eu/produkt/${slug}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Trust Bar */}
      <TrustBar />

      {/* Hero Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Product Gallery — sticky on desktop */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ProductGallery images={images} productName={product.name} />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Badge */}
              {product.badge && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFC1CC]/20 text-[#2D4A3E] text-xs font-semibold uppercase tracking-wide">
                  <Star className="w-3 h-3 fill-current" />
                  {product.badge}
                </span>
              )}

              {/* Title */}
              <div>
                <p className="text-sm text-[#B2D8C6] font-medium uppercase tracking-wider mb-2">
                  LURA Wellness
                </p>
                <h1 className="text-3xl md:text-5xl font-semibold text-[#2D4A3E] tracking-tight">
                  {product.name}
                </h1>
                <p className="text-stone-500 mt-2 text-lg">{product.tagline}</p>
              </div>

              {/* Rating & Social Proof */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex text-[#F4E3B2]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-[#2D4A3E]">4.9</span>
                </div>
                <span className="text-sm text-stone-500">
                  500+ доволни клиенти
                </span>
                <span className="text-sm text-stone-500 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-[#B2D8C6]" />
                  92% виждат резултат
                </span>
              </div>

              {/* Trust badges inline */}
              <div className="flex flex-wrap gap-3">
                {["Без Захар", "Веган", "Без ГМО", "Без глутен"].map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 text-xs font-medium text-stone-600"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-[#B2D8C6]" />
                    {badge}
                  </span>
                ))}
              </div>

              {/* Bundle Selection */}
              <ProductBundles
                variants={variants}
                productSlug={slug}
                productName={product.name}
                outOfStock={outOfStock}
              />

              {/* Quick Benefits */}
              <div className="grid grid-cols-3 gap-4 py-4 border-y border-stone-100">
                <div className="text-center">
                  <Shield className="w-6 h-6 text-[#B2D8C6] mx-auto mb-1" />
                  <p className="text-xs text-stone-600">14-дневна гаранция</p>
                </div>
                <div className="text-center">
                  <Truck className="w-6 h-6 text-[#B2D8C6] mx-auto mb-1" />
                  <p className="text-xs text-stone-600">Бърза доставка</p>
                </div>
                <div className="text-center">
                  <Clock className="w-6 h-6 text-[#B2D8C6] mx-auto mb-1" />
                  <p className="text-xs text-stone-600">Резултат за 14 дни</p>
                </div>
              </div>

              {/* Payment Methods */}
              <PaymentMethods />

              {/* Product Details Accordion */}
              <div className="space-y-3 pt-4">
                <details className="group" open>
                  <summary className="flex justify-between items-center cursor-pointer py-3 border-b border-stone-100">
                    <span className="font-medium text-[#2D4A3E]">
                      Съставки ({ingredients.length} активни)
                    </span>
                    <ChevronDown className="w-5 h-5 text-stone-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="py-4 space-y-3">
                    {ingredients.map((ing) => (
                      <div key={ing.name} className="flex items-start gap-3 text-sm">
                        <span
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{
                            backgroundColor: `${ing.color}20`,
                            color: ing.color,
                          }}
                        >
                          {ing.symbol}
                        </span>
                        <div>
                          <p className="font-medium text-[#2D4A3E]">
                            {ing.name}{" "}
                            <span className="text-[#B2D8C6] font-semibold">
                              {ing.dosage}
                            </span>
                          </p>
                          <p className="text-stone-500 text-xs">{ing.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>

                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer py-3 border-b border-stone-100">
                    <span className="font-medium text-[#2D4A3E]">Доставка & Връщане</span>
                    <ChevronDown className="w-5 h-5 text-stone-400 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="py-4 text-sm text-stone-600 space-y-2">
                    <p>✓ Безплатна доставка за поръчки над 80 €</p>
                    <p>✓ Доставка с Еконт за 1-2 работни дни</p>
                    <p>✓ Плащане с карта или при доставка</p>
                    <p>✓ 14-дневна гаранция за връщане без въпроси</p>
                  </div>
                </details>
              </div>

              {/* Guarantee Badge */}
              <GuaranteeBadge />
            </div>
          </div>
        </div>
      </section>

      {/* Why Corti-Glow Section */}
      <WhyCortiGlow features={features} />

      {/* How To Use Section */}
      <HowToUseVisual steps={howToUse} />

      {/* Reviews Section */}
      <ProductReviews />

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-semibold mb-8 text-center text-[#2D4A3E]">
            Често задавани въпроси
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                name="faq"
                className="group p-5 bg-stone-50 rounded-xl cursor-pointer hover:bg-stone-100 transition"
              >
                <summary className="flex justify-between items-center font-medium text-[#2D4A3E]">
                  {faq.question}
                  <ChevronDown className="w-5 h-5 text-[#B2D8C6] group-open:rotate-180 transition-transform" />
                </summary>
                <p className="text-stone-600 text-sm mt-3 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
