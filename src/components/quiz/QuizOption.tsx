"use client";

import { motion } from "framer-motion";

interface QuizOptionProps {
  label: string;
  value: number;
  isSelected: boolean;
  accentColor: string;
  index: number;
  onSelect: (value: number) => void;
}

export function QuizOption({
  label,
  value,
  isSelected,
  accentColor,
  index,
  onSelect,
}: QuizOptionProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      onClick={() => onSelect(value)}
      className={`
        w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200
        ${
          isSelected
            ? "border-[#2D4A3E] bg-[#2D4A3E]/5 shadow-md"
            : "border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50"
        }
      `}
      style={
        isSelected
          ? { borderColor: accentColor, backgroundColor: `${accentColor}10` }
          : undefined
      }
    >
      <div className="flex items-center gap-3">
        <div
          className={`
            w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
            ${isSelected ? "border-transparent" : "border-stone-300"}
          `}
          style={isSelected ? { backgroundColor: accentColor } : undefined}
        >
          {isSelected && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-3 h-3 text-white"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                d="M2 6L5 9L10 3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          )}
        </div>
        <span
          className={`text-sm sm:text-base ${
            isSelected ? "text-[#2D4A3E] font-medium" : "text-stone-700"
          }`}
        >
          {label}
        </span>
      </div>
    </motion.button>
  );
}
