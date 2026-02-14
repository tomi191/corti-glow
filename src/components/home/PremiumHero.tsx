"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function PremiumHero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20 pb-16 md:pb-32">
      <AnimatedBackground />

      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-4 md:space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-100 shadow-sm">
                <Sparkles className="w-4 h-4 text-[#2D4A3E]" />
                <span className="text-sm font-medium text-[#2D4A3E]">
                  Клинично Доказано | KSM-66® Ашваганда
                </span>
              </span>
            </motion.div>

            {/* Headline */}
            <div>
              <h1 className="text-3xl sm:text-5xl lg:text-7xl xl:text-8xl leading-[0.95] tracking-tight">
                <span className="text-[#2D4A3E] font-light">Науката за</span>
                <br />
                <span className="text-[#2D4A3E] font-bold">Красота</span>
                <br />
                <span className="font-bold text-[#2D4A3E]">
                  Без Кортизол.
                </span>
              </h1>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-lg sm:text-xl text-stone-600 font-light leading-relaxed max-w-lg"
            >
              Когато кортизолът спада, кожата, съня и фигурата се
              трансформират.{" "}
              <span className="font-semibold text-[#2D4A3E]">Corti-Glow</span>{" "}
              е вечерният ритуал с 5 научни съставки, който{" "}
              <span className="font-semibold text-[#2D4A3E]">500+ жени</span>{" "}
              вече използват.
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              {["Без Захар", "Клинично Доказано", "Веган", "30 Саше"].map(
                (feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center gap-1.5 text-sm text-stone-600"
                  >
                    <CheckCircle className="w-4 h-4 text-[#B2D8C6]" />
                    {feature}
                  </span>
                )
              )}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 pt-2 md:pt-4"
            >
              <MagneticButton variant="primary" size="lg" href="/produkt">
                Открий Продукта
                <ArrowRight className="w-5 h-5" />
              </MagneticButton>
              <MagneticButton variant="secondary" size="lg" href="/glow-guide">
                <Sparkles className="w-4 h-4" />
                Направи Glow Guide
              </MagneticButton>
            </motion.div>

            {/* Social Proof Mini */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex items-center gap-4 pt-2 md:pt-4"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFC1CC] to-[#B2D8C6] border-2 border-white"
                  />
                ))}
              </div>
              <p className="text-sm text-stone-500">
                <span className="font-semibold text-[#2D4A3E]">500+</span>{" "}
                жени вече сияят
              </p>
            </motion.div>
          </div>

          {/* Product Visual */}
          <div className="relative flex items-center justify-center lg:justify-end">
            {/* Main product */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src="/images/product-hero-box.webp"
                alt="Corti-Glow Premium Mocktail"
                width={700}
                height={400}
                sizes="(max-width: 768px) 100vw, 700px"
                priority
                className="rounded-3xl"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
