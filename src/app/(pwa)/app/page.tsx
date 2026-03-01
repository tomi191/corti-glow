"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePwaStore } from "@/stores/pwa-store";
import {
  getDailyTip,
  getDailyPhaseTip,
  getDailyActions,
  getPhaseForDate,
  getPhaseInfo,
  type PhaseInfo,
  type DailyAction,
  type CyclePhase,
} from "@/lib/pwa-logic";
import { isValidDateString, getToday, getDiffDays } from "@/lib/date-utils";
import { trackPwaEvent } from "@/lib/pwa-analytics";
import {
  Sparkles,
  Heart,
  Leaf,
  Lightbulb,
  Plus,
  Eye,
  UtensilsCrossed,
  Dumbbell,
  Pill,
  Snowflake,
  Sprout,
  Sun,
  Flame,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import OnboardingWizard from "@/components/pwa/OnboardingWizard";
import AppTourModal from "@/components/pwa/AppTourModal";
import GlowRing from "@/components/pwa/GlowRing";

const PHASE_ICONS: Record<string, LucideIcon> = { Snowflake, Sprout, Sun, Leaf };

const ACTION_ICONS: Record<DailyAction["type"], { icon: LucideIcon; bg: string; color: string }> = {
  food: { icon: UtensilsCrossed, bg: "bg-brand-sage/20", color: "text-brand-forest" },
  exercise: { icon: Dumbbell, bg: "bg-brand-blush/20", color: "text-pink-500" },
  supplement: { icon: Pill, bg: "bg-brand-cream/30", color: "text-amber-600" },
};

const PHASE_LABELS: Record<string, string> = {
  menstrual: "Период",
  follicular: "Подем",
  ovulation: "Овулация",
  luteal: "Спад",
};

export default function AppDashboard() {
  const [mounted, setMounted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTour, setShowTour] = useState(false);

  const getTodayCheckIn = usePwaStore((s) => s.getTodayCheckIn);
  const getCurrentCycleDay = usePwaStore((s) => s.getCurrentCycleDay);
  const getCurrentPhaseInfo = usePwaStore((s) => s.getCurrentPhaseInfo);
  const getTodayGlowScore = usePwaStore((s) => s.getTodayGlowScore);
  const getCurrentPhase = usePwaStore((s) => s.getCurrentPhase);
  const lastPeriodDate = usePwaStore((s) => s.lastPeriodDate);
  const cycleLength = usePwaStore((s) => s.cycleLength);
  const periodDuration = usePwaStore((s) => s.periodDuration);
  const checkIns = usePwaStore((s) => s.checkIns);
  const hasSeenTour = usePwaStore((s) => s.hasSeenTour);
  const getStreak = usePwaStore((s) => s.getStreak);

  useEffect(() => setMounted(true), []);

  // Show onboarding for first-time users (or invalid data), tour after onboarding
  useEffect(() => {
    if (mounted && (!lastPeriodDate || !isValidDateString(lastPeriodDate))) {
      setShowOnboarding(true);
    } else if (mounted && !hasSeenTour) {
      setShowTour(true);
    }
  }, [mounted, lastPeriodDate, hasSeenTour]);

  if (!mounted) {
    return (
      <div className="max-w-lg mx-auto space-y-6 py-6">
        <div className="h-8 w-48 bg-white/40 rounded-xl animate-pulse" />
        <div className="flex justify-center">
          <div className="w-[200px] h-[200px] rounded-full bg-white/30 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-white/30 rounded-3xl animate-pulse" />
          <div className="h-24 bg-white/30 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Onboarding for new users
  if (showOnboarding) {
    return (
      <div className="max-w-lg mx-auto py-6">
        <OnboardingWizard onComplete={() => {
          setShowOnboarding(false);
          setShowTour(true);
        }} />
      </div>
    );
  }

  const checkIn = getTodayCheckIn();
  const glowScore = getTodayGlowScore();
  const cycleDay = getCurrentCycleDay();
  const phaseInfo = getCurrentPhaseInfo();
  const phase = getCurrentPhase();
  const hasSetup = !!lastPeriodDate;
  const cycleProgress = hasSetup ? (cycleDay / cycleLength) * 100 : 0;
  const actions = getDailyActions(phase, checkIn?.stress ?? 0);
  const streak = getStreak();

  // Loss aversion: milestones at 7, 14, 21, 30
  const nextMilestone = [7, 14, 21, 30].find((m) => streak < m && streak >= m - 1);
  const streakAtRisk = streak > 0 && !checkIn;

  // Re-engagement: days since last check-in
  const lastCheckInDate = checkIns.length > 0
    ? [...checkIns].sort((a, b) => b.date.localeCompare(a.date))[0].date
    : null;
  const daysSinceLastCheckIn = lastCheckInDate ? getDiffDays(lastCheckInDate, getToday()) : null;

  // Phase transition: detect if phase changed since last check-in
  const PHASE_TRANSITION_MESSAGES: Record<CyclePhase, string> = {
    menstrual: "Менструалната фаза започва — по-спокойно днес, тялото се нуждае от почивка.",
    follicular: "Фоликуларната фаза е тук — енергията постепенно се връща!",
    ovulation: "Овулация — обикновено най-енергичните ти дни!",
    luteal: "Лутеална фаза — нормално е да забавиш темпо.",
  };
  let phaseTransitionMsg: string | null = null;
  if (hasSetup && lastCheckInDate && daysSinceLastCheckIn && daysSinceLastCheckIn >= 1) {
    const lastPhase = getPhaseForDate(lastCheckInDate, lastPeriodDate, cycleLength, periodDuration);
    if (lastPhase && lastPhase !== phase) {
      phaseTransitionMsg = PHASE_TRANSITION_MESSAGES[phase];
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 py-6">
      {/* App Tour Modal */}
      <AnimatePresence>
        {showTour && <AppTourModal onClose={() => setShowTour(false)} />}
      </AnimatePresence>

      {/* Phase Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-1"
      >
        {hasSetup ? (
          <>
            <h1 className="text-xl font-display font-bold text-brand-forest">
              {phaseInfo.name} &middot; Ден {cycleDay}
            </h1>
            <p className="text-sm text-stone-500 mt-0.5">
              {phaseInfo.explanation}
            </p>
          </>
        ) : (
          <h1 className="text-xl font-display font-bold text-brand-forest">
            Твоят дневник
          </h1>
        )}
      </motion.div>

      {/* Phase transition banner */}
      {phaseTransitionMsg && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-brand-sage/20 to-brand-cream/20 border border-brand-sage/30 rounded-2xl px-4 py-3 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-brand-sage/30 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-brand-forest" />
          </div>
          <p className="text-xs text-stone-700 leading-relaxed font-medium">
            {phaseTransitionMsg}
          </p>
        </motion.div>
      )}

      {/* Glow Ring Section */}
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-col items-center text-center space-y-4"
      >
        <div className="relative">
          <div className="absolute -inset-4 bg-brand-forest/10 rounded-full blur-2xl animate-pulse-slow" />
          <GlowRing score={glowScore} hasCheckIn={!!checkIn} />
        </div>

        <div className="w-full max-w-xs bg-brand-forest/5 rounded-2xl p-4">
          <div className="flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-brand-forest mt-0.5 flex-shrink-0" />
            <p className="text-sm text-stone-600 leading-relaxed">
              {getDailyPhaseTip(phase)}
            </p>
          </div>
        </div>
      </motion.section>

      {/* Streak Badge */}
      {streak > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.08 }}
          className="flex items-center justify-center gap-2 py-2"
        >
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-bold text-orange-600">
            {streak} {streak === 1 ? "ден" : "поредни дни"}
          </span>
          {nextMilestone && (
            <span className="text-xs text-stone-400">
              · още {nextMilestone - streak} до {nextMilestone}!
            </span>
          )}
        </motion.div>
      )}

      {/* Streak at risk warning */}
      {streakAtRisk && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 flex items-center gap-2.5"
        >
          <Flame className="w-4 h-4 text-orange-500 flex-shrink-0" />
          <p className="text-xs text-orange-700 font-medium">
            Направи запис, за да запазиш серията от {streak} дни!
          </p>
        </motion.div>
      )}

      {/* Re-engagement banner (3+ days absent) */}
      {daysSinceLastCheckIn !== null && daysSinceLastCheckIn >= 3 && !checkIn && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-forest rounded-2xl px-5 py-4 text-white"
        >
          <p className="text-sm font-semibold">Липсваше ни! 👋</p>
          <p className="text-xs opacity-80 mt-1">
            {hasSetup
              ? `Цикълът ти е в ${PHASE_LABELS[phase] ?? phase} фаза. Запиши как си днес →`
              : `Мина${daysSinceLastCheckIn === 3 ? "ха 3 дни" : `ха ${daysSinceLastCheckIn} дни`}. Как си?`}
          </p>
        </motion.div>
      )}

      {/* Vitality & Balance Stats */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-4"
      >
        <div className="glass p-4 rounded-3xl flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-brand-sage/30 flex items-center justify-center text-brand-forest">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            {checkIn ? (
              <span className="block text-sm font-semibold">{checkIn.sleep}/10</span>
            ) : (
              <span className="block text-xs text-stone-400">Попълни днес</span>
            )}
            <span className="text-[10px] uppercase text-stone-400 font-bold">Сън</span>
          </div>
        </div>
        <div className="glass p-4 rounded-3xl flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-brand-blush/30 flex items-center justify-center text-brand-forest">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            {checkIn ? (
              <span className="block text-sm font-semibold">{Math.max(0, 100 - checkIn.stress * 10)}%</span>
            ) : (
              <span className="block text-xs text-stone-400">Попълни днес</span>
            )}
            <span className="text-[10px] uppercase text-stone-400 font-bold">Баланс</span>
          </div>
        </div>
      </motion.section>

      {/* Current Cycle Card */}
      {hasSetup ? (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-6 rounded-[2rem] space-y-5"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-forest/60 mb-1">
                Текущ цикъл
              </h3>
              <p className="text-2xl font-display font-semibold text-brand-forest">
                Ден {cycleDay}
              </p>
            </div>
            <div className="bg-white/50 px-3 py-1 rounded-full text-xs font-medium text-stone-600">
              {phase !== "menstrual" && `~${cycleLength - cycleDay + 1} дни до период`}
              {phase === "menstrual" && `Ден ${cycleDay} от менструация`}
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-3">
            <div className="h-2 w-full bg-stone-200/60 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-brand-forest rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${cycleProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-tighter">
              {(["menstrual", "follicular", "ovulation", "luteal"] as const).map((p) => (
                <span
                  key={p}
                  className={phase === p ? "text-brand-forest" : "text-stone-400"}
                >
                  {PHASE_LABELS[p]}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Button — changes based on check-in state */}
          {checkIn ? (
            <Link
              href="/app/checkin"
              className="w-full py-3.5 bg-white border border-stone-200 text-stone-600 text-base font-semibold rounded-2xl flex items-center justify-center space-x-2 active:scale-[0.98] transition-transform"
            >
              <Eye className="w-5 h-5" />
              <span>Виж / промени записа</span>
            </Link>
          ) : (
            <Link
              href="/app/checkin"
              className="w-full py-3.5 bg-brand-forest text-white text-base font-semibold rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-brand-forest/20 active:scale-[0.98] transition-transform"
            >
              <Plus className="w-5 h-5" />
              <span>Запиши симптоми</span>
            </Link>
          )}
        </motion.section>
      ) : (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-6 rounded-[2rem] text-center space-y-3"
        >
          <p className="text-sm text-stone-600">
            Въведи данни за цикъла си, за да виждаш какво е нормално за теб днес
          </p>
          <button
            onClick={() => setShowOnboarding(true)}
            className="inline-block px-6 py-3 rounded-2xl bg-brand-forest text-white text-sm font-semibold shadow-lg shadow-brand-forest/20"
          >
            Настройки
          </button>
        </motion.section>
      )}

      {/* Daily Actions — informational cards without misleading chevrons */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex justify-between items-end px-1">
          <h3 className="font-display text-base font-bold text-brand-forest">
            Действия за деня
          </h3>
        </div>

        <div className="space-y-3">
          {actions.map((action) => {
            const config = ACTION_ICONS[action.type];
            const Icon = config.icon;
            const borderColor =
              action.type === "food" ? "border-l-brand-forest"
              : action.type === "exercise" ? "border-l-brand-blush"
              : "border-l-brand-cream";

            return (
              <div
                key={action.title}
                className={`glass p-5 rounded-3xl flex items-start space-x-4 border-l-4 ${borderColor}`}
              >
                <div className={`${config.bg} p-2 rounded-xl`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-stone-800">{action.title}</h4>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Daily Tip (if check-in exists) */}
      {checkIn && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-brand-forest rounded-[2rem] p-6 text-white"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">Съвет за деня</span>
          </div>
          <p className="text-sm opacity-90 leading-relaxed">
            {getDailyTip(phase, checkIn.stress)}
          </p>
        </motion.div>
      )}

      {/* Conversion trigger: luteal phase + high stress → science card */}
      {hasSetup && phase === "luteal" && checkIn && checkIn.stress >= 6 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link
            href="/app/shop?src=dashboard_luteal"
            onClick={() => trackPwaEvent("conversion_dashboard_luteal")}
            className="block glass rounded-[2rem] p-5 space-y-2 border border-brand-sage/20 active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-brand-forest" />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-forest/60">
                Наука за фазата
              </span>
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">
              В лутеалната фаза кортизолът е естествено по-висок.{" "}
              <span className="font-semibold text-brand-forest">KSM-66 Ашваганда</span> е клинично доказана, че го намалява с до 27%.
            </p>
            <div className="flex items-center gap-1 text-xs font-semibold text-brand-forest">
              <span>Виж как работи</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
