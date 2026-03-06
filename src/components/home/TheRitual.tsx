"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function TheRitual() {
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const m1Y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const m2Y = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  return (
    <section ref={containerRef} className="bg-[#2D4A3E] py-32 md:py-48 text-[#F7F4F0] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">

        {/* Header content */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-16 mb-24 md:mb-32">
          <div className="max-w-3xl">
            <h2 className="text-[clamp(3.5rem,7vw,6rem)] font-serif font-light leading-[0.9] tracking-[-0.03em] mb-8">
              Синергично <br />
              <span className="italic">действие.</span>
            </h2>
            <p className="text-xl md:text-2xl font-light text-[#F7F4F0]/80 leading-relaxed max-w-xl">
              Повечето формули за сън работят в едно измерение. Нашата действа в две.
            </p>
          </div>

          <div className="border-l border-[#B2D8C6]/30 pl-8 pb-2">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#B2D8C6] block mb-2">
              Резултат
            </span>
            <span className="text-3xl font-serif text-[#F7F4F0] block">
              Заспиваш по-бързо.
            </span>
          </div>
        </div>

        {/* 2-Part Dimension Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative">

          {/* Dimension 1: Cortisol */}
          <motion.div style={{ y: m1Y }} className="flex flex-col gap-8 bg-[#1E332B] p-10 md:p-14 rounded-[2.5rem] border border-white/5 shadow-2xl">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#B2D8C6]/60 border border-[#B2D8C6]/20 px-4 py-2 rounded-full">
                Измерение 01
              </span>
              <span className="text-5xl font-serif font-light text-[#F7F4F0]/20">01</span>
            </div>

            <div className="flex-1 mt-12 mb-12 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[#B2D8C6] blur-[120px] rounded-full opacity-10" />
              <img
                src="/images/ingredients/ashwa.png"
                alt="Nervous System"
                className="w-[60%] h-auto mix-blend-screen opacity-80"
              />
            </div>

            <div>
              <h3 className="text-3xl font-serif mb-4">Нервна система</h3>
              <p className="text-[#F7F4F0]/60 font-light leading-relaxed mb-6">
                Мио-инозитол и Ашваганда (5% витанолиди) работят заедно, за да изключат режима "борба или бягство".
                Серумният кортизол спада с 28%, позволявайки на ума да притихне.
              </p>
              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[#B2D8C6]">
                <span className="w-8 h-[1px] bg-[#B2D8C6]/40" />
                Успокоява ума
              </div>
            </div>
          </motion.div>

          {/* Dimension 2: Gut Microbiome */}
          <motion.div style={{ y: m2Y }} className="flex flex-col gap-8 bg-[#EAE7E1] text-[#2D4A3E] p-10 md:p-14 rounded-[2.5rem] mt-0 md:mt-24 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 blur-[80px] rounded-full pointer-events-none" />
            <div className="flex justify-between items-start relative z-10">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#2D4A3E]/50 border border-[#2D4A3E]/20 px-4 py-2 rounded-full">
                Измерение 02
              </span>
              <span className="text-5xl font-serif font-light text-[#2D4A3E]/10">02</span>
            </div>

            <div className="flex-1 mt-12 mb-12 relative flex items-center justify-center z-10">
              <img
                src="/images/ingredients/inulin.png"
                alt="Gut Microbiome"
                className="w-[60%] h-auto mix-blend-multiply opacity-80 grayscale"
              />
            </div>

            <div className="relative z-10">
              <h3 className="text-3xl font-serif mb-4">Чревен микробиом</h3>
              <p className="text-[#2D4A3E]/70 font-light leading-relaxed mb-6">
                Докато спиш, 2500mg чист пребиотик (инулин от цикория) подхранва добрите бактерии.
                Връзката черво-мозък се възстановява, което дълготрайно предотвратява сутрешното подуване.
              </p>
              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[#2D4A3E]">
                <span className="w-8 h-[1px] bg-[#2D4A3E]/30" />
                Възстановява флората
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
