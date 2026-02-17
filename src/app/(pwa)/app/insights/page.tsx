"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { usePwaStore } from "@/stores/pwa-store";
import { TrendingUp, Moon, Zap, Flame, Activity } from "lucide-react";
import type { DailyCheckIn, SymptomOption } from "@/lib/pwa-logic";

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getLast7Days(): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    days.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    );
  }
  return days;
}

function getDayLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const dayNames = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  return dayNames[date.getDay()];
}

function getCheckInStreak(checkIns: DailyCheckIn[]): number {
  const sorted = [...checkIns].sort((a, b) => b.date.localeCompare(a.date));
  const now = new Date();

  let streak = 0;
  for (let i = 0; i < 90; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (sorted.find((c) => c.date === dateStr)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function getTopSymptoms(
  checkIns: DailyCheckIn[],
  limit = 5
): { symptom: SymptomOption; count: number; pct: number }[] {
  const counts = new Map<SymptomOption, number>();
  const total = checkIns.length || 1;

  for (const ci of checkIns) {
    for (const s of ci.symptoms) {
      counts.set(s, (counts.get(s) || 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([symptom, count]) => ({ symptom, count, pct: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

const MIN_CHECKINS_FOR_INSIGHTS = 3;

export default function InsightsPage() {
  const [mounted, setMounted] = useState(false);
  const checkIns = usePwaStore((s) => s.checkIns);

  useEffect(() => setMounted(true), []);

  const last7Days = useMemo(() => getLast7Days(), []);

  const last7CheckIns = useMemo(
    () =>
      last7Days.map((date) => ({
        date,
        checkIn: checkIns.find((c) => c.date === date),
      })),
    [last7Days, checkIns]
  );

  const avgSleep = useMemo(() => {
    const withData = checkIns.filter((c) => c.sleep > 0);
    if (!withData.length) return null;
    return (withData.reduce((s, c) => s + c.sleep, 0) / withData.length).toFixed(1);
  }, [checkIns]);

  const avgStress = useMemo(() => {
    const withData = checkIns.filter((c) => c.stress >= 0);
    if (!withData.length) return null;
    return (withData.reduce((s, c) => s + c.stress, 0) / withData.length).toFixed(1);
  }, [checkIns]);

  const streak = useMemo(() => getCheckInStreak(checkIns), [checkIns]);
  const topSymptoms = useMemo(() => getTopSymptoms(checkIns), [checkIns]);

  if (!mounted) {
    return (
      <div className="max-w-lg mx-auto space-y-6 py-6">
        <div className="h-8 w-32 bg-white/40 rounded-xl animate-pulse" />
        <div className="h-48 bg-white/30 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-white/30 rounded-3xl animate-pulse" />
          <div className="h-24 bg-white/30 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  const hasData = checkIns.length > 0;
  const hasEnoughData = checkIns.length >= MIN_CHECKINS_FOR_INSIGHTS;

  return (
    <div className="max-w-lg mx-auto space-y-6 py-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-2xl font-bold text-brand-forest"
      >
        Анализ
      </motion.h1>

      {!hasData ? (
        /* No data at all */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-[2rem] text-center space-y-3"
        >
          <Activity className="w-12 h-12 text-stone-300 mx-auto" />
          <p className="text-stone-500">
            Все още нямаш чек-ини. Направи първия си, за да видиш графики и трендове тук.
          </p>
        </motion.div>
      ) : !hasEnoughData ? (
        /* Not enough data for meaningful insights */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-[2rem] text-center space-y-4"
        >
          <Activity className="w-12 h-12 text-brand-sage mx-auto" />
          <div className="space-y-2">
            <p className="text-brand-forest font-semibold">
              {checkIns.length} от {MIN_CHECKINS_FOR_INSIGHTS} чек-ина
            </p>
            <div className="h-2 w-32 bg-stone-200/60 rounded-full overflow-hidden mx-auto">
              <motion.div
                className="h-full bg-brand-forest rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(checkIns.length / MIN_CHECKINS_FOR_INSIGHTS) * 100}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <p className="text-sm text-stone-500">
              Направи поне {MIN_CHECKINS_FOR_INSIGHTS} чек-ина, за да видиш тенденции и анализи.
            </p>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Glow Score Chart (last 7 days) */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-5 rounded-[2rem] space-y-4"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-forest" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-forest/60">
                Glow Score (7 дни)
              </h3>
            </div>

            <div className="flex items-end justify-between gap-2 h-32">
              {last7CheckIns.map(({ date, checkIn: ci }) => {
                const score = ci?.glowScore ?? 0;
                const heightPct = ci ? Math.max(score, 5) : 0;
                const isToday = date === getToday();
                return (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1">
                    {ci && (
                      <span className="text-[10px] font-semibold text-stone-500">
                        {score}
                      </span>
                    )}
                    <div className="w-full flex items-end" style={{ height: "100px" }}>
                      <motion.div
                        className={`w-full rounded-t-lg ${
                          ci
                            ? score >= 70
                              ? "bg-brand-sage"
                              : score >= 40
                                ? "bg-brand-cream"
                                : "bg-brand-blush"
                            : "bg-stone-200"
                        }`}
                        initial={{ height: 0 }}
                        animate={{ height: `${ci ? heightPct : 8}%` }}
                        transition={{ duration: 0.6, delay: 0.05 }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-bold ${
                        isToday ? "text-brand-forest" : "text-stone-400"
                      }`}
                    >
                      {getDayLabel(date)}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.section>

          {/* Stats Grid */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="glass p-4 rounded-3xl text-center">
              <Moon className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
              <span className="block text-xl font-bold text-brand-forest">
                {avgSleep ?? "\u2014"}
              </span>
              <span className="text-[10px] uppercase text-stone-400 font-bold">
                Среден сън
              </span>
            </div>
            <div className="glass p-4 rounded-3xl text-center">
              <Zap className="w-5 h-5 text-amber-400 mx-auto mb-2" />
              <span className="block text-xl font-bold text-brand-forest">
                {avgStress ?? "\u2014"}
              </span>
              <span className="text-[10px] uppercase text-stone-400 font-bold">
                Среден стрес
              </span>
            </div>
          </motion.section>

          {/* Check-in Streak */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass p-5 rounded-3xl flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <span className="block text-xl font-bold text-brand-forest">
                {streak} {streak === 1 ? "ден" : "дни"}
              </span>
              <span className="text-xs text-stone-400 uppercase font-bold tracking-wide">
                Чек-ин стрийк
              </span>
            </div>
          </motion.div>

          {/* Top Symptoms */}
          {topSymptoms.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass p-5 rounded-[2rem] space-y-4"
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-forest/60">
                Топ симптоми
              </h3>
              <div className="space-y-3">
                {topSymptoms.map(({ symptom, pct }) => (
                  <div key={symptom} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-stone-700">{symptom}</span>
                      <span className="text-stone-400 text-xs">{pct}%</span>
                    </div>
                    <div className="h-2 w-full bg-stone-200/60 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-brand-forest/70 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </>
      )}
    </div>
  );
}
