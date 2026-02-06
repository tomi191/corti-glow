"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Sparkles, Shield, Truck, Timer } from "lucide-react";
import { SHIPPING_THRESHOLD } from "@/lib/constants";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { AnimatedHeading } from "@/components/ui/AnimatedText";

export function PremiumCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-16 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#2D4A3E]">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-[#B2D8C6] to-[#FFC1CC] blur-[200px]"
        />

        {/* Decorative shapes */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-20 w-40 h-40 border border-white/10 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-20 w-60 h-60 border border-white/10 rounded-full"
        />
      </div>

      <div className="max-w-5xl mx-auto px-6 relative">
        {/* Main Content */}
        <div className="text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 text-[#B2D8C6] text-sm font-medium uppercase tracking-widest mb-8"
          >
            <Sparkles className="w-4 h-4" />
            Започни Сега
          </motion.span>

          <AnimatedHeading delay={0.2}>
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-semibold text-white tracking-tight mb-8">
              Готова ли си за
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B2D8C6] via-white to-[#FFC1CC]">
                Трансформацията?
              </span>
            </h2>
          </AnimatedHeading>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-white/70 font-light max-w-2xl mx-auto mb-12"
          >
            Присъедини се към 500+ жени, които вече преоткриха спокойствието
            и естествената красота с Corti-Glow.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <MagneticButton
              variant="secondary"
              size="lg"
              href="/produkt"
              className="bg-white text-[#2D4A3E] hover:bg-white/90"
            >
              Поръчай Сега
              <ArrowRight className="w-5 h-5" />
            </MagneticButton>
            <MagneticButton
              variant="ghost"
              size="lg"
              href="#bundles"
              className="text-white border border-white/30 hover:bg-white/10"
            >
              Виж Пакетите
            </MagneticButton>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap justify-center gap-8"
          >
            {[
              { icon: Shield, label: "14-дневна гаранция" },
              { icon: Truck, label: `Безплатна доставка над ${SHIPPING_THRESHOLD} €` },
              { icon: Timer, label: "Експресна доставка" },
            ].map((badge, index) => (
              <motion.div
                key={badge.label}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <badge.icon className="w-5 h-5 text-[#B2D8C6]" />
                </div>
                <span className="text-white/80 text-sm">{badge.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Floating Review with Lifestyle Image - Left */}
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="absolute top-1/4 -left-20 hidden xl:block"
        >
          <div className="relative w-64 h-80 rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src="/images/lifestyle-sofa-mocktail.webp"
              alt="Woman enjoying Corti-Glow"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2D4A3E] via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#F4E3B2] text-sm">★</span>
                ))}
              </div>
              <p className="text-white/90 text-sm">
                &ldquo;Моят вечерен ритуал за спокойствие&rdquo;
              </p>
              <p className="text-white/60 text-xs mt-1">— Мария, София</p>
            </div>
          </div>
        </motion.div>

        {/* Floating Review with Lifestyle Image - Right */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="absolute top-1/3 -right-20 hidden xl:block"
        >
          <div className="relative w-64 h-80 rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src="/images/lifestyle-morning-stretch.webp"
              alt="Morning wellness routine"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2D4A3E] via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#F4E3B2] text-sm">★</span>
                ))}
              </div>
              <p className="text-white/90 text-sm">
                &ldquo;Събуждам се с енергия всеки ден!&rdquo;
              </p>
              <p className="text-white/60 text-xs mt-1">— Ива, Варна</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
