"use client";

import { motion } from "framer-motion";
import { Sparkles, Clock, Shield } from "lucide-react";

interface QuizIntroProps {
  onStart: () => void;
}

export function QuizIntro({ onStart }: QuizIntroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-lg mx-auto text-center space-y-8"
    >
      {/* Badge */}
      <motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#B2D8C6]/30"
      >
        <Sparkles className="w-4 h-4 text-[#2D4A3E]" />
        <span className="text-sm font-medium text-[#2D4A3E]">
          Glow Guide — Персонален Тест
        </span>
      </motion.span>

      {/* Headline */}
      <div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#2D4A3E] leading-tight">
          Какъв е Твоят
          <br />
          <span className="text-[#2D4A3E]">
            Stress-Beauty Score?
          </span>
        </h1>
      </div>

      {/* Description */}
      <p className="text-base sm:text-lg text-stone-600 font-light leading-relaxed">
        Отговори на 6 въпроса и открий как стресът влияе на кожата, съня и
        енергията ти. Получи персонализирана AI препоръка.
      </p>

      {/* Trust indicators */}
      <div className="flex flex-wrap justify-center gap-6 text-sm text-stone-500">
        <span className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[#B2D8C6]" />2 минути
        </span>
        <span className="flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-[#B2D8C6]" />
          100% анонимно
        </span>
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#B2D8C6]" />
          AI препоръка
        </span>
      </div>

      {/* Start button */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={onStart}
        className="inline-flex items-center gap-2 px-8 py-4 bg-[#2D4A3E] text-white rounded-full text-base font-medium shadow-lg shadow-[#2D4A3E]/20 hover:shadow-xl transition-shadow"
      >
        Започни Теста
        <svg
          className="w-5 h-5"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.button>
    </motion.div>
  );
}
