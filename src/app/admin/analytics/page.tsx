"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Activity,
  Wind,
  BarChart3,
  ShoppingCart,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────

interface AnalyticsData {
  pulse: {
    dau: number;
    totalCheckins: number;
    sosMinutes: number;
  };
  featureUsage: {
    quickCheckins: number;
    fullCheckins: number;
  };
  funnel: {
    highStressSessions: number;
    shopClicks: number;
    conversionRate: number;
  };
  dailyTrend: Array<{
    date: string;
    checkins: number;
    breathingSessions: number;
    uniqueUsers: number;
  }>;
}

type Period = "7d" | "30d" | "90d";

const PERIOD_LABELS: Record<Period, string> = {
  "7d": "7 дни",
  "30d": "30 дни",
  "90d": "90 дни",
};

// ── Main Page ──────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState<Period>("7d");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (p: Period) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/analytics/stats?period=${p}`);
      if (!res.ok) throw new Error("Грешка при зареждане на данните");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError(err instanceof Error ? err.message : "Неочаквана грешка");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(period);
  }, [period]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2D4A3E]">
            PWA Аналитика
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Поведение и ангажираност в LURA Навигатор
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex bg-white rounded-xl border border-stone-200 overflow-hidden">
            {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 text-sm font-medium transition ${
                  period === p
                    ? "bg-[#2D4A3E] text-white"
                    : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchData(period)}
            className="p-2 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition"
            aria-label="Обнови данните"
          >
            <RefreshCw className="w-4 h-4 text-stone-600" />
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-700 font-medium">{error}</p>
          <button
            onClick={() => fetchData(period)}
            className="mt-3 text-sm text-red-600 underline hover:no-underline"
          >
            Опитай отново
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && !error && <LoadingSkeleton />}

      {/* Data loaded */}
      {!isLoading && !error && data && <AnalyticsDashboard data={data} />}

      {/* Empty state */}
      {!isLoading && !error && !data && <EmptyState />}
    </div>
  );
}

// ── Dashboard Content ──────────────────────────────────────────────

function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const { pulse, featureUsage, funnel, dailyTrend } = data;

  return (
    <div className="space-y-6">
      {/* Pulse Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <PulseCard
          icon={Users}
          iconBg="bg-blue-500"
          label="Активни днес"
          value={pulse.dau}
        />
        <PulseCard
          icon={Activity}
          iconBg="bg-emerald-500"
          label="Чекини днес"
          value={pulse.totalCheckins}
        />
        <PulseCard
          icon={Wind}
          iconBg="bg-purple-500"
          label="SOS Минути"
          value={pulse.sosMinutes}
          subtitle="Спестени минути стрес"
        />
      </div>

      {/* Feature Usage + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FeatureUsageCard featureUsage={featureUsage} />
        <FunnelCard funnel={funnel} />
      </div>

      {/* Daily Trend Chart */}
      {dailyTrend.length > 0 ? (
        <DailyTrendChart data={dailyTrend} />
      ) : (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 text-center">
          <BarChart3 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500">Няма данни за тренд</p>
          <p className="text-xs text-stone-400 mt-1">
            Данните ще се появят след натрупване на дневна статистика
          </p>
        </div>
      )}
    </div>
  );
}

// ── Pulse Card ─────────────────────────────────────────────────────

function PulseCard({
  icon: Icon,
  iconBg,
  label,
  value,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  label: string;
  value: number;
  subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-stone-500">{label}</p>
          <p className="text-3xl font-bold text-stone-800 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-stone-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

// ── Feature Usage Card ─────────────────────────────────────────────

function FeatureUsageCard({
  featureUsage,
}: {
  featureUsage: AnalyticsData["featureUsage"];
}) {
  const total = featureUsage.quickCheckins + featureUsage.fullCheckins;
  const quickPct = total > 0 ? Math.round((featureUsage.quickCheckins / total) * 100) : 0;
  const fullPct = total > 0 ? 100 - quickPct : 0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
      <h3 className="font-semibold text-[#2D4A3E] mb-4">
        Използване на функции
      </h3>

      {total === 0 ? (
        <p className="text-stone-400 text-sm">Няма данни за периода</p>
      ) : (
        <div className="space-y-4">
          {/* Quick check-ins */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-stone-600">
                Бърз чекин
              </span>
              <span className="text-sm font-bold text-stone-800">
                {featureUsage.quickCheckins} ({quickPct}%)
              </span>
            </div>
            <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#B2D8C6] rounded-full transition-all duration-500"
                style={{ width: `${quickPct}%` }}
              />
            </div>
          </div>

          {/* Full check-ins */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-stone-600">
                Пълен чекин
              </span>
              <span className="text-sm font-bold text-stone-800">
                {featureUsage.fullCheckins} ({fullPct}%)
              </span>
            </div>
            <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2D4A3E] rounded-full transition-all duration-500"
                style={{ width: `${fullPct}%` }}
              />
            </div>
          </div>

          {/* Total */}
          <div className="pt-2 border-t border-stone-100">
            <p className="text-xs text-stone-400">
              Общо чекини за периода: <span className="font-bold text-stone-600">{total}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Funnel Card ────────────────────────────────────────────────────

function FunnelCard({ funnel }: { funnel: AnalyticsData["funnel"] }) {
  const steps = [
    {
      label: "Висок стрес (>6)",
      value: funnel.highStressSessions,
      color: "bg-red-100 text-red-700",
      barColor: "bg-red-400",
      widthPct: 100,
    },
    {
      label: "Клик към магазин",
      value: funnel.shopClicks,
      color: "bg-amber-100 text-amber-700",
      barColor: "bg-amber-400",
      widthPct:
        funnel.highStressSessions > 0
          ? Math.max(
              (funnel.shopClicks / funnel.highStressSessions) * 100,
              8
            )
          : 0,
    },
    {
      label: "Конверсия",
      value: `${funnel.conversionRate}%`,
      color: "bg-emerald-100 text-emerald-700",
      barColor: "bg-emerald-500",
      widthPct: Math.max(funnel.conversionRate, 8),
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart className="w-4 h-4 text-[#2D4A3E]" />
        <h3 className="font-semibold text-[#2D4A3E]">
          Кортизол &rarr; Покупка
        </h3>
      </div>

      {funnel.highStressSessions === 0 ? (
        <p className="text-stone-400 text-sm">Няма данни за периода</p>
      ) : (
        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-stone-600">{step.label}</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${step.color}`}
                >
                  {step.value}
                </span>
              </div>
              <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${step.barColor} rounded-full transition-all duration-500`}
                  style={{ width: `${step.widthPct}%` }}
                />
              </div>
            </div>
          ))}

          {/* Conversion highlight */}
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
            <span className="text-sm text-stone-500">Конверсия стрес &rarr; магазин</span>
            <span className="text-lg font-bold text-[#2D4A3E]">
              {funnel.conversionRate}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Daily Trend Chart (Pure SVG) ───────────────────────────────────

function DailyTrendChart({
  data,
}: {
  data: AnalyticsData["dailyTrend"];
}) {
  if (data.length === 0) return null;

  // Chart dimensions
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Find max value for Y scale
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.checkins, d.breathingSessions, d.uniqueUsers)),
    1
  );
  // Round up to a nice number
  const yMax = Math.ceil(maxVal * 1.15);
  const yTicks = 5;
  const yStep = yMax / yTicks;

  // Helpers
  const xScale = (i: number) =>
    padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
  const yScale = (v: number) =>
    padding.top + chartH - (v / yMax) * chartH;

  // Build polyline points
  const buildPoints = (key: "checkins" | "breathingSessions" | "uniqueUsers") =>
    data.map((d, i) => `${xScale(i)},${yScale(d[key])}`).join(" ");

  // Build area path (fill under the line)
  const buildAreaPath = (key: "checkins" | "breathingSessions" | "uniqueUsers") => {
    const points = data.map((d, i) => `${xScale(i)},${yScale(d[key])}`);
    const baseline = `${xScale(data.length - 1)},${yScale(0)} ${xScale(0)},${yScale(0)}`;
    return `${points.join(" ")} ${baseline}`;
  };

  // Format date label
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("bg-BG", { day: "numeric", month: "short" });
  };

  // Calculate how many x labels to show
  const maxLabels = 10;
  const labelStep = Math.max(1, Math.ceil(data.length / maxLabels));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h3 className="font-semibold text-[#2D4A3E]">Дневна активност</h3>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#B2D8C6]" />
            <span className="text-stone-600">Чекини</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FFC1CC]" />
            <span className="text-stone-600">Дишане</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#2D4A3E]" />
            <span className="text-stone-600">Потребители</span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[600px]"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          {Array.from({ length: yTicks + 1 }, (_, i) => {
            const y = yScale(i * yStep);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#e7e5e4"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-stone-400"
                  fontSize="11"
                >
                  {Math.round(i * yStep)}
                </text>
              </g>
            );
          })}

          {/* Area fills */}
          <polygon
            points={buildAreaPath("checkins")}
            fill="#B2D8C6"
            opacity="0.2"
          />
          <polygon
            points={buildAreaPath("breathingSessions")}
            fill="#FFC1CC"
            opacity="0.2"
          />

          {/* Lines */}
          <polyline
            points={buildPoints("checkins")}
            fill="none"
            stroke="#B2D8C6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={buildPoints("breathingSessions")}
            fill="none"
            stroke="#FFC1CC"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={buildPoints("uniqueUsers")}
            fill="none"
            stroke="#2D4A3E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 3"
          />

          {/* Data points */}
          {data.map((d, i) => (
            <g key={i}>
              <circle
                cx={xScale(i)}
                cy={yScale(d.checkins)}
                r="3"
                fill="#B2D8C6"
                stroke="white"
                strokeWidth="1.5"
              />
              <circle
                cx={xScale(i)}
                cy={yScale(d.breathingSessions)}
                r="3"
                fill="#FFC1CC"
                stroke="white"
                strokeWidth="1.5"
              />
              <circle
                cx={xScale(i)}
                cy={yScale(d.uniqueUsers)}
                r="2.5"
                fill="#2D4A3E"
                stroke="white"
                strokeWidth="1.5"
              />
            </g>
          ))}

          {/* X-axis labels */}
          {data.map((d, i) =>
            i % labelStep === 0 ? (
              <text
                key={i}
                x={xScale(i)}
                y={height - 8}
                textAnchor="middle"
                className="fill-stone-400"
                fontSize="11"
              >
                {formatDate(d.date)}
              </text>
            ) : null
          )}
        </svg>
      </div>
    </div>
  );
}

// ── Loading Skeleton ───────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Pulse cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-stone-200 rounded" />
                <div className="h-8 w-16 bg-stone-200 rounded" />
              </div>
              <div className="w-10 h-10 bg-stone-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Feature + Funnel skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100"
          >
            <div className="h-5 w-40 bg-stone-200 rounded mb-4" />
            <div className="space-y-3">
              <div className="h-3 w-full bg-stone-200 rounded-full" />
              <div className="h-3 w-3/4 bg-stone-200 rounded-full" />
              <div className="h-3 w-1/2 bg-stone-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
        <div className="h-5 w-36 bg-stone-200 rounded mb-4" />
        <div className="h-[200px] bg-stone-100 rounded-xl" />
      </div>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl p-12 shadow-sm border border-stone-100 text-center">
      <BarChart3 className="w-16 h-16 text-stone-300 mx-auto mb-4" />
      <h2 className="text-lg font-semibold text-stone-700 mb-2">
        Все още няма данни
      </h2>
      <p className="text-stone-400 max-w-md mx-auto">
        Данните ще се появят тук, когато потребителите започнат да използват LURA Навигатор (PWA приложението).
      </p>
    </div>
  );
}
