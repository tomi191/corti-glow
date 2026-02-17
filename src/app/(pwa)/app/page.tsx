"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePwaStore } from "@/stores/pwa-store";
import {
  getGreeting,
  getDailyTip,
  getDailyActions,
  type PhaseInfo,
  type DailyAction,
} from "@/lib/pwa-logic";
import {
  Sparkles,
  Heart,
  Leaf,
  Plus,
  Eye,
  UtensilsCrossed,
  Dumbbell,
  Pill,
  Snowflake,
  Sprout,
  Sun,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import OnboardingWizard from "@/components/pwa/OnboardingWizard";
import AppTourModal from "@/components/pwa/AppTourModal";

const PHASE_ICONS: Record<string, LucideIcon> = { Snowflake, Sprout, Sun, Leaf };

const ACTION_ICONS: Record<DailyAction["type"], { icon: LucideIcon; bg: string; color: string }> = {
  food: { icon: UtensilsCrossed, bg: "bg-brand-sage/20", color: "text-brand-forest" },
  exercise: { icon: Dumbbell, bg: "bg-brand-blush/20", color: "text-pink-500" },
  supplement: { icon: Pill, bg: "bg-brand-cream/30", color: "text-amber-600" },
};

const PHASE_LABELS: Record<string, string> = {
  menstrual: "Менструална",
  follicular: "Фоликуларна",
  ovulation: "Овулация",
  luteal: "Лутеална",
};

export default function AppDashboard() {
  const { user, isLoaded: clerkLoaded } = useUser();
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
  const hasSeenTour = usePwaStore((s) => s.hasSeenTour);

  useEffect(() => setMounted(true), []);

  // Show onboarding for first-time users, tour after onboarding
  useEffect(() => {
    if (mounted && !lastPeriodDate) {
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

  const firstName = clerkLoaded ? (user?.firstName || "там") : null;
  const checkIn = getTodayCheckIn();
  const glowScore = getTodayGlowScore();
  const cycleDay = getCurrentCycleDay();
  const phaseInfo = getCurrentPhaseInfo();
  const phase = getCurrentPhase();
  const hasSetup = !!lastPeriodDate;
  const cycleProgress = hasSetup ? (cycleDay / cycleLength) * 100 : 0;
  const actions = getDailyActions(phase);

  return (
    <div className="max-w-lg mx-auto space-y-6 py-6">
      {/* App Tour Modal */}
      <AnimatePresence>
        {showTour && <AppTourModal onClose={() => setShowTour(false)} />}
      </AnimatePresence>

      {/* Greeting Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-1"
      >
        <h1 className="text-xl font-display font-bold text-brand-forest">
          {getGreeting()}{firstName ? `, ${firstName}` : ""}!
        </h1>
        {hasSetup && (
          <p className="text-sm text-stone-500 mt-0.5">
            {PHASE_LABELS[phase]} фаза &middot; Ден {cycleDay}
          </p>
        )}
      </motion.div>

      {/* Glow Ring Section */}
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-col items-center text-center space-y-4"
      >
        <div className="relative">
          <div className="absolute -inset-4 bg-brand-forest/10 rounded-full blur-2xl animate-pulse-slow" />
          {checkIn ? (
            <div className="glow-ring">
              <div className="z-10 text-center">
                <span className="block text-4xl font-display font-bold text-brand-forest">
                  {glowScore ?? 0}
                </span>
                <span className="text-xs font-medium uppercase tracking-widest text-brand-forest/60">
                  Glow Score
                </span>
              </div>
            </div>
          ) : (
            <Link href="/app/checkin" className="block">
              <div className="glow-ring">
                <div className="z-10 text-center">
                  <Sparkles className="w-7 h-7 text-brand-sage mx-auto mb-1" />
                  <span className="block text-base font-bold text-brand-forest">Чек-Ін</span>
                  <span className="text-[10px] text-brand-forest/50">Натисни тук</span>
                </div>
              </div>
            </Link>
          )}
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-brand-forest font-display">
            {phaseInfo.name}
          </h2>
          <p className="text-sm text-stone-500">
            {phaseInfo.description}
          </p>
        </div>
      </motion.section>

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
            <span className="block text-sm font-semibold">
              {checkIn ? `${checkIn.sleep}/10` : "\u2014"}
            </span>
            <span className="text-[10px] uppercase text-stone-400 font-bold">Сън</span>
          </div>
        </div>
        <div className="glass p-4 rounded-3xl flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-brand-blush/30 flex items-center justify-center text-brand-forest">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-sm font-semibold">
              {checkIn ? `${Math.max(0, 100 - checkIn.stress * 10)}%` : "\u2014"}
            </span>
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
              className="w-full py-4 bg-white border border-stone-200 text-stone-600 font-semibold rounded-2xl flex items-center justify-center space-x-2 active:scale-[0.98] transition-transform"
            >
              <Eye className="w-5 h-5" />
              <span>Виж / промени чек-ин</span>
            </Link>
          ) : (
            <Link
              href="/app/checkin"
              className="w-full py-4 bg-brand-forest text-white font-semibold rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-brand-forest/20 active:scale-[0.98] transition-transform"
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
            Настрой цикъла си за персонализирана информация
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
          <h3 className="font-display text-xl font-bold text-brand-forest">
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
            <span className="text-sm font-semibold uppercase tracking-wide">Glow Insight</span>
          </div>
          <p className="text-sm opacity-90 leading-relaxed">
            {getDailyTip(phase, checkIn.stress)}
          </p>
        </motion.div>
      )}
    </div>
  );
}
