"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { usePwaStore } from "@/stores/pwa-store";
import { SYMPTOM_OPTIONS, type SymptomOption } from "@/lib/pwa-logic";
import {
  Check, X,
  CloudMoon, Moon, Meh, Smile, Sparkles,
  AlertCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TOTAL_STEPS = 4;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
  }),
};

const SLEEP_LEVELS: { max: number; Icon: LucideIcon; color: string }[] = [
  { max: 2, Icon: CloudMoon, color: "text-stone-400" },
  { max: 4, Icon: Moon, color: "text-indigo-400" },
  { max: 6, Icon: Meh, color: "text-amber-500" },
  { max: 8, Icon: Smile, color: "text-emerald-500" },
  { max: 10, Icon: Sparkles, color: "text-brand-forest" },
];

function SleepIcon({ value }: { value: number }) {
  const level = SLEEP_LEVELS.find((l) => value <= l.max) ?? SLEEP_LEVELS[4];
  const Icon = level.Icon;
  return <Icon className={`w-12 h-12 ${level.color}`} />;
}

function getStressLabel(value: number) {
  if (value <= 2) return "Спокойна";
  if (value <= 4) return "Леко напрегната";
  if (value <= 6) return "Средно";
  if (value <= 8) return "Стресирана";
  return "Много стресирана";
}

export default function CheckInPage() {
  const router = useRouter();
  const saveCheckIn = usePwaStore((s) => s.saveCheckIn);
  const getTodayCheckIn = usePwaStore((s) => s.getTodayCheckIn);
  const [mounted, setMounted] = useState(false);

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [periodStarted, setPeriodStarted] = useState(false);
  const [sleep, setSleep] = useState(7);
  const [stress, setStress] = useState(3);
  const [symptoms, setSymptoms] = useState<SymptomOption[]>([]);
  const [done, setDone] = useState(false);

  // Re-checkin warning state
  const [showReCheckinWarning, setShowReCheckinWarning] = useState(false);
  const [existingCheckIn, setExistingCheckIn] = useState<ReturnType<typeof getTodayCheckIn>>(undefined);

  useEffect(() => setMounted(true), []);

  // Check if already checked in today
  useEffect(() => {
    if (!mounted) return;
    const existing = getTodayCheckIn();
    if (existing) {
      setExistingCheckIn(existing);
      setShowReCheckinWarning(true);
      // Pre-fill with existing data
      setPeriodStarted(existing.periodStarted);
      setSleep(existing.sleep);
      setStress(existing.stress);
      setSymptoms([...existing.symptoms]);
    }
  }, [mounted, getTodayCheckIn]);

  // Warn before losing wizard state
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!done && step > 0) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [done, step]);

  const next = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, []);

  const back = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const finish = useCallback(() => {
    saveCheckIn({ periodStarted, sleep, stress, symptoms });
    setDone(true);
    setTimeout(() => router.push("/app"), 1200);
  }, [saveCheckIn, periodStarted, sleep, stress, symptoms, router]);

  function toggleSymptom(s: SymptomOption) {
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  const handleClose = useCallback(() => {
    router.push("/app");
  }, [router]);

  if (!mounted) {
    return (
      <div className="max-w-lg mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-brand-sage border-t-transparent animate-spin" />
      </div>
    );
  }

  // Re-checkin warning screen
  if (showReCheckinWarning && existingCheckIn) {
    return (
      <div className="max-w-lg mx-auto">
        {/* Close button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-stone-100 transition-colors"
            aria-label="Затвори"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <div className="glass p-6 rounded-[2rem] text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7 text-amber-500" />
          </div>
          <h2 className="text-lg font-bold text-brand-forest">
            Вече имаш чек-ин днес
          </h2>
          <div className="glass p-4 rounded-2xl text-left space-y-1.5 text-sm">
            <p className="text-stone-600">
              <span className="font-semibold">Glow Score:</span> {existingCheckIn.glowScore}
            </p>
            <p className="text-stone-600">
              <span className="font-semibold">Сън:</span> {existingCheckIn.sleep}/10
            </p>
            <p className="text-stone-600">
              <span className="font-semibold">Стрес:</span> {existingCheckIn.stress}/10
            </p>
            {existingCheckIn.symptoms.length > 0 && (
              <p className="text-stone-600">
                <span className="font-semibold">Симптоми:</span>{" "}
                {existingCheckIn.symptoms.join(", ")}
              </p>
            )}
          </div>
          <p className="text-sm text-stone-500">
            Искаш ли да го промениш?
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 py-3 rounded-full border border-stone-200 text-stone-600 font-semibold transition-all active:scale-[0.98]"
            >
              Не, върни ме
            </button>
            <button
              onClick={() => setShowReCheckinWarning(false)}
              className="flex-1 py-3 rounded-full bg-brand-forest text-white font-semibold shadow-lg transition-all active:scale-[0.98]"
            >
              Да, промени
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 rounded-full bg-brand-sage/30 flex items-center justify-center mb-4"
        >
          <Check className="w-10 h-10 text-brand-forest" />
        </motion.div>
        <p className="text-lg font-semibold text-brand-forest">Готово!</p>
        <p className="text-sm text-stone-500 mt-1">Чек-инът ти е записан</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Close button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={handleClose}
          className="p-2 rounded-full hover:bg-stone-100 transition-colors"
          aria-label="Затвори"
        >
          <X className="w-5 h-5 text-stone-500" />
        </button>
      </div>

      {/* Progress dots */}
      <div
        className="flex items-center justify-center gap-2 mb-8"
        role="progressbar"
        aria-valuenow={step + 1}
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-label={`Стъпка ${step + 1} от ${TOTAL_STEPS}`}
      >
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

      {/* Steps */}
      <div className="relative overflow-hidden min-h-[320px]">
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
            {step === 0 && (
              <StepPeriod value={periodStarted} onChange={setPeriodStarted} />
            )}
            {step === 1 && (
              <StepSleep value={sleep} onChange={setSleep} />
            )}
            {step === 2 && (
              <StepStress value={stress} onChange={setStress} />
            )}
            {step === 3 && (
              <StepSymptoms selected={symptoms} onToggle={toggleSymptom} />
            )}
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
            className="flex-1 py-3 px-6 rounded-full bg-brand-forest text-white font-semibold shadow-lg transition-all active:scale-[0.98]"
          >
            Напред
          </button>
        ) : (
          <button
            onClick={finish}
            className="flex-1 py-3 px-6 rounded-full bg-brand-forest text-white font-semibold shadow-lg transition-all active:scale-[0.98]"
          >
            Готово
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Step Components ───

function StepPeriod({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="text-center space-y-6">
      <h2 className="text-xl font-bold text-brand-forest">
        Имаш ли менструация днес?
      </h2>
      <div className="flex justify-center gap-4">
        {[
          { label: "Да", val: true },
          { label: "Не", val: false },
        ].map((opt) => (
          <button
            key={opt.label}
            onClick={() => onChange(opt.val)}
            className={`px-8 py-3 rounded-full font-semibold transition-all ${
              value === opt.val
                ? "bg-brand-forest text-white shadow-lg"
                : "bg-white text-stone-600 border border-stone-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepSleep({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="text-center space-y-6">
      <h2 className="text-xl font-bold text-brand-forest">
        Как спа снощи?
      </h2>
      <div className="flex justify-center">
        <SleepIcon value={value} />
      </div>
      <div className="px-4">
        <input
          type="range"
          min={0}
          max={10}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-brand-forest"
          aria-label="Качество на съня"
          aria-valuemin={0}
          aria-valuemax={10}
          aria-valuenow={value}
        />
        <div className="flex justify-between text-xs text-stone-400 mt-1">
          <span>Ужасно</span>
          <span className="text-lg font-bold text-brand-forest">{value}/10</span>
          <span>Перфектно</span>
        </div>
      </div>
    </div>
  );
}

function StepStress({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  // Gradient from green (low stress) to red (high stress)
  const hue = Math.round(120 - (value / 10) * 120); // 120=green, 0=red

  return (
    <div className="text-center space-y-6">
      <h2 className="text-xl font-bold text-brand-forest">
        Ниво на стрес
      </h2>
      <p className="text-stone-500">{getStressLabel(value)}</p>
      <div className="px-4">
        <input
          type="range"
          min={0}
          max={10}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full"
          style={{ accentColor: `hsl(${hue}, 70%, 50%)` }}
          aria-label="Ниво на стрес"
          aria-valuemin={0}
          aria-valuemax={10}
          aria-valuenow={value}
          aria-valuetext={getStressLabel(value)}
        />
        <div className="flex justify-between text-xs text-stone-400 mt-1">
          <span>Спокойна</span>
          <span className="text-lg font-bold" style={{ color: `hsl(${hue}, 70%, 45%)` }}>
            {value}/10
          </span>
          <span>Много стрес</span>
        </div>
      </div>
    </div>
  );
}

function StepSymptoms({
  selected,
  onToggle,
}: {
  selected: SymptomOption[];
  onToggle: (s: SymptomOption) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-brand-forest">
          Симптоми днес
        </h2>
        <p className="text-sm text-stone-500 mt-1">
          Избери всички, които усещаш (незадължително)
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {SYMPTOM_OPTIONS.map((symptom) => (
          <button
            key={symptom}
            onClick={() => onToggle(symptom)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selected.includes(symptom)
                ? "bg-brand-forest text-white shadow-md"
                : "bg-white text-stone-600 border border-stone-200"
            }`}
          >
            {symptom}
          </button>
        ))}
      </div>
    </div>
  );
}
