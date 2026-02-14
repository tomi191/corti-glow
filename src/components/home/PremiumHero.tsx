"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function PremiumHero() {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden pt-20 pb-16 md:pb-32"
    >
      <AnimatedBackground />

      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Content */}
          <motion.div style={{ opacity }} className="space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[#B2D8C6]/30 shadow-lg shadow-[#B2D8C6]/10">
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
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#B2D8C6] via-[#2D4A3E] to-[#FFC1CC]">
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
                (feature, i) => (
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
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <MagneticButton variant="primary" size="lg" href="/produkt">
                Открий Продукта
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
              className="flex items-center gap-4 pt-4"
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
          </motion.div>

          {/* Product Visual */}
          <motion.div
            style={{ y, scale }}
            className="relative flex items-center justify-center lg:justify-end"
          >
            {/* Glow effects */}
            <div className="absolute w-[500px] h-[500px] bg-[#FFC1CC]/40 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute w-[400px] h-[400px] bg-[#B2D8C6]/30 rounded-full blur-[80px] translate-x-20 translate-y-20" />

            {/* Floating elements */}
            <motion.div
              animate={prefersReducedMotion ? {} : { y: [-10, 10, -10], rotate: [0, 5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -left-10 w-24 h-24 rounded-2xl bg-white/80 backdrop-blur-sm shadow-xl p-4 border border-white/50 hidden md:flex flex-col"
            >
              <div className="text-3xl font-bold text-[#2D4A3E]">-27%</div>
              <div className="text-[10px] text-stone-500 uppercase tracking-wider">
                Кортизол
              </div>
            </motion.div>

            <motion.div
              animate={prefersReducedMotion ? {} : { y: [10, -10, 10], rotate: [0, -3, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute -bottom-5 -right-5 w-28 h-28 rounded-2xl bg-white/80 backdrop-blur-sm shadow-xl p-4 border border-white/50 hidden md:flex flex-col"
            >
              <div className="text-3xl font-bold text-[#2D4A3E]">3</div>
              <div className="text-[10px] text-stone-500 uppercase tracking-wider">
                Дни за Резултат
              </div>
            </motion.div>

            {/* Main product */}
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10"
            >
              <Image
                src="/images/product-hero-box.webp"
                alt="Corti-Glow Premium Mocktail"
                width={700}
                height={400}
                sizes="(max-width: 768px) 100vw, 700px"
                priority
                className="rounded-3xl drop-shadow-[0_40px_80px_rgba(45,74,62,0.3)] hover:scale-[1.02] transition-transform duration-700"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={prefersReducedMotion ? {} : { y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-[#2D4A3E]/20 flex justify-center pt-2"
        >
          <motion.div
            animate={prefersReducedMotion ? {} : { y: [0, 12, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-[#2D4A3E]"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
