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
  Calendar,
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

// ─── SVG Chart Helpers ───

/**
 * Attempt a smooth monotone-ish curve through points.
 * Uses cubic bezier with control points that avoid overshooting.
 */
function buildSmoothPath(
  points: { x: number; y: number }[]
): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;

  let d = `M${points[0].x},${points[0].y}`;

  if (points.length === 2) {
    d += `L${points[1].x},${points[1].y}`;
    return d;
  }

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Catmull-Rom to Bezier control points (tension = 0 for smooth)
    const tension = 0.3;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += `C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }

  return d;
}

/**
 * Build area path (smooth line + close to bottom).
 */
function buildAreaPath(
  points: { x: number; y: number }[],
  bottomY: number,
  startX: number,
  endX: number
): string {
  if (points.length === 0) return "";
  const linePath = buildSmoothPath(points);
  return `${linePath}L${endX},${bottomY}L${startX},${bottomY}Z`;
}

// ─── GlowChart Component ───

interface GlowChartProps {
  data: (number | null)[]; // 7 values (or null for missing)
  labels: string[];
  maxValue: number;
  color: string; // hex color for the line/gradient
  glowColor: string; // hex color for the glow
  unit?: string;
}

function GlowChart({ data, labels, maxValue, color, glowColor }: GlowChartProps) {
  const width = 300;
  const height = 120;
  const padX = 24;
  const padTop = 12;
  const padBottom = 24;
  const chartW = width - padX * 2;
  const chartH = height - padTop - padBottom;

  // Build points only for non-null data
  const points: { x: number; y: number; index: number }[] = [];
  data.forEach((val, i) => {
    if (val !== null) {
      const x = padX + (i / (data.length - 1)) * chartW;
      const yNorm = Math.max(0, Math.min(val / maxValue, 1));
      const y = padTop + chartH * (1 - yNorm);
      points.push({ x, y, index: i });
    }
  });

  const linePath = buildSmoothPath(points);
  const areaPath = points.length >= 2
    ? buildAreaPath(points, padTop + chartH, points[0].x, points[points.length - 1].x)
    : "";

  const gradientId = `grad-${color.replace("#", "")}`;
  const glowFilterId = `glow-${color.replace("#", "")}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* Area fill gradient */}
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
        {/* Glow filter */}
        <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
        </filter>
      </defs>

      {/* Subtle horizontal gridlines */}
      {[0.25, 0.5, 0.75].map((frac) => {
        const y = padTop + chartH * (1 - frac);
        return (
          <line
            key={frac}
            x1={padX}
            y1={y}
            x2={width - padX}
            y2={y}
            stroke="currentColor"
            className="text-stone-200"
            strokeWidth="0.5"
            strokeDasharray="3 3"
          />
        );
      })}

      {/* Area fill */}
      {areaPath && (
        <motion.path
          d={areaPath}
          fill={`url(#${gradientId})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
      )}

      {/* Glow line (blurred duplicate) */}
      {linePath && (
        <motion.path
          d={linePath}
          fill="none"
          stroke={glowColor}
          strokeWidth="6"
          strokeLinecap="round"
          filter={`url(#${glowFilterId})`}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
        />
      )}

      {/* Main line */}
      {linePath && (
        <motion.path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
        />
      )}

      {/* Data dots */}
      {points.map((pt, i) => (
        <motion.circle
          key={pt.index}
          cx={pt.x}
          cy={pt.y}
          r="3.5"
          fill="white"
          stroke={color}
          strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 + i * 0.08 }}
        />
      ))}

      {/* Day labels */}
      {labels.map((label, i) => {
        const x = padX + (i / (labels.length - 1)) * chartW;
        const isToday = i === labels.length - 1;
        return (
          <text
            key={i}
            x={x}
            y={height - 4}
            textAnchor="middle"
            className={isToday ? "fill-brand-forest" : "fill-stone-400"}
            fontSize="9"
            fontWeight={isToday ? "700" : "500"}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Stagger Animation Container ───

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

// ─── Component ───

export default function InsightsPage() {
  const [mounted, setMounted] = useState(false);
  const checkIns = usePwaStore((s) => s.checkIns);
  const getCurrentPhase = usePwaStore((s) => s.getCurrentPhase);
  const lastPeriodDate = usePwaStore((s) => s.lastPeriodDate);
  const cycleLength = usePwaStore((s) => s.cycleLength);
  const periodDuration = usePwaStore((s) => s.periodDuration);

  useEffect(() => setMounted(true), []);

  const phase = getCurrentPhase();
  const last7Days = useMemo(() => getLast7Days(), []);
  const dayLabels = useMemo(() => last7Days.map(getDayLabel), [last7Days]);

  const last7CheckIns = useMemo(
    () => last7Days.map((date) => ({
      date,
      checkIn: checkIns.find((c) => c.date === date),
    })),
    [last7Days, checkIns]
  );

  // Chart data arrays (null for missing days)
  const sleepData = useMemo(
    () => last7CheckIns.map(({ checkIn }) => (checkIn ? checkIn.sleep : null)),
    [last7CheckIns]
  );
  const stressData = useMemo(
    () => last7CheckIns.map(({ checkIn }) => (checkIn ? checkIn.stress : null)),
    [last7CheckIns]
  );
  const glowData = useMemo(
    () => last7CheckIns.map(({ checkIn }) => (checkIn ? checkIn.glowScore : null)),
    [last7CheckIns]
  );

  const trend = useMemo(() => getGlowScoreTrend(checkIns), [checkIns]);
  const insights = useMemo(
    () => generateWeeklyInsights(checkIns, phase, { lastPeriodDate, cycleLength, periodDuration }),
    [checkIns, phase, lastPeriodDate, cycleLength, periodDuration]
  );
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
        <div className="h-48 bg-white/30 rounded-3xl animate-pulse" />
        <div className="h-48 bg-white/30 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-32 bg-white/30 rounded-3xl animate-pulse" />
          <div className="h-32 bg-white/30 rounded-3xl animate-pulse" />
        </div>
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

      {/* Empty / Not Enough Data */}
      {!hasData ? (
        <EmptyState />
      ) : !hasEnough ? (
        <NotEnoughState count={checkIns.length} target={MIN_CHECKINS} />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="space-y-5"
        >
          {/* ─── Hero: Glow Score Card with Chart ─── */}
          <motion.section
            variants={staggerItem}
            className="relative overflow-hidden rounded-[2rem] p-6 text-white"
            style={{ background: "linear-gradient(135deg, #2D4A3E 0%, #3A6355 50%, #2D4A3E 100%)" }}
          >
            {/* Decorative glow orb */}
            <div
              className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20 pointer-events-none"
              style={{ background: "radial-gradient(circle, #B2D8C6 0%, transparent 70%)" }}
            />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">
                    Сияние — 7 дни
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
                  <p className="text-[11px] opacity-50 mt-0.5">
                    {trend.direction === "up" && "Подобрение спрямо миналата седмица"}
                    {trend.direction === "down" && "Спад спрямо миналата седмица"}
                    {trend.direction === "same" && "Стабилно спрямо миналата седмица"}
                    {trend.change === null && "Тази седмица"}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>

              {/* Glow Score Area Chart */}
              <div className="mt-2 -mx-1">
                <GlowChart
                  data={glowData}
                  labels={dayLabels}
                  maxValue={100}
                  color="#B2D8C6"
                  glowColor="#B2D8C6"
                />
              </div>
            </div>
          </motion.section>

          {/* ─── Summary Stat Pills ─── */}
          <motion.section
            variants={staggerItem}
            className="grid grid-cols-4 gap-2"
          >
            <StatPill
              icon={<Moon className="w-3.5 h-3.5 text-indigo-400" />}
              label="Сън"
              value={avgSleep !== null ? `${avgSleep}` : "\u2014"}
              sub="/10"
            />
            <StatPill
              icon={<Zap className="w-3.5 h-3.5 text-amber-400" />}
              label="Стрес"
              value={avgStress !== null ? `${avgStress}` : "\u2014"}
              sub="/10"
            />
            <StatPill
              icon={<Flame className="w-3.5 h-3.5 text-orange-400" />}
              label="Серия"
              value={`${streak}`}
              sub={streak === 1 ? "ден" : "дни"}
            />
            <StatPill
              icon={<Calendar className="w-3.5 h-3.5 text-brand-forest" />}
              label="Записи"
              value={`${checkIns.length}`}
              sub="общо"
            />
          </motion.section>

          {/* ─── Sleep Chart ─── */}
          <motion.section variants={staggerItem}>
            <ChartCard
              title="Качество на съня"
              icon={<Moon className="w-4 h-4 text-indigo-400" />}
              value={avgSleep}
              unit="/10"
              description={
                avgSleep !== null && avgSleep >= 7
                  ? "Добро ниво на сън"
                  : avgSleep !== null && avgSleep >= 5
                    ? "Може да е по-добре"
                    : avgSleep !== null
                      ? "Виж съветите за сън"
                      : null
              }
            >
              <GlowChart
                data={sleepData}
                labels={dayLabels}
                maxValue={10}
                color="#818CF8"
                glowColor="#818CF8"
              />
            </ChartCard>
          </motion.section>

          {/* ─── Stress Chart ─── */}
          <motion.section variants={staggerItem}>
            <ChartCard
              title="Ниво на стрес"
              icon={<Zap className="w-4 h-4 text-amber-400" />}
              value={avgStress}
              unit="/10"
              description={
                avgStress !== null && avgStress <= 3
                  ? "Нисък \u2014 добре си"
                  : avgStress !== null && avgStress <= 6
                    ? "Умерен стрес"
                    : avgStress !== null
                      ? "Висок \u2014 виж дихателното"
                      : null
              }
            >
              <GlowChart
                data={stressData}
                labels={dayLabels}
                maxValue={10}
                color="#FBBF24"
                glowColor="#FBBF24"
              />
            </ChartCard>
          </motion.section>

          {/* ─── Smart Insights ─── */}
          {insights.length > 0 && (
            <motion.section variants={staggerItem} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-forest/60 px-1">
                За теб тази седмица
              </h3>
              {insights.map((insight, i) => {
                const config = INSIGHT_ICONS[insight.type];
                const Icon = config.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.08 }}
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
                  </motion.div>
                );
              })}
            </motion.section>
          )}

          {/* ─── Top Symptoms ─── */}
          {topSymptoms.length > 0 && (
            <motion.section
              variants={staggerItem}
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
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, #2D4A3E, #B2D8C6)`,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: 0.1 }}
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
              variants={staggerItem}
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
                  {streak >= 7 ? "Вече е навик." : streak >= 3 ? "Добър ритъм, продължавай." : "Добро начало."}
                </span>
              </div>
              <Flame className={`w-5 h-5 ${streak >= 7 ? "text-orange-500" : "text-stone-300"}`} />
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ─── Chart Card Wrapper ───

function ChartCard({
  title,
  icon,
  value,
  unit,
  description,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  value: number | null;
  unit: string;
  description: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-[2rem] p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-bold uppercase tracking-widest text-stone-500">
            {title}
          </span>
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className="text-xl font-bold text-brand-forest">
            {value ?? "\u2014"}
          </span>
          <span className="text-xs text-stone-400">{unit}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="-mx-1">{children}</div>

      {description && (
        <p className="text-[11px] text-stone-400 text-right">{description}</p>
      )}
    </div>
  );
}

// ─── Stat Pill ───

function StatPill({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="glass rounded-2xl p-3 flex flex-col items-center gap-1.5 text-center">
      {icon}
      <div>
        <span className="text-lg font-bold text-brand-forest leading-none">{value}</span>
        <span className="text-[10px] text-stone-400 ml-0.5">{sub}</span>
      </div>
      <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">{label}</span>
    </div>
  );
}

// ─── Empty State ───

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="bg-brand-forest/5 border border-brand-forest/10 rounded-[2rem] p-6 space-y-5">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-brand-sage/30 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7 text-brand-forest" />
          </div>
          <h2 className="text-lg font-display font-bold text-brand-forest">
            Тук ще виждаш какво е нормално за теб
          </h2>
          <p className="text-sm text-stone-500 leading-relaxed">
            След няколко записа ще видиш тенденции в съня и стреса,
            свързани с фазите на цикъла ти. Без гадаене — с данни.
          </p>
        </div>

        {/* What you'll see preview */}
        <div className="space-y-2">
          {[
            "Седмичен обзор с тренд",
            "Практични съвети за твоята фаза",
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
          Направи първи запис
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Not Enough Data ───

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
            Още малко данни
          </h2>
          <p className="text-sm text-stone-500">
            Още {target - count} {target - count === 1 ? "запис" : "записа"} и ще видиш пълния анализ.
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
            "Тренд с \u2191/\u2193 сравнение по седмици",
            "Практични препоръки за твоята фаза",
            "Анализ на повтарящите се симптоми",
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
          Запиши деня
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
