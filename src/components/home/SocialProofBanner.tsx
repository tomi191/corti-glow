"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { STATS } from "@/lib/constants";

interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

const stats: StatItem[] = [
  { value: STATS.rating, suffix: "/5", label: "Оценка" },
  { value: STATS.clients, suffix: "+", label: "Клиентки" },
  { value: STATS.results, suffix: "%", label: "Виждат Резултат" },
  { value: STATS.cortisol, suffix: "%", label: "По-нисък Кортизол" },
];

function CountUp({ target, suffix, isInView }: { target: number; suffix: string; isInView: boolean }) {
  const [count, setCount] = useState(0);
  const isDecimal = target % 1 !== 0;

  useEffect(() => {
    if (!isInView) return;

    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(increment * step, target);
      setCount(current);

      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span>
      {isDecimal && count > 0 ? count.toFixed(1) : Math.round(count)}
      {suffix}
    </span>
  );
}

export function SocialProofBanner() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="bg-[#2D4A3E] py-6 sm:py-8">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl sm:text-3xl font-bold text-white font-display">
                {i === 3 && "-"}
                <CountUp target={stat.value} suffix={stat.suffix} isInView={isInView} />
              </div>
              <div className="text-xs sm:text-sm text-white/60 mt-1">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
