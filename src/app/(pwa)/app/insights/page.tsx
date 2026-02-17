"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { usePwaStore } from "@/stores/pwa-store";
import {
  generateWeeklyInsights,
  getGlowScoreTrend,
  type DailyCheckIn,
  type SymptomOption,
} from "@/lib/pwa-logic";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Moon,
  Zap,
  Flame,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

// ─── Helpers ───

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
  return ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"][date.getDay()];
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
  limit = 4
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

const MIN_CHECKINS = 3;

const INSIGHT_ICONS = {
  positive: { icon: CheckCircle2, bg: "bg-emerald-100", color: "text-emerald-600" },
  warning: { icon: AlertTriangle, bg: "bg-amber-100", color: "text-amber-600" },
  neutral: { icon: Lightbulb, bg: "bg-blue-100", color: "text-blue-600" },
};

// ─── Component ───

export default function InsightsPage() {
  const [mounted, setMounted] = useState(false);
  const checkIns = usePwaStore((s) => s.checkIns);
  const getCurrentPhase = usePwaStore((s) => s.getCurrentPhase);

  useEffect(() => setMounted(true), []);

  const phase = getCurrentPhase();
  const last7Days = useMemo(() => getLast7Days(), []);

  const last7CheckIns = useMemo(
    () => last7Days.map((date) => ({
      date,
      checkIn: checkIns.find((c) => c.date === date),
    })),
    [last7Days, checkIns]
  );

  const trend = useMemo(() => getGlowScoreTrend(checkIns), [checkIns]);
  const insights = useMemo(() => generateWeeklyInsights(checkIns, phase), [checkIns, phase]);
  const streak = useMemo(() => getCheckInStreak(checkIns), [checkIns]);
  const topSymptoms = useMemo(() => getTopSymptoms(checkIns), [checkIns]);

  const avgSleep = useMemo(() => {
    const withData = checkIns.filter((c) => c.sleep > 0);
    if (!withData.length) return null;
    return +(withData.reduce((s, c) => s + c.sleep, 0) / withData.length).toFixed(1);
  }, [checkIns]);

  const avgStress = useMemo(() => {
    const withData = checkIns.filter((c) => c.stress >= 0);
    if (!withData.length) return null;
    return +(withData.reduce((s, c) => s + c.stress, 0) / withData.length).toFixed(1);
  }, [checkIns]);

  if (!mounted) {
    return (
      <div className="max-w-lg mx-auto space-y-6 py-6">
        <div className="h-8 w-48 bg-white/40 rounded-xl animate-pulse" />
        <div className="h-40 bg-white/30 rounded-3xl animate-pulse" />
        <div className="h-48 bg-white/30 rounded-3xl animate-pulse" />
      </div>
    );
  }

  const hasData = checkIns.length > 0;
  const hasEnough = checkIns.length >= MIN_CHECKINS;

  return (
    <div className="max-w-lg mx-auto space-y-5 py-6">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-2xl font-bold text-brand-forest"
      >
        Твоят обзор
      </motion.h1>

      {/* ─── Empty / Not Enough Data ─── */}
      {!hasData ? (
        <EmptyState />
      ) : !hasEnough ? (
        <NotEnoughState count={checkIns.length} target={MIN_CHECKINS} />
      ) : (
        <>
          {/* ─── Hero: Glow Score Trend ─── */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-brand-forest rounded-[2rem] p-6 text-white"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">
                  Среден Glow Score
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-display font-bold">
                    {trend.current ?? "\u2014"}
                  </span>
                  {trend.change !== null && (
                    <span className={`flex items-center gap-1 text-sm font-semibold ${
                      trend.direction === "up" ? "text-emerald-300"
                      : trend.direction === "down" ? "text-red-300"
                      : "text-white/60"
                    }`}>
                      {trend.direction === "up" && <TrendingUp className="w-4 h-4" />}
                      {trend.direction === "down" && <TrendingDown className="w-4 h-4" />}
                      {trend.direction === "same" && <Minus className="w-4 h-4" />}
                      {trend.change > 0 ? "+" : ""}{trend.change}
                    </span>
                  )}
                </div>
                <p className="text-xs opacity-60 mt-1">
                  {trend.direction === "up" && "Подобрение спрямо миналата седмица"}
                  {trend.direction === "down" && "Спад спрямо миналата седмица"}
                  {trend.direction === "same" && "Стабилно спрямо миналата седмица"}
                  {trend.change === null && "Тази седмица"}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>

            {/* Mini chart */}
            <div className="flex items-end gap-1.5 h-16">
              {last7CheckIns.map(({ date, checkIn: ci }) => {
                const score = ci?.glowScore ?? 0;
                const heightPct = ci ? Math.max(score, 8) : 0;
                const isToday = date === getToday();
                return (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end" style={{ height: "48px" }}>
                      <motion.div
                        className={`w-full rounded-t-md ${ci ? "bg-white/30" : "bg-white/10"}`}
                        initial={{ height: 0 }}
                        animate={{ height: `${ci ? heightPct : 8}%` }}
                        transition={{ duration: 0.5, delay: 0.02 }}
                      />
                    </div>
                    <span className={`text-[9px] font-bold ${isToday ? "text-white" : "opacity-40"}`}>
                      {getDayLabel(date)}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.section>

          {/* ─── Smart Insights ─── */}
          {insights.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-forest/60 px-1">
                За теб тази седмица
              </h3>
              {insights.map((insight, i) => {
                const config = INSIGHT_ICONS[insight.type];
                const Icon = config.icon;
                return (
                  <div
                    key={i}
                    className="glass p-4 rounded-2xl flex items-start gap-3"
                  >
                    <div className={`${config.bg} p-2 rounded-xl flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-800">{insight.title}</p>
                      <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </motion.section>
          )}

          {/* ─── Sleep & Stress ─── */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="glass p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-bold uppercase text-stone-400">Среден сън</span>
              </div>
              <p className="text-2xl font-bold text-brand-forest">{avgSleep ?? "\u2014"}<span className="text-sm font-normal text-stone-400">/10</span></p>
              <p className="text-[11px] text-stone-400 mt-1">
                {avgSleep !== null && avgSleep >= 7 ? "Добро ниво" : avgSleep !== null && avgSleep >= 5 ? "Може да е по-добре" : avgSleep !== null ? "Нужна е повече грижа" : ""}
              </p>
            </div>
            <div className="glass p-4 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-bold uppercase text-stone-400">Среден стрес</span>
              </div>
              <p className="text-2xl font-bold text-brand-forest">{avgStress ?? "\u2014"}<span className="text-sm font-normal text-stone-400">/10</span></p>
              <p className="text-[11px] text-stone-400 mt-1">
                {avgStress !== null && avgStress <= 3 ? "Спокойна си" : avgStress !== null && avgStress <= 6 ? "Умерен стрес" : avgStress !== null ? "Висок — внимавай" : ""}
              </p>
            </div>
          </motion.section>

          {/* ─── Top Symptoms ─── */}
          {topSymptoms.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass p-5 rounded-[2rem] space-y-4"
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-forest/60">
                Най-чести симптоми
              </h3>
              <div className="space-y-3">
                {topSymptoms.map(({ symptom, count, pct }) => (
                  <div key={symptom} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-stone-700">{symptom}</span>
                      <span className="text-xs text-stone-400">
                        {count}x &middot; {pct}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-stone-200/60 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-brand-forest/60 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* ─── Streak ─── */}
          {streak > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass p-4 rounded-2xl flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1">
                <span className="block text-lg font-bold text-brand-forest">
                  {streak} {streak === 1 ? "ден" : "дни"} подред
                </span>
                <span className="text-xs text-stone-400">
                  {streak >= 7 ? "Невероятен стрийк!" : streak >= 3 ? "Добър ритъм, продължавай!" : "Страхотно начало!"}
                </span>
              </div>
              <Flame className={`w-5 h-5 ${streak >= 7 ? "text-orange-500" : "text-stone-300"}`} />
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Sub-components ───

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Preview card */}
      <div className="bg-brand-forest/5 border border-brand-forest/10 rounded-[2rem] p-6 space-y-5">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-brand-sage/30 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7 text-brand-forest" />
          </div>
          <h2 className="text-lg font-display font-bold text-brand-forest">
            Тук ще видиш как се чувстваш
          </h2>
          <p className="text-sm text-stone-500 leading-relaxed">
            След няколко чек-ина ще получиш персонализиран анализ — тенденции в съня,
            стреса и симптомите ти, свързани с фазите на цикъла.
          </p>
        </div>

        {/* What you'll see preview */}
        <div className="space-y-2">
          {[
            "Седмичен Glow Score с тренд",
            "Персонализирани съвети за теб",
            "Кои симптоми се повтарят и кога",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2.5 text-sm text-stone-600">
              <div className="w-5 h-5 rounded-full bg-brand-sage/30 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-3 h-3 text-brand-forest" />
              </div>
              {item}
            </div>
          ))}
        </div>

        <Link
          href="/app/checkin"
          className="w-full py-3.5 bg-brand-forest text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-brand-forest/20 active:scale-[0.98] transition-transform"
        >
          Направи първи чек-ин
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}

function NotEnoughState({ count, target }: { count: number; target: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="glass p-6 rounded-[2rem] space-y-5">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-brand-sage/20 flex items-center justify-center mx-auto">
            <TrendingUp className="w-7 h-7 text-brand-forest" />
          </div>
          <h2 className="text-lg font-display font-bold text-brand-forest">
            Почти сме там!
          </h2>
          <p className="text-sm text-stone-500">
            Още {target - count} {target - count === 1 ? "чек-ин" : "чек-ина"} и ще отключиш пълния анализ.
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-brand-forest">{count} от {target}</span>
            <span className="text-stone-400">{Math.round((count / target) * 100)}%</span>
          </div>
          <div className="h-3 w-full bg-stone-200/60 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-brand-forest rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(count / target) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* What's coming */}
        <div className="space-y-2 pt-1">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400">
            Какво ще отключиш
          </p>
          {[
            "Тренд на Glow Score с ↑/↓ сравнение",
            "Персонализирани препоръки за теб",
            "Анализ на най-честите ти симптоми",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2.5 text-sm text-stone-500">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-sage flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>

        <Link
          href="/app/checkin"
          className="w-full py-3.5 bg-brand-forest text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-brand-forest/20 active:scale-[0.98] transition-transform"
        >
          Направи чек-ин
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
