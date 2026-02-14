"use client";

import { motion } from "framer-motion";
import { ScoreGauge } from "./ScoreGauge";
import { QuizCTA } from "./QuizCTA";

interface QuizResultsProps {
  score: number;
  level: string;
  recommendation: string;
  variant: {
    id: string;
    name: string;
    price: number;
    tagline: string;
  };
  categoryScores: Record<string, number>;
}

const categoryLabels: Record<string, string> = {
  stress: "Стрес",
  sleep: "Сън",
  skin: "Кожа",
  diet: "Хранене",
  body: "Тяло",
  mood: "Настроение",
  cycle: "Цикъл",
};

const categoryColors: Record<string, string> = {
  stress: "#2D4A3E",
  sleep: "#FFC1CC",
  skin: "#F4E3B2",
  diet: "#B2D8C6",
  body: "#FFC1CC",
  mood: "#F4E3B2",
  cycle: "#FFC1CC",
};

export function QuizResults({
  score,
  recommendation,
  variant,
  categoryScores,
}: QuizResultsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-lg mx-auto space-y-8"
    >
      {/* Score */}
      <div className="text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-stone-500 mb-4"
        >
          Твоят Резултат
        </motion.p>
        <ScoreGauge score={score} />
      </div>

      {/* Category breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-3 gap-3"
      >
        {Object.entries(categoryScores).map(([cat, catScore]) => (
          <div
            key={cat}
            className="text-center p-3 rounded-xl bg-white border border-stone-100"
          >
            <div
              className="text-lg font-bold"
              style={{ color: categoryColors[cat] || "#2D4A3E" }}
            >
              {catScore}
            </div>
            <div className="text-[11px] text-stone-500">
              {categoryLabels[cat] || cat}
            </div>
          </div>
        ))}
      </motion.div>

      {/* AI Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl bg-gradient-to-br from-[#F5F2EF] to-white p-6 border border-stone-100"
      >
        <h3 className="text-sm font-medium text-[#2D4A3E] mb-3 uppercase tracking-wider">
          Персонална Препоръка
        </h3>
        <div className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
          {recommendation}
        </div>
      </motion.div>

      {/* CTA */}
      <QuizCTA variant={variant} />
    </motion.div>
  );
}
