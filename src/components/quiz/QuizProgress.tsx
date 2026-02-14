"use client";

import { motion } from "framer-motion";

interface QuizProgressProps {
  current: number;
  total: number;
}

export function QuizProgress({ current, total }: QuizProgressProps) {
  const progress = ((current + 1) / total) * 100;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-stone-500">
          Въпрос {current + 1} от {total}
        </span>
        <span className="text-sm font-medium text-[#2D4A3E]">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#2D4A3E] to-[#B2D8C6] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
