"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { ProductHowToUseDB } from "@/lib/supabase/types";

const defaultSteps = [
  {
    number: 1,
    title: "Разтвори",
    description: "Разтвори 1 саше в 250мл студена вода",
    image: "/images/product-sachet-open.webp",
  },
  {
    number: 2,
    title: "Разбъркай",
    description: "Разбъркай добре, добави лед по желание",
    image: "/images/product-pouring.webp",
  },
  {
    number: 3,
    title: "Наслади се",
    description: "Пий веднъж дневно, за предпочитане вечер",
    image: "/images/product-glass-ready.webp",
  },
];

const fallbackImages = [
  "/images/product-sachet-open.webp",
  "/images/product-pouring.webp",
  "/images/product-glass-ready.webp",
];

interface HowToUseVisualProps {
  steps?: ProductHowToUseDB[];
}

export function HowToUseVisual({ steps: dbSteps }: HowToUseVisualProps) {
  const prefersReducedMotion = useReducedMotion();

  const steps = dbSteps && dbSteps.length > 0
    ? dbSteps.map((s, i) => ({
        number: s.step,
        title: s.title,
        description: s.description,
        image: s.image || fallbackImages[i] || fallbackImages[0],
      }))
    : defaultSteps;

  return (
    <section className="py-16 bg-[#F5F2EF]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#B2D8C6]/20 text-[#2D4A3E] text-sm font-medium mb-4">
            Лесно като 1-2-3
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#2D4A3E] mb-4">
            Как да използвам Corti-Glow
          </h2>
          <p className="text-stone-600 max-w-xl mx-auto">
            Твоят вечерен ритуал за спокойствие — само 30 секунди
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: index * 0.15 }}
              className="text-center"
            >
              {/* Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden mb-6 bg-white shadow-sm">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              {/* Step number */}
              <div className="w-10 h-10 rounded-full bg-[#2D4A3E] text-white flex items-center justify-center text-lg font-bold mx-auto mb-3">
                {step.number}
              </div>

              {/* Text */}
              <h3 className="font-semibold text-[#2D4A3E] text-lg mb-1">
                {step.title}
              </h3>
              <p className="text-sm text-stone-600">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
