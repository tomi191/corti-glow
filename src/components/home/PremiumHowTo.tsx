"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Clock, Sparkles, Moon, Sun, Star, Heart, Lightbulb, type LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedHeading } from "@/components/ui/AnimatedText";

const steps = [
  {
    step: 1,
    time: "Вечер",
    icon: Moon,
    title: "Смесвай",
    description: "Разбъркай 1 саше в 200-250мл студена вода.",
    tip: "За по-кремообразна текстура добави лед",
    color: "#B2D8C6",
  },
  {
    step: 2,
    time: "2-3 минути",
    icon: Clock,
    title: "Изчакай",
    description: "Остави да се разтвори напълно.",
    tip: "Може да разбъркаш със шейкър",
    color: "#FFC1CC",
  },
  {
    step: 3,
    time: "Релакс",
    icon: Sparkles,
    title: "Насладете се",
    description: "Пий бавно и се наслади на вкуса.",
    tip: "Идеално 1-2 часа преди сън",
    color: "#F4E3B2",
  },
];

const results: { day: string; result: string; icon: LucideIcon; color: string }[] = [
  { day: "Ден 1-3", result: "Забелязваш по-добър сън", icon: Moon, color: "#B2D8C6" },
  { day: "Ден 7", result: "Подуването намалява видимо", icon: Sparkles, color: "#FFC1CC" },
  { day: "Ден 14", result: "Чувстваш се по-спокойна", icon: Heart, color: "#F4E3B2" },
  { day: "Ден 30", result: "Пълна трансформация", icon: Star, color: "#B2D8C6" },
];

export function PremiumHowTo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-16 md:py-32 relative overflow-hidden bg-[#F5F2EF]">
      {/* Hero Image */}
      <motion.div
        initial={{ opacity: 0, scale: 1.1 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.2 }}
        className="absolute top-0 left-0 w-full h-[50vh] overflow-hidden"
      >
        <Image
          src="/images/product-pouring.webp"
          alt="Corti-Glow pouring into glass"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F5F2EF]/50 to-[#F5F2EF]" />
      </motion.div>

      {/* Background Pattern */}
      <div className="absolute inset-0 top-[50vh]">
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
          <pattern
            id="grid"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="#2D4A3E"
              strokeWidth="1"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative pt-[35vh]">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 text-[#2D4A3E] text-sm font-medium uppercase tracking-widest mb-6"
          >
            <Sun className="w-4 h-4" />
            Твоят Вечерен Ритуал
          </motion.span>

          <AnimatedHeading delay={0.2}>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#2D4A3E] tracking-tight mb-6">
              Толкова Лесно.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B2D8C6] to-[#FFC1CC]">
                Толкова Вкусно.
              </span>
            </h2>
          </AnimatedHeading>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-stone-600 font-light"
          >
            Замени вечерната захар с функционален ритуал за красота отвътре.
          </motion.p>
        </div>

        {/* Steps - Horizontal Timeline */}
        <div className="relative mb-24">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#B2D8C6] via-[#FFC1CC] to-[#F4E3B2] hidden md:block" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.15 }}
                className="relative"
              >
                <GlassCard className="p-8 text-center bg-white" hover>
                  {/* Step Number */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center relative"
                    style={{ backgroundColor: `${step.color}30` }}
                  >
                    <step.icon className="w-7 h-7" style={{ color: step.color }} />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#2D4A3E] text-white text-xs font-bold flex items-center justify-center">
                      {step.step}
                    </span>
                  </motion.div>

                  {/* Time Badge */}
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4"
                    style={{ backgroundColor: `${step.color}20`, color: "#2D4A3E" }}
                  >
                    {step.time}
                  </span>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-[#2D4A3E] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-stone-600 mb-4">{step.description}</p>

                  {/* Tip */}
                  <p className="text-sm text-stone-400 italic flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-[#F4E3B2]" />
                    {step.tip}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Results Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3 className="text-center text-2xl font-semibold text-[#2D4A3E] mb-10">
            Очаквани Резултати
          </h3>

          <div className="relative">
            {/* Progress Bar */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#B2D8C6] via-[#FFC1CC] to-[#F4E3B2] -translate-x-1/2 rounded-full hidden md:block" />

            <div className="space-y-8 md:space-y-12">
              {results.map((result, index) => (
                <motion.div
                  key={result.day}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                  className={`flex items-center gap-8 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : ""}`}>
                    <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-white shadow-lg">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${result.color}30` }}
                      >
                        <result.icon className="w-5 h-5" style={{ color: result.color }} />
                      </div>
                      <div>
                        <span className="font-medium text-[#2D4A3E]">
                          {result.day}:
                        </span>
                        <span className="text-stone-600 ml-2">{result.result}</span>
                      </div>
                    </div>
                  </div>

                  {/* Center Dot */}
                  <div className="hidden md:flex w-4 h-4 rounded-full bg-white border-4 border-[#2D4A3E] z-10" />

                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
