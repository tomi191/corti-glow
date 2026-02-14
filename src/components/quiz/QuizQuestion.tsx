"use client";

import { motion, AnimatePresence } from "framer-motion";
import { QuizOption } from "./QuizOption";
import type { QuizQuestion as QuizQuestionType } from "@/data/glow-guide";

interface QuizQuestionProps {
  question: QuizQuestionType;
  selectedValue: number | undefined;
  onSelect: (questionId: string, value: number) => void;
  direction: number; // 1 = forward, -1 = backward
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

export function QuizQuestion({
  question,
  selectedValue,
  onSelect,
  direction,
}: QuizQuestionProps) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={question.id}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md mx-auto"
      >
        {/* Question */}
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#2D4A3E] mb-2">
            {question.question}
          </h2>
          {question.subtitle && (
            <p className="text-sm text-stone-500">{question.subtitle}</p>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, i) => (
            <QuizOption
              key={`${question.id}-${option.value}`}
              label={option.label}
              value={option.value}
              isSelected={selectedValue === option.value}
              accentColor={question.accentColor}
              index={i}
              onSelect={(value) => onSelect(question.id, value)}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
