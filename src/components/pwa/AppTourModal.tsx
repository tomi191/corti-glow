"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePwaStore } from "@/stores/pwa-store";
import {
  Sparkles,
  CalendarDays,
  BarChart3,
  ShoppingBag,
  Wind,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface TourStep {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    icon: Sparkles,
    iconBg: "bg-brand-sage/30",
    iconColor: "text-brand-forest",
    title: "Дневен чек-ин",
    description:
      "Натисни Glow Ring-а на началния екран, за да запишеш как се чувстваш — сън, стрес и симптоми. Получаваш Glow Score от 0 до 100.",
  },
  {
    icon: CalendarDays,
    iconBg: "bg-brand-blush/30",
    iconColor: "text-pink-500",
    title: "Календар на цикъла",
    description:
      "Виж фазите на цикъла си с цветна карта. Натисни върху минал ден, за да прегледаш чек-ина си. Днешният ден отваря нов чек-ин.",
  },
  {
    icon: BarChart3,
    iconBg: "bg-brand-cream/40",
    iconColor: "text-amber-600",
    title: "Анализ и тенденции",
    description:
      "След 3+ чек-ина ще видиш графики за Glow Score, среден сън, стрес и най-честите ти симптоми.",
  },
  {
    icon: ShoppingBag,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-500",
    title: "Персонализиран магазин",
    description:
      "Препоръки за добавки, базирани на текущата ти фаза. Всеки цикъл — различен съвет.",
  },
  {
    icon: Wind,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
    title: "Дихателно упражнение",
    description:
      "Натисни бутона долу вдясно за 4-секундно box breathing. Помага при стрес и тревожност.",
  },
];

interface AppTourModalProps {
  onClose: () => void;
}

export default function AppTourModal({ onClose }: AppTourModalProps) {
  const markTourSeen = usePwaStore((s) => s.markTourSeen);
  const [step, setStep] = useState(0);

  const isLast = step === TOUR_STEPS.length - 1;
  const current = TOUR_STEPS[step];
  const Icon = current.icon;

  const handleNext = useCallback(() => {
    if (isLast) {
      markTourSeen();
      onClose();
    } else {
      setStep((s) => s + 1);
    }
  }, [isLast, markTourSeen, onClose]);

  const handleSkip = useCallback(() => {
    markTourSeen();
    onClose();
  }, [markTourSeen, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Modal */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 bg-white rounded-[2rem] shadow-2xl overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-100 transition-colors z-10"
          aria-label="Затвори"
        >
          <X className="w-5 h-5 text-stone-400" />
        </button>

        {/* Content */}
        <div className="p-6 pt-8">
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? "w-6 bg-brand-forest"
                    : i < step
                      ? "w-1.5 bg-brand-sage"
                      : "w-1.5 bg-stone-200"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -60, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-center space-y-4"
            >
              <div
                className={`w-16 h-16 rounded-2xl ${current.iconBg} flex items-center justify-center mx-auto`}
              >
                <Icon className={`w-8 h-8 ${current.iconColor}`} />
              </div>

              <h3 className="text-lg font-display font-bold text-brand-forest">
                {current.title}
              </h3>

              <p className="text-sm text-stone-500 leading-relaxed px-2">
                {current.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex items-center gap-3">
          {!isLast && (
            <button
              onClick={handleSkip}
              className="py-3 px-5 text-sm font-medium text-stone-400 transition-colors hover:text-stone-600"
            >
              Пропусни
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 py-3 rounded-full bg-brand-forest text-white font-semibold shadow-lg transition-all active:scale-[0.98]"
          >
            {isLast ? "Започни!" : "Напред"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
