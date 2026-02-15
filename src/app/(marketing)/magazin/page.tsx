import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";
import { listProducts } from "@/lib/actions/products";
import { formatPrice } from "@/lib/utils";
import type { ProductVariantDB } from "@/lib/supabase/types";
import { BreadcrumbJsonLd } from "@/components/ui/BreadcrumbJsonLd";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Магазин - Премиум Добавки | LURA",
  description:
    "Разгледай колекцията от научно доказани добавки на LURA. Формули за хормонален баланс, анти-стрес и цялостно благосъстояние.",
  openGraph: {
    title: "Магазин | LURA",
    description:
      "Премиум добавки за хормонален баланс и анти-стрес. Безплатна доставка над 80 €.",
  },
  alternates: {
    canonical: "https://luralab.eu/magazin",
  },
};

function getMinPrice(variants: unknown): number | null {
  if (!Array.isArray(variants) || variants.length === 0) return null;
  const prices = (variants as unknown as ProductVariantDB[]).map((v) => v.price);
  return Math.min(...prices);
}

export default async function ShopPage() {
  const { products } = await listProducts();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Начало", url: "https://luralab.eu" },
          { name: "Магазин", url: "https://luralab.eu/magazin" },
        ]}
      />

      <section className="py-16 md:py-20 bg-[#F5F2EF]">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-sm text-[#B2D8C6] font-medium uppercase tracking-wider mb-3">
              LURA Wellness
            </p>
            <h1 className="text-3xl md:text-5xl font-semibold text-[#2D4A3E] tracking-tight">
              Магазин
            </h1>
            <p className="text-stone-500 mt-3 text-lg max-w-xl mx-auto">
              Научно доказани формули за хормонален баланс и цялостно благосъстояние.
            </p>
          </div>

          {/* Product Grid */}
          {products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500 text-lg">
                Скоро тук ще се появят нашите продукти.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => {
                const minPrice = getMinPrice(product.variants);
                const variants = Array.isArray(product.variants)
                  ? (product.variants as unknown as ProductVariantDB[])
                  : [];

                return (
                  <Link
                    key={product.id}
                    href={`/produkt/${product.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative aspect-square bg-stone-50 overflow-hidden">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-stone-300" />
                        </div>
                      )}

                      {/* Badge overlay */}
                      {product.badge && (
                        <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#FFC1CC]/90 text-[#2D4A3E] text-xs font-semibold uppercase tracking-wide backdrop-blur-sm">
                          {product.badge}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <h2 className="text-lg font-semibold text-[#2D4A3E] group-hover:text-[#B2D8C6] transition-colors">
                        {product.name}
                      </h2>
                      {product.tagline && (
                        <p className="text-sm text-stone-500 mt-1 line-clamp-2">
                          {product.tagline}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <p className="text-lg font-bold text-[#2D4A3E]">
                            {minPrice
                              ? `от ${formatPrice(minPrice)}`
                              : formatPrice(product.price)}
                          </p>
                          {variants.length > 1 && (
                            <p className="text-xs text-stone-400">
                              {variants.length} варианта
                            </p>
                          )}
                        </div>
                        <span className="flex items-center gap-1 text-sm font-medium text-[#2D4A3E] group-hover:text-[#B2D8C6] transition-colors">
                          Виж
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
