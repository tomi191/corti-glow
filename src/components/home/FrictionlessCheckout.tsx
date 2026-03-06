"use client";

import { useState, useCallback } from "react";
import { Plus, Check, ShieldCheck, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/stores/cart-store";
import { trackAddToCart } from "@/components/analytics/GoogleAnalytics";
import { formatPrice } from "@/lib/utils";
import { IS_PRELAUNCH } from "@/lib/constants";
import { useWaitlist } from "@/components/providers/WaitlistProvider";
import { productVariants } from "@/data/products";
import type { ProductVariant } from "@/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const BUNDLE_META: Record<string, { subtitle: string; description: string }> = {
  "starter-box": {
    subtitle: "Старт",
    description: "Перфектен за първи впечатления. Почувствай разликата в съня още първата седмица."
  },
  "glow-bundle": {
    subtitle: "Трансформация",
    description: "Нашият най-популярен избор. Достатъчно време за пълен баланс на кортизола."
  },
  "restart-bundle": {
    subtitle: "Пълен Рестарт",
    description: "Максимизирай резултатите. Дългосрочно решение за оптимално здраве и спокойствие."
  },
};

function BundleCard({ variant }: { variant: ProductVariant }) {
  const addItem = useCartStore((s) => s.addItem);
  const { openWaitlist } = useWaitlist();
  const [added, setAdded] = useState(false);
  const meta = BUNDLE_META[variant.id] || { subtitle: variant.name, description: "" };

  const handleAdd = useCallback(() => {
    if (added) return;
    if (IS_PRELAUNCH) {
      openWaitlist();
      return;
    }

    addItem({
      id: variant.id,
      productId: "corti-glow",
      variantId: variant.id,
      title: `Corti-Glow — ${variant.name}`,
      price: variant.price,
      image: variant.image || "/images/product-hero-box.webp",
    });
    trackAddToCart({
      id: variant.id,
      name: variant.name,
      price: variant.price,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, [added, variant, addItem, openWaitlist]);

  const perBox = variant.quantity > 1 ? (variant.price / variant.quantity).toFixed(2) : null;
  const isPopular = variant.isBestSeller;

  return (
    <div
      className={`relative w-[85vw] max-w-[360px] shrink-0 snap-center md:max-w-none md:w-auto rounded-[2rem] p-8 md:p-10 flex flex-col justify-between transition-all duration-700 bg-white group ${isPopular
        ? "border-2 border-[#2D4A3E] shadow-2xl shadow-[#2D4A3E]/10 z-10 md:-mt-8 md:mb-8"
        : "border border-[#2D4A3E]/10 hover:border-[#2D4A3E]/30"
        }`}
    >
      {/* Label Best Seller */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#2D4A3E] text-[#F7F4F0] px-6 py-2 rounded-full text-[10px] font-bold tracking-[0.2em] shadow-xl uppercase">
          Най-избиран
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h3 className="text-4xl font-serif text-[#2D4A3E] mb-2">{variant.quantity === 1 ? "1 Месец" : `${variant.quantity} Месеца`}</h3>
          <p className="text-xs uppercase tracking-widest text-[#2D4A3E]/40 font-bold">{meta.subtitle}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-light text-[#2D4A3E]">
            {perBox ? perBox : formatPrice(variant.price)}<span className="text-lg text-[#2D4A3E]/40 ml-1">€</span>
          </div>
          {perBox && <div className="text-[10px] uppercase font-bold tracking-widest text-[#2D4A3E]/40 mt-1">на кутия</div>}
        </div>
      </div>

      {/* Image Container */}
      <div className="w-full aspect-square bg-[#F7F4F0] rounded-3xl relative mb-10 overflow-hidden isolate">
        <Image
          src={variant.image || "/images/product-hero-box.webp"}
          alt={variant.name}
          fill
          className="object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out mix-blend-multiply opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#B2D8C6]/10 to-transparent pointer-events-none" />
      </div>

      {/* Footer / Add Action */}
      <div className="flex flex-col gap-4">
        {variant.compareAtPrice && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#2D4A3E]/40 line-through">Цена: {formatPrice(variant.compareAtPrice)}</span>
            <span className="text-[#2D4A3E] font-medium border-b border-[#2D4A3E]/20 pb-0.5">Общо: {formatPrice(variant.price)}</span>
          </div>
        )}

        <button
          onClick={handleAdd}
          className={`w-full py-5 rounded-full flex items-center justify-between px-8 transition-all duration-500 font-bold text-xs uppercase tracking-[0.2em] group-hover:shadow-lg ${added
            ? "bg-[#2D4A3E] text-[#F7F4F0]"
            : isPopular
              ? "bg-[#2D4A3E] text-[#F7F4F0] hover:bg-black"
              : "bg-[#EAE7E1] text-[#2D4A3E] hover:bg-[#2D4A3E] hover:text-[#F7F4F0]"
            }`}
        >
          <span>{IS_PRELAUNCH ? "Запиши се първа" : added ? "Добавено" : "Добави"}</span>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${added ? "bg-white/20" : isPopular ? "bg-white/20" : "bg-white/50 group-hover:bg-white/20"
            }`}>
            {added ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </div>
        </button>
      </div>

    </div>
  );
}

export function FrictionlessCheckout({
  variants,
}: {
  variants?: ProductVariant[];
}) {
  const displayVariants = variants?.length ? variants : productVariants;

  return (
    <section id="checkout-section" className="py-32 md:py-48 bg-[#F7F4F0] text-[#2D4A3E]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-12 mb-16 md:mb-32">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#2D4A3E]/40 mb-6 block border-l-2 border-[#2D4A3E]/20 pl-4">
              Инвестирай в себе си
            </span>
            <h2 className="text-[clamp(3.5rem,7vw,6rem)] font-serif font-light leading-[0.9] tracking-[-0.03em]">
              Започни своя <br />
              <span className="italic">ритуал.</span>
            </h2>
          </div>

          <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-full border border-[#2D4A3E]/10 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-[#B2D8C6]" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Безплатна доставка над 80 &euro;
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="relative -mx-6 px-6 md:mx-0 md:px-0">
          <Carousel
            opts={{
              align: "center",
              containScroll: "trimSnaps",
            }}
            className="w-full pb-40 md:pb-0"
          >
            <CarouselContent className="flex md:grid md:grid-cols-3 md:gap-4 lg:gap-8 ml-0">
              {displayVariants.map((variant) => (
                <CarouselItem key={variant.id} className="pl-4 md:pl-0 basis-[85%] sm:basis-[70%] md:basis-auto flex first:pl-0">
                  <BundleCard variant={variant} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-4 mt-6 md:hidden">
              <CarouselPrevious className="static translate-y-0 translate-x-0 w-12 h-12 bg-white text-[#2D4A3E] border border-[#2D4A3E]/10 shadow-sm hover:bg-[#F7F4F0]" />
              <CarouselNext className="static translate-y-0 translate-x-0 w-12 h-12 bg-[#2D4A3E] text-white hover:bg-[#1E332B] border-none shadow-lg" />
            </div>
          </Carousel>
        </div>

      </div>
    </section>
  );
}
