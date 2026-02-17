"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

export function GlowGuideCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#2D4A3E] via-[#2D4A3E] to-[#3a5f4f] p-8 sm:p-12 lg:p-16">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#B2D8C6]/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#FFC1CC]/15 rounded-full blur-[80px]" />

          {/* Floating image card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block"
          >
            <div className="relative w-52 h-52 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/20">
              <Image
                src="/images/glow-guide-cta.webp"
                alt="Glow Guide Test"
                fill
                sizes="208px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2D4A3E]/40 to-transparent" />
            </div>
          </motion.div>

          <div className="relative z-10 max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-[#B2D8C6] text-xs font-medium uppercase tracking-wider mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Безплатен Тест
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white leading-tight mb-4"
            >
              Какъв е Твоят
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B2D8C6] to-[#FFC1CC]">
                Stress-Beauty Score?
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-white/70 font-light mb-8 leading-relaxed"
            >
              6 въпроса за 2 минути. Разбери как стресът влияе на кожата, съня и
              фигурата ти и получи персонализирана AI препоръка.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link
                href="/glow-guide"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#2D4A3E] rounded-full text-base font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                Започни Безплатния Тест
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
