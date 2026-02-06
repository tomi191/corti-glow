"use client";

import { motion } from "framer-motion";

interface SuccessCheckmarkProps {
  message: string;
  size?: "sm" | "md";
  onComplete?: () => void;
  autoHideMs?: number;
}

export function SuccessCheckmark({
  message,
  size = "md",
  onComplete,
  autoHideMs,
}: SuccessCheckmarkProps) {
  const iconSize = size === "sm" ? "w-8 h-8" : "w-12 h-12";
  const checkSize = size === "sm" ? "w-4 h-4" : "w-6 h-6";
  const textSize = size === "sm" ? "text-sm" : "text-base";

  if (autoHideMs && onComplete) {
    setTimeout(onComplete, autoHideMs);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", duration: 0.5 }}
      className="flex flex-col items-center gap-2"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
        className={`${iconSize} rounded-full bg-[#B2D8C6] flex items-center justify-center`}
      >
        <svg
          className={`${checkSize} text-[#2D4A3E]`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`${textSize} font-medium text-[#2D4A3E]`}
      >
        {message}
      </motion.p>
    </motion.div>
  );
}
