"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Star, Shield, Truck } from "lucide-react";
import { IS_PRELAUNCH } from "@/lib/constants";
import { useWaitlist } from "@/components/providers/WaitlistProvider";
import { cn } from "@/lib/utils";

const tickerItems = [
  "4.9/5 от 500+ отзива",
  "92% виждат резултат за 14 дни",
  "-27% кортизол (клинично доказано)",
  "7 активни съставки в клинични дози",
  "Без захар и ГМО",
  "Горска Ягода & Лайм",
  "Произведено в ЕС",
  "14-дневна гаранция за връщане",
];

const ease = [0.22, 1, 0.36, 1] as const;

export function PremiumHero() {
  const { openWaitlist } = useWaitlist();
  const prefersReducedMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative flex flex-col overflow-hidden">
      {/* ─── Split Hero ─── */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.15fr] md:min-h-[calc(100svh-80px)]">
        {/* ── Left: Text Panel ── */}
        <div className="relative flex flex-col justify-center order-2 md:order-1 px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 py-6 md:py-14 lg:py-20 bg-[#FAF8F5]">
          {/* Subtle warm gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(ellipse at 30% 50%, rgba(255,193,204,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(178,216,198,0.05) 0%, transparent 50%)",
            }}
          />

          <div className="relative z-10 max-w-lg mx-auto lg:mx-0">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={revealed ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease }}
              className="flex items-center gap-3 mb-4 md:mb-6 lg:mb-8"
            >
              <div className="h-px w-8 bg-[#B2D8C6]" />
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-[#2D4A3E]/40 font-semibold">
                Вечерен Ритуал за Красота
              </span>
            </motion.div>

            {/* Headline */}
            <h1 className="font-serif mb-3 md:mb-5 lg:mb-7">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={revealed ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.9, delay: 0.1, ease }}
                className="block text-[clamp(1.4rem,3vw,2rem)] font-light text-[#2D4A3E]/60 leading-snug tracking-[-0.01em]"
              >
                Науката зад
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={revealed ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.9, delay: 0.2, ease }}
                className="block text-[clamp(3rem,7vw,5.5rem)] italic font-medium text-[#2D4A3E] leading-[0.9] tracking-[-0.03em] my-1 lg:my-2"
              >
                Красотата
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={revealed ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.9, delay: 0.3, ease }}
                className="block text-[clamp(1.4rem,3vw,2rem)] font-semibold text-[#2D4A3E] leading-snug tracking-[-0.01em]"
              >
                Без Стрес<span className="text-[#B2D8C6]">.</span>
              </motion.span>
            </h1>

            {/* Body */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={revealed ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.45, ease }}
              className="text-[15px] sm:text-base text-stone-500 font-light leading-relaxed mb-4 md:mb-7 lg:mb-9 max-w-sm"
            >
              {IS_PRELAUNCH ? (
                "Първият моктейл в България, който намалява кортизола и връща блясъка на кожата ти. Запиши се и получи безплатен PDF гайд."
              ) : (
                <>
                  7 клинично доказани съставки в един вечерен моктейл.
                  За{" "}
                  <span className="text-[#2D4A3E] font-medium">
                    по-нисък кортизол
                  </span>
                  , по-дълбок сън и сутрини без подуване.
                </>
              )}
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={revealed ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.55, ease }}
              className="flex flex-col sm:flex-row items-start gap-3 mb-5 md:mb-8 lg:mb-10"
            >
              {IS_PRELAUNCH ? (
                <button
                  onClick={openWaitlist}
                  className="group inline-flex items-center gap-3 px-7 py-3.5 bg-[#2D4A3E] text-white rounded-full text-[15px] font-medium hover:bg-[#1a2f27] transition-all duration-300 shadow-[0_4px_20px_rgba(45,74,62,0.2)] hover:shadow-[0_8px_30px_rgba(45,74,62,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  Запиши се Първа
                  <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <Link
                  href="/produkt/corti-glow"
                  className="group inline-flex items-center gap-3 px-7 py-3.5 bg-[#2D4A3E] text-white rounded-full text-[15px] font-medium hover:bg-[#1a2f27] transition-all duration-300 shadow-[0_4px_20px_rgba(45,74,62,0.2)] hover:shadow-[0_8px_30px_rgba(45,74,62,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  Поръчай Corti-Glow
                  <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}

              <Link
                href="/nauka"
                className="group inline-flex items-center gap-2 px-4 py-3.5 text-[#2D4A3E]/50 text-sm font-medium hover:text-[#2D4A3E] transition-colors"
              >
                Виж науката
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={revealed ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.75 }}
              className="flex flex-wrap items-center gap-x-5 gap-y-2"
            >
              {[
                { icon: Star, label: "4.9/5 (500+ отзива)", fill: true },
                { icon: Shield, label: "14-дневна гаранция" },
                { icon: Truck, label: "Безплатна доставка" },
              ].map((item) => (
                <span
                  key={item.label}
                  className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-stone-400 tracking-wide"
                >
                  <item.icon
                    className={cn(
                      "w-3.5 h-3.5",
                      item.fill
                        ? "fill-[#F4E3B2] text-[#F4E3B2]"
                        : "text-[#B2D8C6]"
                    )}
                  />
                  {item.label}
                </span>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ── Right: Lifestyle Photo ── */}
        <div className="relative order-1 md:order-2 min-h-[38vh] md:min-h-0">
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={revealed ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1.4, ease }}
            className="absolute inset-0"
          >
            <Image
              src="/images/lifestyle-sofa-mocktail.webp"
              alt="Жена се наслаждава на вечерния си Corti-Glow моктейл на дивана"
              fill
              sizes="(max-width: 768px) 100vw, 55vw"
              priority
              className="object-cover object-[center_20%]"
            />

            {/* Left edge gradient — blend into text panel on desktop */}
            <div
              className="absolute inset-y-0 left-0 w-32 hidden md:block"
              style={{
                background:
                  "linear-gradient(to right, #FAF8F5 0%, rgba(250,248,245,0.4) 40%, transparent 100%)",
              }}
            />

            {/* Bottom gradient — blend on mobile */}
            <div
              className="absolute bottom-0 left-0 right-0 h-24 md:hidden"
              style={{
                background:
                  "linear-gradient(to top, #FAF8F5 0%, transparent 100%)",
              }}
            />
          </motion.div>

          {/* Floating product badge — overlapping the photo */}
          {!IS_PRELAUNCH && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={revealed ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.9, ease }}
              className="absolute bottom-6 left-6 md:bottom-8 md:left-auto md:right-8 z-10"
            >
              <div className="bg-white/90 backdrop-blur-lg rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/60">
                <div className="flex items-center gap-3">
                  <Image
                    src="/images/product-hero-box.webp"
                    alt="Corti-Glow"
                    width={56}
                    height={37}
                    className="rounded-lg"
                  />
                  <div>
                    <p className="text-xs font-semibold text-[#2D4A3E] leading-tight">
                      Corti-Glow
                    </p>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      7 съставки · 30 саше
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-2.5 h-2.5 fill-[#F4E3B2] text-[#F4E3B2]"
                        />
                      ))}
                      <span className="text-[9px] text-stone-400 ml-0.5">
                        4.9
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ─── Ticker ─── */}
      <div className="relative z-10 border-t border-stone-200/50 bg-[#FAF8F5]">
        <div className="overflow-hidden py-3">
          <div
            className="flex items-center gap-10 whitespace-nowrap hero-ticker"
            style={{
              animation: prefersReducedMotion
                ? "none"
                : "hero-ticker 40s linear infinite",
              width: "max-content",
            }}
          >
            {[...tickerItems, ...tickerItems, ...tickerItems].map(
              (item, i) => (
                <span
                  key={i}
                  className="flex items-center gap-2.5 text-[11px] font-medium text-[#2D4A3E]/25 uppercase tracking-[0.15em]"
                >
                  <span className="w-1 h-1 rounded-full bg-[#B2D8C6]/50" />
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
