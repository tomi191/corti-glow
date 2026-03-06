"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

const milestones = [
  {
    time: "Ден 1",
    title: "Събуждаш се без обичайното подуване.",
    body: "Инулинът и Бромелаинът започват работа от първата вечер. Стомахът е по-лек, водата не се задържа.",
    accent: "bg-brand-sage",
  },
  {
    time: "Седмица 1",
    title: "Умът ти спира да препуска преди сън.",
    body: "L-Теанинът и Магнезият успокояват нервната система. Заспиваш по-лесно, без да въртиш мисли.",
    accent: "bg-brand-cream",
  },
  {
    time: "Месец 1",
    title: "Хормоните влизат в ритъм.",
    body: "Мио-инозитолът има нужда от един пълен цикъл за пълен ефект. Цикълът е по-предвидим. ПМС-ът е по-лек.",
    accent: "bg-brand-blush",
  },
];

function TimelineItem({
  milestone,
  index,
  progress,
}: {
  milestone: (typeof milestones)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const dotStart = 0.15 + index * 0.22;
  const dotOpacity = useTransform(progress, [dotStart, dotStart + 0.1], [0, 1]);
  const dotScale = useTransform(progress, [dotStart, dotStart + 0.1], [0, 1]);
  const itemY = useTransform(progress, [dotStart - 0.05, dotStart + 0.1], [40, 0]);
  const itemOpacity = useTransform(progress, [dotStart - 0.05, dotStart + 0.08], [0, 1]);

  return (
    <motion.div
      style={{ y: itemY, opacity: itemOpacity }}
      className="relative grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10"
    >
      {/* Dot */}
      <motion.div
        style={{ opacity: dotOpacity, scale: dotScale }}
        className="absolute -left-8 md:relative md:col-span-1 flex items-start justify-center pt-2"
      >
        <div className={`w-4 h-4 rounded-full ${milestone.accent} shadow-sm`} />
      </motion.div>

      {/* Time label */}
      <div className="md:col-span-3">
        <p className="text-sm uppercase tracking-[0.25em] text-[#2D4A3E]/25 font-semibold md:pt-2">
          {milestone.time}
        </p>
      </div>

      {/* Content */}
      <div className="md:col-span-8">
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif italic text-[#2D4A3E] mb-4 leading-[1.1]">
          {milestone.title}
        </h3>
        <p className="text-base md:text-lg text-[#2D4A3E]/50 font-light leading-relaxed max-w-lg">
          {milestone.body}
        </p>
      </div>
    </motion.div>
  );
}

export function ExpectationsTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const lineHeight = useTransform(scrollYProgress, [0.1, 0.8], ["0%", "100%"]);

  return (
    <section ref={sectionRef} className="py-32 md:py-48 bg-transparent">
      <div className="max-w-5xl mx-auto px-6">
        {/* Intro */}
        <div className="text-center mb-24 md:mb-36">
          <p className="text-xs uppercase tracking-[0.3em] text-[#2D4A3E]/30 font-semibold mb-6">
            Времева линия
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-light italic text-[#2D4A3E] leading-[0.9] tracking-[-0.03em] mb-8">
            Какво да очакваш.
          </h2>
          <p className="text-lg md:text-xl text-[#2D4A3E]/50 font-light max-w-lg mx-auto">
            Дай на тялото си време. Ето какво се случва, когато кортизолът най-накрая спадне.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative pl-8 md:pl-0">
          {/* Vertical line (mobile only) — animated height tied to scroll */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-[#2D4A3E]/10 md:hidden">
            <motion.div
              style={{ height: lineHeight }}
              className="w-full bg-[#2D4A3E]/20 origin-top"
            />
          </div>

          <div className="flex flex-col gap-20 md:gap-28">
            {milestones.map((m, i) => (
              <div
                key={i}
                className={
                  i < milestones.length - 1
                    ? "border-b border-[#2D4A3E]/5 pb-20 md:pb-28"
                    : ""
                }
              >
                <TimelineItem
                  milestone={m}
                  index={i}
                  progress={scrollYProgress}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
