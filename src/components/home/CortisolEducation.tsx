"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const concerns = [
  {
    id: "concern-sleep",
    number: "01",
    title: "Не заспиваш, защото мозъкът ти не спира.",
    body: "Висок кортизол вечер = мозък в режим fight or flight. Не е въпрос на дисциплина. Нервната ти система е на бойна готовност.",
  },
  {
    id: "concern-bloating",
    number: "02",
    title: "Стомахът ти издува без причина.",
    body: "Кортизолът забавя храносмилането и задържа вода. Не е от храната. Стресът буквално подува.",
  },
  {
    id: "concern-stress",
    number: "03",
    title: "Хормоните нямат ритъм.",
    body: "Когато кортизолът е хронично висок, той краде от прогестерона. Резултат: нередовен цикъл, ПМС, brain fog.",
  },
];

export function CortisolEducation() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.85, 1],
    [0, 1, 1, 0]
  );

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#2D4A3E] py-32 md:py-48 lg:py-56"
    >
      <motion.div style={{ opacity }} className="max-w-5xl mx-auto px-6">
        {/* ——— Section heading ——— */}
        <div className="mb-20 md:mb-28">
          <p className="text-xs uppercase tracking-[0.3em] text-white/30 font-semibold mb-6">
            Защо си уморена
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-light italic text-white leading-[0.9] tracking-[-0.03em] mb-8">
            Кортизолът краде
            <br />
            <span className="text-white/40">от всичко.</span>
          </h2>
          <p className="text-lg md:text-xl text-white/60 font-light leading-relaxed max-w-2xl">
            Кортизолът е хормонът на стреса. В малки дози е полезен. Но когато е
            висок постоянно — пречи на съня, задържа вода, разбалансира цикъла и
            крещи на тялото ти да натрупва мазнини.
          </p>
        </div>

        {/* ——— 3 concern blocks ——— */}
        <div className="flex flex-col">
          {concerns.map((concern) => (
            <div
              key={concern.id}
              id={concern.id}
              className="border-t border-white/10 py-12 md:py-16 scroll-mt-24"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
                {/* Number */}
                <div className="md:col-span-1">
                  <span className="text-sm font-serif text-white/20 font-light">
                    {concern.number}
                  </span>
                </div>

                {/* Title */}
                <div className="md:col-span-5">
                  <h3 className="text-2xl md:text-3xl font-serif italic text-white leading-[1.1]">
                    {concern.title}
                  </h3>
                </div>

                {/* Body */}
                <div className="md:col-span-6">
                  <p className="text-base md:text-lg text-white/50 font-light leading-relaxed">
                    {concern.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
