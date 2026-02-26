"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { IS_PRELAUNCH } from "@/lib/constants";
import { useWaitlist } from "@/components/providers/WaitlistProvider";

export function PremiumHero() {
  const { openWaitlist } = useWaitlist();
  const prefersReducedMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#FAFAF8]">
      {/* Static background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-0 right-0 w-[60%] h-[70%] bg-gradient-to-bl from-[#B2D8C6]/20 via-[#FFC1CC]/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-gradient-to-tr from-[#F4E3B2]/15 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full pt-20 pb-12 md:pt-28 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-center">
          {/* Text — left 7 columns (Compact & Impactful) */}
          <div className="lg:col-span-7 space-y-5 md:space-y-6 relative z-20">
            {/* Eyebrow */}
            <p
              className={`text-xs sm:text-sm uppercase tracking-[0.2em] text-[#2D4A3E]/70 font-semibold transition-all duration-700 ${revealed
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
                }`}
            >
              Клинично Доказано · KSM-66<sup>®</sup>
            </p>

            {/* Headline - Tighter leading */}
            <h1 className="font-serif leading-[0.9] tracking-[-0.02em]">
              <span
                className={`block text-5xl sm:text-7xl lg:text-8xl xl:text-[7.5rem] font-light text-[#2D4A3E] transition-all duration-700 delay-100 ${revealed
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
                  }`}
              >
                Науката зад
              </span>
              <span
                className={`block text-5xl sm:text-7xl lg:text-8xl xl:text-[7.5rem] font-medium italic text-[#2D4A3E] pl-2 md:pl-0 transition-all duration-700 delay-200 ${revealed
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
                  }`}
              >
                Красотата
              </span>
              <span
                className={`block text-5xl sm:text-7xl lg:text-8xl xl:text-[7.5rem] font-semibold text-[#2D4A3E] transition-all duration-700 delay-300 ${revealed
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
                  }`}
              >
                Без Стрес.
              </span>
            </h1>

            {/* Mobile product image — between headline and body */}
            <div
              className={`lg:hidden flex justify-center -mx-2 transition-all duration-1000 delay-200 ${revealed
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
                }`}
            >
              <div className={prefersReducedMotion ? "" : "animate-gentle-float"}>
                <Image
                  src="/images/product-hero-box.webp"
                  alt="Corti-Glow – кутия с 30 саше, моктейл за понижаване на кортизола"
                  width={500}
                  height={333}
                  sizes="90vw"
                  className="drop-shadow-[0_30px_60px_rgba(45,74,62,0.2)]"
                />
              </div>
            </div>

            {/* Accent line - Shorter & Thicker */}
            <div
              className={`h-[3px] bg-[#B2D8C6] rounded-full transition-all duration-1000 delay-500 ease-out ${revealed ? "w-16 md:w-24 opacity-100" : "w-0 opacity-0"
                }`}
              aria-hidden="true"
            />

            {/* Body text - More concise width */}
            <p
              className={`text-base sm:text-lg text-stone-600 font-light leading-relaxed max-w-md transition-all duration-700 delay-500 ${revealed
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
                }`}
            >
              {IS_PRELAUNCH ? (
                "Първият моктейл в България, който намалява кортизола и връща блясъка на кожата ти. Запиши се и получи безплатен PDF гайд."
              ) : (
                <>
                  Когато кортизолът намалее, <span className="font-medium text-[#2D4A3E]">кожата сияе</span>.
                  Corti-Glow е вечерният ритуал, на който 500+ жени вече се доверяват.
                </>
              )}
            </p>

            {/* Single CTA - High Visibility */}
            <div
              className={`pt-2 transition-all duration-700 delay-[600ms] ${revealed
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
                }`}
            >
              {IS_PRELAUNCH ? (
                <button
                  onClick={openWaitlist}
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-[#2D4A3E] text-white rounded-full text-lg font-medium hover:bg-[#1a2f27] transition-all duration-300 shadow-xl shadow-[#2D4A3E]/20 hover:scale-[1.02]"
                >
                  Запиши се Първа
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <Link
                  href="/produkt/corti-glow"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-[#2D4A3E] text-white rounded-full text-lg font-medium hover:bg-[#1a2f27] transition-all duration-300 shadow-xl shadow-[#2D4A3E]/20 hover:scale-[1.02]"
                >
                  Купи Сега
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}

              {/* Trust Badge nearby */}
              <div className="mt-6 flex items-center gap-4 text-xs sm:text-sm text-stone-500 font-medium tracking-wide">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#B2D8C6]"></span> 30-дневен тест</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#FFC1CC]"></span> Безплатна доставка</span>
              </div>
            </div>
          </div>

          {/* Product image — right 5 columns (Desktop only, mobile shown inline above) */}
          <div
            className={`hidden lg:flex lg:col-span-5 relative justify-end items-center mr-[-5%] transition-all duration-1000 delay-300 ${revealed
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
              }`}
          >
            {/* Soft glow behind product */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              aria-hidden="true"
            >
              <div className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-gradient-to-br from-[#B2D8C6]/30 via-[#FFC1CC]/20 to-transparent blur-[60px] md:blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-[400px] lg:max-w-none">
              <Image
                src="/images/product-hero-box.webp"
                alt="Corti-Glow – кутия с 30 саше, моктейл за понижаване на кортизола"
                width={800}
                height={533}
                sizes="(max-width: 768px) 100vw, 800px"
                priority
                className={`drop-shadow-[0_30px_60px_rgba(45,74,62,0.2)] lg:scale-[1.15] lg:-translate-x-10 ${prefersReducedMotion ? "" : "animate-gentle-float"}`}
              />

              {/* Floating Badge (Integrated) */}
              <div className="absolute -bottom-6 -left-6 md:bottom-10 md:-left-10 bg-white/90 backdrop-blur-md border border-[#2D4A3E]/10 p-4 rounded-xl shadow-lg animate-fade-in-up delay-700 hidden md:block">
                <p className="text-3xl font-bold text-[#2D4A3E] font-display leading-none">3</p>
                <p className="text-[10px] uppercase tracking-widest text-[#2D4A3E]/60 font-semibold mt-1">Дни до ефект</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
