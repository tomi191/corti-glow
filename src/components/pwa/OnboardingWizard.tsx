"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePwaStore } from "@/stores/pwa-store";
import { CONCERN_OPTIONS, type ConcernOption } from "@/lib/pwa-logic";
import { haptic } from "@/lib/haptics";
import { Sparkles, Moon, Leaf, Calendar, ArrowRight, User, Check } from "lucide-react";

const TOTAL_STEPS = 5;

const AGE_RANGES = ["18–24", "25–30", "31–35", "36–40", "41+"];

// ─── Chip style tokens ───────────────────────────
// Selected: brand-sage wash with forest text — on-brand, soft, no red clash
const CHIP_SELECTED =
  "bg-brand-sage/40 text-brand-forest border border-brand-sage/60 shadow-sm";
const CHIP_DEFAULT =
  "bg-white/70 text-stone-500 border border-stone-200/60 hover:border-brand-sage/40 active:scale-[0.97]";

// CTA active: solid forest with sage glow — grounded, elegant
const CTA_ACTIVE =
  "bg-brand-forest text-white shadow-lg shadow-brand-forest/25";
const CTA_INACTIVE =
  "bg-stone-100 text-stone-300 border border-stone-200";

// ─── Framer Motion Variants ───
const containerVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
      staggerChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    y: -15,
    transition: { duration: 0.4 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface OnboardingWizardProps {
  onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const setLastPeriodDate = usePwaStore((s) => s.setLastPeriodDate);
  const setCycleLength = usePwaStore((s) => s.setCycleLength);
  const setPeriodDuration = usePwaStore((s) => s.setPeriodDuration);
  const setUserName = usePwaStore((s) => s.setUserName);
  const setAgeRange = usePwaStore((s) => s.setAgeRange);
  const setConcerns = usePwaStore((s) => s.setConcerns);
  const setContraception = usePwaStore((s) => s.setContraception);

  const [step, setStep] = useState(0);

  // Name state (step 0)
  const [name, setName] = useState("");

  // Personal info state (step 2)
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedConcerns, setSelectedConcerns] = useState<ConcernOption[]>([]);
  const [selectedContraception, setSelectedContraception] = useState<"yes" | "no" | "unsure" | "">("");

  // Cycle setup state (step 3)
  const [periodDate, setPeriodDate] = useState("");
  const [cycleLen, setCycleLen] = useState(28);
  const [periodDur, setPeriodDur] = useState(5);

  const next = useCallback(() => {
    haptic.light();
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, []);

  const toggleConcern = useCallback((key: ConcernOption) => {
    setSelectedConcerns((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  }, []);

  const displayName = name.trim() || "прекрасна";

  const isSubmitting = useRef(false);
  const finish = useCallback(() => {
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    haptic.success();
    if (name.trim()) setUserName(name.trim());
    if (selectedAge) setAgeRange(selectedAge);
    if (selectedConcerns.length > 0) setConcerns(selectedConcerns);
    if (selectedContraception) setContraception(selectedContraception);
    if (periodDate) setLastPeriodDate(periodDate);
    setCycleLength(cycleLen);
    setPeriodDuration(periodDur);
    onComplete();
  }, [name, selectedAge, selectedConcerns, selectedContraception, periodDate, cycleLen, periodDur, setUserName, setAgeRange, setConcerns, setContraception, setLastPeriodDate, setCycleLength, setPeriodDuration, onComplete]);

  return (
    <div className="relative w-full min-h-[55vh] flex flex-col items-center justify-center">
      {/* ─── Animated Glass Blobs ─── */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[5%] left-[5%] w-48 h-48 bg-brand-blush/40 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[10%] right-[5%] w-56 h-56 bg-brand-sage/40 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-500 ${
              i === step
                ? "w-8 bg-brand-forest"
                : i < step
                  ? "w-2 bg-brand-sage"
                  : "w-2 bg-stone-200/60"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ─── Step 0: Personal Welcome ─── */}
        {step === 0 && (
          <motion.div
            key="step0"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="glass w-full max-w-sm p-8 rounded-[2rem] text-center shadow-2xl backdrop-blur-xl bg-white/40 border border-white/50"
          >
            <motion.div variants={itemVariants} className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-brand-sage/30 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-brand-forest" />
              </div>
            </motion.div>
            <motion.h1 variants={itemVariants} className="font-display text-3xl font-bold text-brand-forest mb-3">
              Здравей, прекрасна.
            </motion.h1>
            <motion.p variants={itemVariants} className="text-stone-600 mb-6 leading-relaxed">
              Добре дошла в твоето пространство за баланс. Нека настроим твоя дневник.
            </motion.p>
            <motion.div variants={itemVariants} className="mb-6">
              <label htmlFor="user-name" className="block text-sm font-semibold text-stone-700 mb-2">
                Как да те наричам?
              </label>
              <input
                id="user-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Твоето име"
                autoComplete="given-name"
                className="w-full py-3 px-4 border border-white/60 rounded-xl text-stone-700 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-brand-forest/30 focus:border-brand-forest outline-none transition-all text-center text-lg"
              />
            </motion.div>
            <motion.button
              variants={itemVariants}
              onClick={next}
              disabled={!name.trim()}
              initial={false}
              animate={name.trim() ? { scale: [0.96, 1] } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className={`w-full py-4 rounded-2xl font-semibold text-lg active:scale-[0.98] transition-all duration-500 relative overflow-hidden ${
                name.trim()
                  ? CTA_ACTIVE
                  : CTA_INACTIVE
              }`}
            >
              {name.trim() && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
                />
              )}
              <span className="relative z-10">Започни</span>
            </motion.button>
          </motion.div>
        )}

        {/* ─── Step 1: Value Prop ─── */}
        {step === 1 && (
          <motion.div
            key="step1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="glass w-full max-w-sm p-8 rounded-[2rem] text-center shadow-2xl backdrop-blur-xl bg-white/40 border border-white/50"
          >
            <motion.div variants={itemVariants} className="flex justify-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 shadow-sm">
                <Moon className="w-6 h-6" />
              </div>
              <div className="w-12 h-12 rounded-full bg-brand-sage/50 flex items-center justify-center text-brand-forest shadow-sm">
                <Leaf className="w-6 h-6" />
              </div>
            </motion.div>
            <motion.h2 variants={itemVariants} className="font-display text-2xl font-bold text-brand-forest mb-3">
              Само 4 секунди на ден.
            </motion.h2>
            <motion.p variants={itemVariants} className="text-stone-600 mb-8 leading-relaxed text-sm">
              Твоят дневен ритъм диктува твоите хормони. Проследявай нивата си на стрес и сън, за да разбереш какво причинява подуването и умората.
            </motion.p>
            <motion.button
              variants={itemVariants}
              onClick={next}
              className="w-full py-4 rounded-2xl bg-white text-brand-forest font-semibold text-lg shadow-md border border-brand-forest/10 active:scale-[0.98] transition-all"
            >
              Разбрах
            </motion.button>
          </motion.div>
        )}

        {/* ─── Step 2: Personal Info (NEW) ─── */}
        {step === 2 && (
          <motion.div
            key="step2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="glass w-full max-w-sm px-5 py-5 rounded-[2rem] shadow-2xl backdrop-blur-xl bg-white/40 border border-white/50"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-sage/30 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-brand-forest" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-brand-forest leading-tight">Разкажи ни за себе си</h2>
                <p className="text-xs text-stone-500">За да пасват съветите точно на теб</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-3.5">
              {/* Age range */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-700">На колко си?</label>
                <div className="flex flex-wrap gap-1.5">
                  {AGE_RANGES.map((range) => (
                    <button
                      key={range}
                      onClick={() => { setSelectedAge(range); haptic.light(); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedAge === range
                          ? CHIP_SELECTED
                          : CHIP_DEFAULT
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Concerns */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-700">
                  Какво те притеснява най-много?
                </label>
                <p className="text-[11px] text-stone-400 -mt-0.5">Избери всичко познато</p>
                <div className="flex flex-wrap gap-1.5">
                  {CONCERN_OPTIONS.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => { toggleConcern(key); haptic.light(); }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedConcerns.includes(key)
                          ? CHIP_SELECTED
                          : CHIP_DEFAULT
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contraception */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-700">
                  Хормонална контрацепция?
                </label>
                <p className="text-[11px] text-stone-400 -mt-0.5">Влияе на фазите — съветите ще са по-точни</p>
                <div className="flex gap-1.5">
                  {([
                    { value: "no", label: "Не" },
                    { value: "yes", label: "Да" },
                    { value: "unsure", label: "Не съм сигурна" },
                  ] as const).map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => { setSelectedContraception(value); haptic.light(); }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedContraception === value
                          ? CHIP_SELECTED
                          : CHIP_DEFAULT
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Liquid-fill CTA — fills as questions are answered */}
            {(() => {
              const answered = [!!selectedAge, selectedConcerns.length > 0, !!selectedContraception].filter(Boolean).length;
              const fillPct = Math.round((answered / 3) * 100);
              const isFull = fillPct === 100;
              return (
                <motion.button
                  variants={itemVariants}
                  onClick={next}
                  disabled={!selectedAge}
                  className="w-full mt-4 py-3.5 rounded-2xl font-semibold text-base active:scale-[0.98] relative overflow-hidden bg-stone-100 border border-stone-200 transition-shadow duration-500"
                  style={{ boxShadow: isFull ? "0 10px 25px -5px rgba(45,74,62,0.3)" : "none" }}
                >
                  {/* Liquid fill background */}
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-sage/60 via-brand-sage to-brand-forest rounded-2xl"
                    initial={{ width: "0%" }}
                    animate={{ width: `${fillPct}%` }}
                    transition={{ type: "spring", stiffness: 80, damping: 18 }}
                  />
                  {/* Shimmer on full */}
                  {isFull && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                      initial={{ x: "-100%" }}
                      animate={{ x: "200%" }}
                      transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
                    />
                  )}
                  <span className={`relative z-10 flex items-center justify-center gap-2 transition-colors duration-300 ${
                    isFull ? "text-white" : fillPct > 0 ? "text-brand-forest" : "text-stone-300"
                  }`}>
                    Продължи <ArrowRight className="w-5 h-5" />
                  </span>
                </motion.button>
              );
            })()}
          </motion.div>
        )}

        {/* ─── Step 3: Cycle Setup ─── */}
        {step === 3 && (
          <motion.div
            key="step3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="glass w-full max-w-sm px-5 py-5 rounded-[2rem] shadow-2xl backdrop-blur-xl bg-white/40 border border-white/50"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-blush/30 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-brand-forest leading-tight">Твоят вътрешен часовник</h2>
                <p className="text-xs text-stone-500">За да знаеш в коя фаза си</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-3.5">
              {/* Last period date */}
              <div className="space-y-1.5">
                <label htmlFor="period-date" className="block text-xs font-semibold text-stone-700">
                  Кога последно ти дойде?
                </label>
                <p className="text-[11px] text-stone-400 -mt-0.5">Първият ден — не е нужно да е точно</p>
                <input
                  id="period-date"
                  type="date"
                  value={periodDate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setPeriodDate(e.target.value)}
                  className="w-full py-2.5 px-3 border border-white/60 rounded-xl text-sm text-stone-700 bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-brand-forest/30 focus:border-brand-forest outline-none transition-all"
                />
              </div>

              {/* Cycle length */}
              <div className="space-y-1">
                <label htmlFor="cycle-length" className="block text-xs font-semibold text-stone-700">
                  На колко дни ти идва: <span className="text-brand-forest">{cycleLen} дни</span>
                </label>
                <p className="text-[11px] text-stone-400">От първия ден до следващия път</p>
                <input
                  id="cycle-length"
                  type="range"
                  min={21}
                  max={40}
                  value={cycleLen}
                  onChange={(e) => setCycleLen(Number(e.target.value))}
                  className="w-full accent-brand-forest"
                />
                <div className="flex justify-between text-[10px] text-stone-400 -mt-1">
                  <span>21</span>
                  <span>28 (средно)</span>
                  <span>40</span>
                </div>
              </div>

              {/* Period duration */}
              <div className="space-y-1">
                <label htmlFor="period-duration" className="block text-xs font-semibold text-stone-700">
                  Колко време продължава: <span className="text-brand-forest">{periodDur} дни</span>
                </label>
                <input
                  id="period-duration"
                  type="range"
                  min={2}
                  max={8}
                  value={periodDur}
                  onChange={(e) => setPeriodDur(Number(e.target.value))}
                  className="w-full accent-brand-forest"
                />
                <div className="flex justify-between text-[10px] text-stone-400 -mt-1">
                  <span>2</span>
                  <span>5 (средно)</span>
                  <span>8</span>
                </div>
              </div>
            </motion.div>

            <motion.button
              variants={itemVariants}
              onClick={next}
              disabled={!periodDate}
              initial={false}
              animate={periodDate ? { scale: [0.96, 1] } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className={`w-full mt-4 py-3.5 rounded-2xl font-semibold text-base active:scale-[0.98] transition-all duration-500 flex justify-center items-center gap-2 relative overflow-hidden ${
                periodDate
                  ? CTA_ACTIVE
                  : CTA_INACTIVE
              }`}
            >
              {periodDate && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                Продължи <ArrowRight className="w-5 h-5" />
              </span>
            </motion.button>
          </motion.div>
        )}

        {/* ─── Step 4: Ready ─── */}
        {step === 4 && (
          <motion.div
            key="step4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="glass w-full max-w-sm p-8 rounded-[2rem] text-center shadow-2xl backdrop-blur-xl bg-white/40 border border-brand-forest/30 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-forest/5 to-transparent pointer-events-none" />

            <motion.div variants={itemVariants} className="flex justify-center mb-6">
              <div className="w-24 h-24 relative">
                <svg viewBox="0 0 96 96" fill="none" className="w-full h-full">
                  {/* Sage glow behind */}
                  <motion.circle
                    cx="48" cy="48" r="44"
                    fill="#B2D8C6"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 0.2, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  {/* Ring draws itself */}
                  <motion.circle
                    cx="48" cy="48" r="44"
                    stroke="#2D4A3E"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, ease: "easeInOut", delay: 0.2 }}
                  />
                  {/* Checkmark draws after ring */}
                  <motion.path
                    d="M30 48 L42 60 L66 36"
                    stroke="#2D4A3E"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.9, ease: "easeOut" }}
                  />
                </svg>
                {/* Celebration dots */}
                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                  <motion.div
                    key={angle}
                    className="absolute w-1.5 h-1.5 rounded-full bg-brand-sage"
                    style={{
                      top: `${50 - 56 * Math.cos((angle * Math.PI) / 180)}%`,
                      left: `${50 + 56 * Math.sin((angle * Math.PI) / 180)}%`,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 0.6, delay: 1.2 + i * 0.06 }}
                  />
                ))}
              </div>
            </motion.div>

            <motion.h2 variants={itemVariants} className="font-display text-2xl font-bold text-brand-forest mb-3 relative z-10">
              Всичко е готово, {displayName}.
            </motion.h2>

            <motion.p variants={itemVariants} className="text-stone-600 mb-8 leading-relaxed text-sm relative z-10">
              Направи първия си запис и ще видиш какво е нормално за теб днес.
            </motion.p>

            <motion.button
              variants={itemVariants}
              onClick={finish}
              className={`w-full py-4 rounded-2xl font-semibold text-lg active:scale-[0.98] transition-all relative z-10 overflow-hidden ${CTA_ACTIVE}`}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
              />
              <span className="relative z-10">Влез в дневника си</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
