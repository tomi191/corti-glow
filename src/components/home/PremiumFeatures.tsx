"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Droplets, Brain, Scale, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedHeading } from "@/components/ui/AnimatedText";

const features = [
  {
    icon: Droplets,
    color: "#B2D8C6",
    title: "Моментална Лекота",
    description:
      "Бромелаин и Магнезий работят заедно за бързо премахване на подуването и водата.",
    stat: "24ч",
    statLabel: "за видим резултат",
  },
  {
    icon: Brain,
    color: "#FFC1CC",
    title: "Дълбок Анти-Стрес",
    description:
      "KSM-66® Ашваганда понижава кортизола с до 27% за спокоен ум и тяло.",
    stat: "-27%",
    statLabel: "кортизол",
  },
  {
    icon: Scale,
    color: "#F4E3B2",
    title: "Хормонален Баланс",
    description:
      "Мио-инозитол подкрепя цикъла, овулацията и инсулиновата чувствителност — за по-лек ПМС и хормонален баланс.",
    stat: "2000mg",
    statLabel: "клинична доза",
  },
];

export function PremiumFeatures() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-16 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#2D4A3E]/5 to-white" />

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 text-[#2D4A3E] text-sm font-medium uppercase tracking-widest mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Тройна Формула
          </motion.span>

          <AnimatedHeading delay={0.2}>
            <h2 className="text-2xl sm:text-4xl lg:text-6xl font-semibold text-[#2D4A3E] tracking-tight mb-6">
              Един Моктейл.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B2D8C6] to-[#FFC1CC]">
                Три Резултата.
              </span>
            </h2>
          </AnimatedHeading>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-stone-600 font-light"
          >
            Замени вечерното вино с функционален ритуал, създаден за твоето
            тяло.
          </motion.p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <GlassCard key={feature.title} delay={0.2 + index * 0.15} className="p-8">
              {/* Icon */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                style={{ backgroundColor: `${feature.color}20` }}
              >
                <feature.icon
                  className="w-8 h-8"
                  style={{ color: feature.color }}
                />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-[#2D4A3E] mb-3">
                {feature.title}
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed mb-6">
                {feature.description}
              </p>

              {/* Stat */}
              <div className="pt-6 border-t border-stone-100">
                <div className="text-3xl font-bold text-[#2D4A3E]">
                  {feature.stat}
                </div>
                <div className="text-xs text-stone-500 uppercase tracking-wider">
                  {feature.statLabel}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
