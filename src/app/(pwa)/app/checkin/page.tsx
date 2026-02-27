"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { usePwaStore } from "@/stores/pwa-store";
import { SYMPTOM_OPTIONS, type SymptomOption } from "@/lib/pwa-logic";
import { trackPwaEvent } from "@/lib/pwa-analytics";
import {
  Check, X, Plus,
  CloudMoon, Moon, Meh, Smile, Sparkles,
  AlertCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PremiumSlider from "@/components/pwa/PremiumSlider";

// ─── Sleep level visual config ───

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
  return <Icon className={`w-10 h-10 ${level.color}`} />;
}

function getStressLabel(value: number) {
  if (value <= 2) return "Спокойна";
  if (value <= 4) return "Леко напрегната";
  if (value <= 6) return "Средно";
  if (value <= 8) return "Стресирана";
  return "Много стресирана";
}

// ─── Main Component ───

export default function CheckInPage() {
  const router = useRouter();
  const saveCheckIn = usePwaStore((s) => s.saveCheckIn);
  const getTodayCheckIn = usePwaStore((s) => s.getTodayCheckIn);
  const [mounted, setMounted] = useState(false);

  const [periodStarted, setPeriodStarted] = useState(false);
  const [sleep, setSleep] = useState(7);
  const [stress, setStress] = useState(3);
  const [symptoms, setSymptoms] = useState<SymptomOption[]>([]);
  const [expanded, setExpanded] = useState(false);
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
      // Auto-expand if user had entered symptoms or period before
      if (existing.symptoms.length > 0 || existing.periodStarted) {
        setExpanded(true);
      }
    }
  }, [mounted, getTodayCheckIn]);

  // Warn before losing expanded state
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!done && expanded) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [done, expanded]);

  const finish = useCallback(() => {
    saveCheckIn({ periodStarted, sleep, stress, symptoms });
    trackPwaEvent("checkin_completed", {
      type: expanded ? "full" : "quick",
      sleep,
      stress,
      symptoms_count: symptoms.length,
      period_started: periodStarted,
    });
    setDone(true);
    setTimeout(() => router.push("/app"), 1200);
  }, [saveCheckIn, periodStarted, sleep, stress, symptoms, expanded, router]);

  function toggleSymptom(s: SymptomOption) {
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  const handleClose = useCallback(() => {
    router.push("/app");
  }, [router]);

  // ─── Loading ───
  if (!mounted) {
    return (
      <div className="max-w-lg mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-brand-sage border-t-transparent animate-spin" />
      </div>
    );
  }

  // ─── Re-checkin Warning ───
  if (showReCheckinWarning && existingCheckIn) {
    return (
      <div className="max-w-lg mx-auto">
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
            Вече имаш запис за днес
          </h2>
          <div className="glass p-4 rounded-2xl text-left space-y-1.5 text-sm">
            <p className="text-stone-600">
              <span className="font-semibold">Score:</span> {existingCheckIn.glowScore}
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

  // ─── Done Screen ───
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
        <p className="text-lg font-semibold text-brand-forest">Готово</p>
        <p className="text-sm text-stone-500 mt-1">Денят ти е записан</p>
      </div>
    );
  }

  // ─── Main Check-in Screen ───
  const stressHue = Math.round(120 - (stress / 10) * 120);

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Close button */}
      <div className="flex justify-end">
        <button
          onClick={handleClose}
          className="p-2 rounded-full hover:bg-stone-100 transition-colors"
          aria-label="Затвори"
        >
          <X className="w-5 h-5 text-stone-500" />
        </button>
      </div>

      {/* Title */}
      <h1 className="text-xl font-display font-bold text-brand-forest text-center">
        Как е днес?
      </h1>

      {/* Sliders Card */}
      <div className="glass p-6 rounded-[2rem] space-y-8">
        {/* Sleep */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-brand-forest">Как спа снощи?</h3>
            <SleepIcon value={sleep} />
          </div>
          <PremiumSlider
            value={sleep}
            onChange={setSleep}
            min={0}
            max={10}
            colorFrom="#B2D8C6"
            colorTo="#2D4A3E"
            label="Качество на съня"
          />
          <div className="flex justify-between text-xs text-stone-400">
            <span>Ужасно</span>
            <span className="text-base font-bold text-brand-forest">{sleep}/10</span>
            <span>Перфектно</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-stone-200/60" />

        {/* Stress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-brand-forest">Ниво на стрес</h3>
            <span className="text-xs font-medium text-stone-500">{getStressLabel(stress)}</span>
          </div>
          <PremiumSlider
            value={stress}
            onChange={setStress}
            min={0}
            max={10}
            colorFrom="#B2D8C6"
            colorTo="#E05A6D"
            label="Ниво на стрес"
          />
          <div className="flex justify-between text-xs text-stone-400">
            <span>Спокойна</span>
            <span className="text-base font-bold" style={{ color: `hsl(${stressHue}, 70%, 45%)` }}>
              {stress}/10
            </span>
            <span>Много стрес</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={finish}
        className="w-full py-4 rounded-full bg-brand-forest text-white font-semibold text-base shadow-lg shadow-brand-forest/20 active:scale-[0.98] transition-transform"
      >
        {expanded ? "Запази всичко" : "Запази деня"}
      </button>

      {/* Ghost expand link */}
      {!expanded && (
        <button
          onClick={() => {
            setExpanded(true);
            trackPwaEvent("checkin_expanded");
          }}
          className="w-full py-2 text-sm text-stone-400 font-medium flex items-center justify-center gap-1.5 hover:text-brand-forest transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добави симптоми и цикъл
        </button>
      )}

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-5 pt-2">
              {/* Section label */}
              <div className="flex items-center gap-3 px-1">
                <div className="flex-1 border-t border-stone-200/60" />
                <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
                  Допълнително
                </span>
                <div className="flex-1 border-t border-stone-200/60" />
              </div>

              {/* Period toggle */}
              <button
                onClick={() => setPeriodStarted((v) => !v)}
                className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all ${
                  periodStarted
                    ? "bg-brand-blush/30 border border-brand-blush"
                    : "glass border border-stone-200/60"
                }`}
              >
                <span className="text-lg">🩸</span>
                <span className="text-sm font-semibold text-brand-forest flex-1 text-left">
                  Цикълът ми започна днес
                </span>
                <div
                  className={`w-10 h-6 rounded-full relative transition-colors ${
                    periodStarted ? "bg-brand-forest" : "bg-stone-200"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                      periodStarted ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </div>
              </button>

              {/* Symptoms */}
              <div className="glass p-5 rounded-2xl space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-brand-forest">
                    Симптоми днес
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Избери всички, които усещаш (незадължително)
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SYMPTOM_OPTIONS.map((symptom) => (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        symptoms.includes(symptom)
                          ? "bg-brand-forest text-white shadow-md"
                          : "bg-white text-stone-600 border border-stone-200"
                      }`}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
