"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function GlowGuideCTAMini() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="py-8 sm:py-10">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/glow-guide"
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 py-5 px-6 rounded-2xl bg-[#F5F2EF] border border-stone-100 hover:border-stone-200 transition-all group"
          >
            <span className="flex items-center gap-2 text-sm text-stone-500">
              <Sparkles className="w-4 h-4 text-[#B2D8C6]" />
              Не знаеш кой пакет е за теб?
            </span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-[#2D4A3E] group-hover:gap-2.5 transition-all">
              Направи Glow Guide теста
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
