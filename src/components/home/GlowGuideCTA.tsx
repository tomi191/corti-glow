"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

export function GlowGuideCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="relative rounded-3xl overflow-hidden bg-[#2D4A3E] p-8 sm:p-12 lg:p-16">
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
              <span className="text-[#B2D8C6]">
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
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#2D4A3E] rounded-full text-base font-medium hover:bg-stone-50 transition-colors"
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
