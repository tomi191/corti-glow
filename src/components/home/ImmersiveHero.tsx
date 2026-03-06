"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ChevronRight, Sparkles } from "lucide-react";
import { IS_PRELAUNCH } from "@/lib/constants";
import { useWaitlist } from "@/components/providers/WaitlistProvider";

const concerns = [
  { label: "Стрес и кортизол", target: "concern-stress" },
  { label: "Подуване", target: "concern-bloating" },
  { label: "Лош сън", target: "concern-sleep" },
] as const;

export function ImmersiveHero() {
  const { openWaitlist } = useWaitlist();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacityText = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[100svh] flex flex-col justify-center overflow-hidden bg-[#1a2e25]"
    >
      {/* Background Media */}
      <motion.div
        style={{ y: mediaY, scale: mediaScale }}
        className="absolute inset-0 z-0 pointer-events-none origin-bottom h-[120%] -top-[10%]"
      >
        <video
          src="https://cdn.coverr.co/videos/coverr-pouring-water-in-a-glass-2522/1080p.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover object-center opacity-60 mix-blend-screen grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#15241d] via-[#1a2e25]/60 to-[#1a2e25]/20" />
      </motion.div>

      {/* Foreground Content */}
      <motion.div
        style={{ y: textY, opacity: opacityText }}
        className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 pt-28 pb-16 flex flex-col lg:flex-row items-center justify-between gap-16"
      >
        {/* Left: Text Content */}
        <div className="w-full lg:w-[55%] max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#B2D8C6]/30 mb-8 backdrop-blur-md bg-white/5">
            <Sparkles className="w-4 h-4 text-[#B2D8C6]" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#B2D8C6]">
              Кортизолов Детокс
            </span>
          </div>

          <h1 className="font-serif tracking-[-0.02em] mb-6 leading-[0.95]">
            <span className="block text-[clamp(4.5rem,8vw,8rem)] font-light italic text-[#F7F4F0] drop-shadow-lg pr-4">
              Познаваш го.
            </span>
            <span className="block text-[clamp(1.75rem,3vw,2.5rem)] font-light text-[#F7F4F0] mt-4 not-italic max-w-xl">
              Вечер мислите ти препускат.<br />Сутрин се събуждаш по-уморена.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[#F7F4F0]/70 font-light leading-relaxed max-w-md mb-10">
            7 активни съставки с клинични дозировки. 1 саше преди сън. За по-нисък кортизол и хормонален баланс.
          </p>

          <div className="flex flex-wrap gap-3 mb-12">
            {concerns.map((c) => (
              <button
                key={c.target}
                className="px-5 py-2 rounded-full border border-[#F7F4F0]/20 text-[11px] uppercase tracking-wider font-bold text-[#F7F4F0]/80 backdrop-blur-md hover:bg-[#F7F4F0] hover:text-[#1a2e25] transition-colors duration-500 hidden sm:block"
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <button
              onClick={() => IS_PRELAUNCH ? openWaitlist() : scrollToSection("checkout-section")}
              className="group inline-flex items-center justify-between gap-4 pl-8 pr-2 py-2 bg-[#F7F4F0] text-[#1a2e25] rounded-full text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#B2D8C6] transition-colors duration-500 shadow-xl"
            >
              <span>{IS_PRELAUNCH ? "Запиши се първа" : "Купи Сега"}</span>
              <div className="w-10 h-10 rounded-full bg-[#1a2e25]/10 flex items-center justify-center group-hover:bg-white/40 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>

            <button
              onClick={() => scrollToSection("science-section")}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold text-[#F7F4F0]/60 hover:text-[#F7F4F0] transition-colors duration-300"
            >
              Формулата
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Modern 3D/Abstract Animation */}
        <div className="w-full lg:w-[45%] flex justify-center lg:justify-end relative mt-12 lg:mt-0">

          {/* Abstract glowing aura */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] aspect-square bg-gradient-to-br from-[#B2D8C6]/20 to-transparent rounded-full blur-[80px] opacity-60 mix-blend-screen" />

          {/* Central floating mechanism */}
          <motion.div
            animate={{ y: ["-3%", "3%"] }}
            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
            className="relative w-full max-w-[420px] aspect-[4/5] z-10 rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.4)] backdrop-blur-md bg-black/10 flex items-center justify-center group"
          >
            {/* Spinning subtle gradient behind */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, ease: "linear", repeat: Infinity }}
              className="absolute inset-0 opacity-40 scale-[1.5]"
              style={{
                background: "conic-gradient(from 0deg, transparent, rgba(178,216,198,0.2), transparent, rgba(178,216,198,0.05), transparent)"
              }}
            />

            <img
              src="/images/home/sachet_pouring.png"
              alt="Corti-glow formula mockup"
              className="w-full h-full object-cover mix-blend-screen opacity-80 scale-105 group-hover:scale-110 transition-transform duration-[2s]"
            />

            {/* Foreground interactive-like dots / UI elements overlay to look modern */}
            <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#B2D8C6] animate-pulse" />
              <span className="text-[9px] uppercase tracking-widest text-[#F7F4F0] font-bold">Активна Фаза</span>
            </div>

            <div className="absolute bottom-8 left-8 bg-[#15241d]/80 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl w-[60%] border-l-2 border-l-[#B2D8C6]">
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#B2D8C6] mb-2">Клетъчна абсорбция</div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#B2D8C6]"
                  initial={{ width: "20%" }}
                  whileInView={{ width: "85%" }}
                  transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                  viewport={{ once: true }}
                />
              </div>
            </div>
          </motion.div>
        </div>

      </motion.div>
    </section>
  );
}
