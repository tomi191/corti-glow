"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePwaStore } from "@/stores/pwa-store";
import { Sparkles, Calendar, ChevronRight } from "lucide-react";

const TOTAL_STEPS = 3;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
};

interface OnboardingWizardProps {
  onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const setLastPeriodDate = usePwaStore((s) => s.setLastPeriodDate);
  const setCycleLength = usePwaStore((s) => s.setCycleLength);
  const setPeriodDuration = usePwaStore((s) => s.setPeriodDuration);

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Cycle setup state
  const [periodDate, setPeriodDate] = useState("");
  const [cycleLen, setCycleLen] = useState(28);
  const [periodDur, setPeriodDur] = useState(5);

  const next = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, []);

  const back = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const finish = useCallback(() => {
    if (periodDate) {
      setLastPeriodDate(periodDate);
    }
    setCycleLength(cycleLen);
    setPeriodDuration(periodDur);
    onComplete();
  }, [periodDate, cycleLen, periodDur, setLastPeriodDate, setCycleLength, setPeriodDuration, onComplete]);

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === step
                ? "w-8 bg-brand-forest"
                : i < step
                  ? "w-2 bg-brand-sage"
                  : "w-2 bg-stone-200"
            }`}
          />
        ))}
      </div>

      <div className="relative overflow-hidden min-h-[360px]">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {step === 0 && <StepWelcome />}
            {step === 1 && (
              <StepCycleSetup
                periodDate={periodDate}
                onPeriodDateChange={setPeriodDate}
                cycleLength={cycleLen}
                onCycleLengthChange={setCycleLen}
                periodDuration={periodDur}
                onPeriodDurationChange={setPeriodDur}
              />
            )}
            {step === 2 && <StepReady />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <button
            onClick={back}
            className="py-3 px-6 rounded-full border border-stone-200 text-stone-600 font-semibold transition-all active:scale-[0.98]"
          >
            Назад
          </button>
        )}
        {step < TOTAL_STEPS - 1 ? (
          <button
            onClick={next}
            className="flex-1 py-3 px-6 rounded-full bg-brand-forest text-white font-semibold shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Напред
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={finish}
            disabled={!periodDate}
            className="flex-1 py-3 px-6 rounded-full bg-brand-forest text-white font-semibold shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Готово
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Step Components ───

function StepWelcome() {
  return (
    <div className="text-center space-y-6 px-4">
      <div className="w-20 h-20 rounded-full bg-brand-sage/30 flex items-center justify-center mx-auto">
        <Sparkles className="w-10 h-10 text-brand-forest" />
      </div>
      <div className="space-y-3">
        <h2 className="text-2xl font-display font-bold text-brand-forest">
          Добре дошла в Glow Tracker
        </h2>
        <p className="text-stone-500 leading-relaxed">
          Проследявай цикъла си, записвай как се чувстваш всеки ден
          и получавай персонализирани съвети за храна, движение и добавки.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 pt-2">
        {[
          { label: "Чек-ин", desc: "Сън, стрес, симптоми" },
          { label: "Календар", desc: "Фази на цикъла" },
          { label: "Анализ", desc: "Тенденции и score" },
        ].map((item) => (
          <div key={item.label} className="glass p-3 rounded-2xl text-center">
            <p className="text-xs font-bold text-brand-forest">{item.label}</p>
            <p className="text-[10px] text-stone-400 mt-0.5">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepCycleSetup({
  periodDate,
  onPeriodDateChange,
  cycleLength,
  onCycleLengthChange,
  periodDuration,
  onPeriodDurationChange,
}: {
  periodDate: string;
  onPeriodDateChange: (v: string) => void;
  cycleLength: number;
  onCycleLengthChange: (v: number) => void;
  periodDuration: number;
  onPeriodDurationChange: (v: number) => void;
}) {
  // Max date = today
  const today = new Date();
  const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="space-y-6 px-2">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-brand-blush/30 flex items-center justify-center mx-auto">
          <Calendar className="w-7 h-7 text-pink-500" />
        </div>
        <h2 className="text-xl font-bold text-brand-forest">Настрой цикъла си</h2>
        <p className="text-sm text-stone-500">Това помага за точни прогнози</p>
      </div>

      <div className="space-y-5">
        {/* Last period date */}
        <div className="space-y-2">
          <label htmlFor="period-date" className="block text-sm font-semibold text-stone-700">
            Кога започна последният ти период?
          </label>
          <input
            id="period-date"
            type="date"
            value={periodDate}
            max={maxDate}
            onChange={(e) => onPeriodDateChange(e.target.value)}
            className="w-full py-3 px-4 border border-stone-200 rounded-xl text-stone-700 bg-white focus:ring-2 focus:ring-brand-forest/30 focus:border-brand-forest outline-none"
          />
        </div>

        {/* Cycle length */}
        <div className="space-y-2">
          <label htmlFor="cycle-length" className="block text-sm font-semibold text-stone-700">
            Дължина на цикъла: <span className="text-brand-forest">{cycleLength} дни</span>
          </label>
          <input
            id="cycle-length"
            type="range"
            min={21}
            max={40}
            value={cycleLength}
            onChange={(e) => onCycleLengthChange(Number(e.target.value))}
            className="w-full accent-brand-forest"
          />
          <div className="flex justify-between text-xs text-stone-400">
            <span>21</span>
            <span>28 (средно)</span>
            <span>40</span>
          </div>
        </div>

        {/* Period duration */}
        <div className="space-y-2">
          <label htmlFor="period-duration" className="block text-sm font-semibold text-stone-700">
            Продължителност на менструация: <span className="text-brand-forest">{periodDuration} дни</span>
          </label>
          <input
            id="period-duration"
            type="range"
            min={2}
            max={8}
            value={periodDuration}
            onChange={(e) => onPeriodDurationChange(Number(e.target.value))}
            className="w-full accent-brand-forest"
          />
          <div className="flex justify-between text-xs text-stone-400">
            <span>2</span>
            <span>5 (средно)</span>
            <span>8</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepReady() {
  return (
    <div className="text-center space-y-6 px-4">
      <div className="w-20 h-20 rounded-full bg-brand-sage/30 flex items-center justify-center mx-auto">
        <Sparkles className="w-10 h-10 text-brand-forest" />
      </div>
      <div className="space-y-3">
        <h2 className="text-2xl font-display font-bold text-brand-forest">
          Готова си!
        </h2>
        <p className="text-stone-500 leading-relaxed">
          Цикълът ти е настроен. Сега можеш да направиш
          първия си дневен чек-ин и да видиш персонализирани препоръки.
        </p>
      </div>
    </div>
  );
}
