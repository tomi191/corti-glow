"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const INGREDIENTS = [
  {
    id: "myo",
    title: "Мио-инозитол",
    dose: "2000 mg",
    subtitle: "Клиничната доза за баланс",
    desc: "Златният стандарт за женския хормонален баланс. Подобрява инсулиновата чувствителност и подкрепя нормалния цикъл. Повечето формули използват 500mg — ние използваме пълните 2000mg, доказани в проучванията.",
    media: "/images/ingredients/myo.png",
  },
  {
    id: "ashwa",
    title: "Екстракт от Ашваганда",
    dose: "300 mg",
    subtitle: "Адаптогенът, който понижава кортизола",
    desc: "Серумният кортизол спада с близо 28% в 8-седмични проучвания при тази конкретна доза и концентрация на витанолиди (≥5%). Укротява нервната система след напрегнат ден.",
    media: "/images/ingredients/ashwa.png",
  },
  {
    id: "magnesium",
    title: "Магнезиев Бисглицинат",
    dose: "670 mg",
    subtitle: "За дълбок и непробуден сън",
    desc: "Най-чистата и високоусвоима форма на магнезий. Няма разхлабващ ефект. Отпуска напрегнатата мускулатура и подготвя мозъка за дълбоките фази на съня.",
    media: "/images/ingredients/magnesium.png",
  },
  {
    id: "inulin",
    title: "Инулин от цикория",
    dose: "2500 mg",
    subtitle: "Край на сутрешното подуване",
    desc: "Силно ефективен пребиотик, който храни добрите бактерии в червата. Връзката черво-мозък е критична за нивата на стрес. Редуцира вечерното подуване на стомаха.",
    media: "/images/ingredients/inulin.png",
  }
];

export function ScienceScrollytelling() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section id="science-section" ref={containerRef} className="relative w-full bg-[#F7F4F0] text-[#2D4A3E]">
      <div className="flex flex-col md:flex-row w-full">
        {/* Sticky Left Media (Desktop only) */}
        <div className="hidden md:flex w-full md:w-1/2 md:h-[calc(100vh-6rem)] sticky top-24 overflow-hidden items-center justify-center p-12 lg:px-16">
          <div className="w-full h-[90%] md:h-full rounded-2xl md:rounded-[3rem] overflow-hidden relative">
            {INGREDIENTS.map((ing, i) => {
              const start = i / INGREDIENTS.length;
              const end = (i + 1) / INGREDIENTS.length;
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const opacity = useTransform(
                scrollYProgress,
                [start - 0.1, start, end, end + 0.1],
                [0, 1, 1, 0]
              );
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const scale = useTransform(
                scrollYProgress,
                [start, end],
                [1, 1.1]
              );

              return (
                <motion.div key={ing.id} style={{ opacity }} className="absolute inset-0">
                  <motion.img
                    style={{ scale }}
                    src={ing.media}
                    alt={ing.title}
                    className="w-full h-full object-cover grayscale mix-blend-multiply opacity-80"
                  />
                  <div className="absolute inset-0 bg-[#F7F4F0]/20 backdrop-blur-[2px]" />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Scrolling Right Text */}
        <div className="w-full md:w-1/2 relative z-10 flex flex-col gap-12 md:gap-0 pt-12 md:pt-0 pb-28 md:pb-0">
          {INGREDIENTS.map((ing, i) => (
            <div key={ing.id} className="md:min-h-screen flex items-center px-6 md:px-16 py-8 md:py-24">
              <div className="max-w-md w-full">
                <span className="text-[10px] md:text-sm font-semibold tracking-[0.2em] uppercase text-[#2D4A3E]/40 mb-4 block">
                  0{i + 1} // Съставка
                </span>
                <p className="text-[clamp(4rem,15vw,6rem)] font-serif font-light tracking-tight leading-[0.8] mb-4 md:mb-6 text-[#2D4A3E]">
                  {ing.dose}
                </p>
                <h3 className="text-3xl md:text-4xl font-serif text-[#2D4A3E] mb-6 md:mb-2">{ing.title}</h3>

                {/* Mobile Image Inline */}
                <div className="md:hidden w-full aspect-square rounded-[2rem] overflow-hidden mb-8 relative border border-[#2D4A3E]/5 shadow-sm">
                  <img
                    src={ing.media}
                    alt={ing.title}
                    className="w-full h-full object-cover grayscale mix-blend-multiply opacity-80 scale-105"
                  />
                  <div className="absolute inset-0 bg-[#F7F4F0]/20 backdrop-blur-[2px]" />
                </div>

                <p className="text-[11px] md:text-sm font-semibold uppercase tracking-widest text-[#2D4A3E]/50 mb-6 border-b border-[#2D4A3E]/10 pb-4 inline-block">
                  {ing.subtitle}
                </p>
                <p className="text-base md:text-lg font-light text-[#2D4A3E]/70 leading-relaxed">
                  {ing.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
