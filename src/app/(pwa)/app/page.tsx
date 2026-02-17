"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePwaStore } from "@/stores/pwa-store";
import { getGreeting, getDailyTip, type PhaseInfo } from "@/lib/pwa-logic";
import {
  Sparkles, Wind, Lightbulb, CalendarDays,
  Snowflake, Sprout, Sun, Leaf,
} from "lucide-react";

const PHASE_ICONS = { Snowflake, Sprout, Sun, Leaf } as const;

function PhaseIcon({ info, className }: { info: PhaseInfo; className?: string }) {
  const Icon = PHASE_ICONS[info.iconName];
  return <Icon className={className} />;
}

export default function AppDashboard() {
  const { user, isLoaded: clerkLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  const getTodayCheckIn = usePwaStore((s) => s.getTodayCheckIn);
  const getCurrentCycleDay = usePwaStore((s) => s.getCurrentCycleDay);
  const getCurrentPhaseInfo = usePwaStore((s) => s.getCurrentPhaseInfo);
  const getTodayGlowScore = usePwaStore((s) => s.getTodayGlowScore);
  const getCurrentPhase = usePwaStore((s) => s.getCurrentPhase);
  const lastPeriodDate = usePwaStore((s) => s.lastPeriodDate);
  const cycleLength = usePwaStore((s) => s.cycleLength);
  const periodDuration = usePwaStore((s) => s.periodDuration);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="h-8 w-48 bg-stone-200 rounded animate-pulse" />
        <div className="h-48 bg-stone-100 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-32 bg-stone-100 rounded-2xl animate-pulse" />
          <div className="h-32 bg-stone-100 rounded-2xl animate-pulse" />
        </div>
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

  // Next period prediction
  const daysUntilNextPeriod = hasSetup ? cycleLength - cycleDay + 1 : null;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-brand-forest">
          {getGreeting()},{" "}
          {firstName !== null ? (
            <>{firstName}!</>
          ) : (
            <span className="inline-block h-6 w-20 bg-stone-200 rounded animate-pulse align-middle" />
          )}
        </h1>
        {hasSetup && (
          <p className="text-stone-500 mt-1 flex items-center gap-1">
            {phase === "menstrual"
              ? `Период: Ден ${cycleDay} от ${periodDuration}`
              : `Ден ${cycleDay} от ${cycleLength}`}
            {" "}&middot;{" "}
            <PhaseIcon info={phaseInfo} className="w-4 h-4 inline" />
            {" "}{phaseInfo.season}
          </p>
        )}
      </motion.div>

      {/* Glow Ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex justify-center"
      >
        <GlowRing score={glowScore} hasCheckIn={!!checkIn} />
      </motion.div>

      {/* Setup prompt if no period date */}
      {!hasSetup && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-stone-100 p-4 text-center"
        >
          <p className="text-sm text-stone-600 mb-3">
            Настрой цикъла си, за да виждаш персонализирана информация
          </p>
          <Link
            href="/app/settings"
            className="inline-block px-6 py-2 rounded-full bg-brand-forest text-white text-sm font-semibold"
          >
            Настройки
          </Link>
        </motion.div>
      )}

      {/* Bento Grid */}
      {hasSetup && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3"
        >
          {/* Cycle Phase Card */}
          <div className="bg-white rounded-2xl border border-stone-100 p-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${phaseInfo.colorClass}`}>
              <PhaseIcon info={phaseInfo} className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-stone-800">
              {phaseInfo.name}
            </p>
            <p className="text-xs text-stone-500 mt-0.5">
              {phase === "menstrual"
                ? `Ден ${cycleDay} от ${periodDuration}`
                : phaseInfo.season}
            </p>
          </div>

          {/* Cortisol Status Card */}
          <div className="bg-white rounded-2xl border border-stone-100 p-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-cream/50 mb-2">
              <Wind className="w-5 h-5 text-amber-700" />
            </div>
            {checkIn ? (
              <>
                <p className="text-sm font-semibold text-stone-800">
                  Стрес: {checkIn.stress}/10
                </p>
                <div className="mt-1.5 h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(checkIn.stress / 10) * 100}%`,
                      background: `hsl(${Math.round(120 - (checkIn.stress / 10) * 120)}, 70%, 50%)`,
                    }}
                  />
                </div>
              </>
            ) : (
              <p className="text-xs text-stone-500">
                Направи чек-ин за статус
              </p>
            )}
          </div>

          {/* Next Period Prediction */}
          {daysUntilNextPeriod !== null && phase !== "menstrual" && (
            <div className="col-span-2 bg-white rounded-2xl border border-stone-100 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-blush/30">
                <CalendarDays className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-800">
                  Следващ период след ~{daysUntilNextPeriod} дни
                </p>
                <p className="text-xs text-stone-500">Приблизителна прогноза</p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Daily Tip */}
      {hasSetup && checkIn && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-stone-100 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-brand-forest" />
            <span className="text-sm font-semibold text-brand-forest">
              Съвет за деня
            </span>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">
            {getDailyTip(phase, checkIn.stress)}
          </p>
        </motion.div>
      )}
    </div>
  );
}

// ─── Glow Ring Component ───

function GlowRing({
  score,
  hasCheckIn,
}: {
  score: number | null;
  hasCheckIn: boolean;
}) {
  const size = 180;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Color based on score
  function getScoreColor(s: number) {
    if (s >= 70) return "#B2D8C6"; // sage
    if (s >= 40) return "#F4E3B2"; // cream
    return "#FFC1CC"; // blush
  }

  if (!hasCheckIn) {
    return (
      <Link href="/app/checkin" className="block">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="rotate-[-90deg]" role="img" aria-label="Направи дневен чек-ин">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#e7e5e4"
              strokeWidth={strokeWidth}
            />
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#B2D8C6"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * 0.75}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Sparkles className="w-6 h-6 text-brand-sage mb-1" />
            <span className="text-base font-bold text-brand-forest">
              Чек-Ин
            </span>
            <span className="text-xs text-stone-400">Натисни тук</span>
          </div>
        </div>
      </Link>
    );
  }

  const displayScore = score ?? 0;
  const fraction = displayScore / 100;
  const offset = circumference * (1 - fraction);
  const color = getScoreColor(displayScore);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]" role="img" aria-label={`Glow Score: ${displayScore} от 100`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e7e5e4"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-bold text-brand-forest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {displayScore}
        </motion.span>
        <span className="text-xs text-stone-500">Glow Score</span>
      </div>
    </div>
  );
}
