"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

const testers = [
  {
    quote:
      "Не вярвах, че ще заспя толкова бързо от първата вечер. Буквално 20 минути.",
    author: "М., 31",
    image: "/images/texture-sage-landscape.webp",
    fallbackGradient: "from-[#E8F0E9] to-[#D4E8D0]",
  },
  {
    quote:
      "Подуването ми беше такъв проблем, че мислех, че е от глутена. Оказа се — стрес.",
    author: "Д., 28",
    image: "/images/lifestyle-nightstand.webp",
    fallbackGradient: "from-[#F5EFD8] to-[#EDE5C8]",
  },
  {
    quote:
      "Харесва ми, че не е поредната магическа добавка. Виждам какво пия и в каква доза.",
    author: "Е., 34",
    image: "/images/texture-warm-botanical.webp",
    fallbackGradient: "from-[#F5E0E4] to-[#EECFD6]",
  },
];

export function TesterWall() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Staggered parallax — different Y offsets per card
  const yValues = [
    useTransform(scrollYProgress, [0, 1], [60, -60]),
    useTransform(scrollYProgress, [0, 1], [30, -30]),
    useTransform(scrollYProgress, [0, 1], [80, -40]),
  ];

  return (
    <section ref={containerRef} className="py-32 md:py-48 bg-transparent">
      <div className="max-w-6xl mx-auto px-6">
        {/* Headline */}
        <div className="text-center mb-20 md:mb-28">
          <p className="text-xs uppercase tracking-[0.3em] text-[#2D4A3E]/30 font-semibold mb-6">
            Първи впечатления
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-light italic text-[#2D4A3E] leading-[0.9] tracking-[-0.02em]">
            Какво казват
            <br />
            <span className="text-[#2D4A3E]/40">първите ни тестъри.</span>
          </h2>
        </div>

        {/* Tester cards with real image backgrounds */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testers.map((tester, i) => (
            <motion.div
              key={i}
              style={{ y: yValues[i] }}
              className={`rounded-[2rem] overflow-hidden relative min-h-[380px] md:min-h-[440px] flex flex-col justify-between bg-gradient-to-br ${tester.fallbackGradient}`}
            >
              {/* Background image */}
              <Image
                src={tester.image}
                alt=""
                fill
                className="object-cover opacity-40"
                sizes="(max-width: 768px) 100vw, 33vw"
              />

              {/* Dark overlay — gradient from bottom for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2D4A3E]/70 via-[#2D4A3E]/30 to-transparent" />

              {/* Content */}
              <div className="relative z-10 p-8 md:p-10 flex flex-col justify-between h-full">
                <div>
                  <div className="w-8 h-px bg-white/30 mb-8" />
                  <p className="text-xl md:text-2xl font-serif italic text-white leading-[1.35]">
                    &ldquo;{tester.quote}&rdquo;
                  </p>
                </div>
                <p className="text-sm text-white/60 font-medium mt-8">
                  — {tester.author}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
