"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { usePwaStore } from "@/stores/pwa-store";
import {
  type CyclePhase,
  getPhaseForDate,
  getDailyTip,
} from "@/lib/pwa-logic";

// ─── Constants ───

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

const MONTH_NAMES = [
  "Януари", "Февруари", "Март", "Април", "Май", "Юни",
  "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември",
];

const PHASE_BG: Record<CyclePhase, string> = {
  menstrual: "bg-brand-blush/20",
  follicular: "bg-brand-sage/20",
  ovulation: "bg-brand-cream/40",
  luteal: "bg-orange-200/30",
};

const PHASE_DOT: Record<CyclePhase, string> = {
  menstrual: "bg-brand-blush",
  follicular: "bg-brand-sage",
  ovulation: "bg-brand-cream",
  luteal: "bg-orange-300",
};

const PHASE_LABELS: Record<CyclePhase, string> = {
  menstrual: "Менструална",
  follicular: "Фоликуларна",
  ovulation: "Овулация",
  luteal: "Лутеална",
};

// ─── Helpers ───

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

interface DayInfo {
  date: string;
  dayNum: number;
  isCurrentMonth: boolean;
  phase: CyclePhase | null;
}

function buildMonthGrid(
  year: number,
  month: number,
  lastPeriodDate: string | null,
  cycleLength: number,
  periodDuration: number
): DayInfo[][] {
  // First day of month (0=Sun)
  const firstDow = new Date(year, month, 1).getDay();
  // Shift to Mon=0 … Sun=6
  const startOffset = (firstDow + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: DayInfo[] = [];

  // Previous month fill
  for (let i = startOffset - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    const date = formatDateStr(y, m, day);
    cells.push({
      date,
      dayNum: day,
      isCurrentMonth: false,
      phase: getPhaseForDate(date, lastPeriodDate, cycleLength, periodDuration),
    });
  }

  // Current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = formatDateStr(year, month, day);
    cells.push({
      date,
      dayNum: day,
      isCurrentMonth: true,
      phase: getPhaseForDate(date, lastPeriodDate, cycleLength, periodDuration),
    });
  }

  // Next month fill to complete last row
  const remainder = cells.length % 7;
  if (remainder > 0) {
    const fill = 7 - remainder;
    const nm = month === 11 ? 0 : month + 1;
    const ny = month === 11 ? year + 1 : year;
    for (let day = 1; day <= fill; day++) {
      const date = formatDateStr(ny, nm, day);
      cells.push({
        date,
        dayNum: day,
        isCurrentMonth: false,
        phase: getPhaseForDate(date, lastPeriodDate, cycleLength, periodDuration),
      });
    }
  }

  // Split into rows of 7
  const rows: DayInfo[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

// ─── Component ───

export default function CycleCalendar() {
  const router = useRouter();
  const today = getToday();

  const lastPeriodDate = usePwaStore((s) => s.lastPeriodDate);
  const cycleLength = usePwaStore((s) => s.cycleLength);
  const periodDuration = usePwaStore((s) => s.periodDuration);
  const getCheckInForDate = usePwaStore((s) => s.getCheckInForDate);
  const getCurrentPhase = usePwaStore((s) => s.getCurrentPhase);
  const getTodayGlowScore = usePwaStore((s) => s.getTodayGlowScore);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const rows = useMemo(
    () => buildMonthGrid(viewYear, viewMonth, lastPeriodDate, cycleLength, periodDuration),
    [viewYear, viewMonth, lastPeriodDate, cycleLength, periodDuration]
  );

  const prevMonth = useCallback(() => {
    setSelectedDay(null);
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }, [viewMonth]);

  const nextMonth = useCallback(() => {
    setSelectedDay(null);
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }, [viewMonth]);

  const handleDayTap = useCallback(
    (day: DayInfo) => {
      if (!day.isCurrentMonth) return;
      if (day.date > today) return; // future

      if (day.date === today) {
        router.push("/app/checkin");
        return;
      }

      // Toggle tooltip for past days
      setSelectedDay((prev) => (prev === day.date ? null : day.date));
    },
    [today, router]
  );

  // Phase band rounding per row
  function getBandClasses(row: DayInfo[], colIdx: number): string {
    const cell = row[colIdx];
    if (!cell.phase) return "";

    const bg = PHASE_BG[cell.phase];
    const prevPhase = colIdx > 0 ? row[colIdx - 1].phase : null;
    const nextPhase = colIdx < 6 ? row[colIdx + 1].phase : null;
    const isStart = cell.phase !== prevPhase;
    const isEnd = cell.phase !== nextPhase;

    if (isStart && isEnd) return `${bg} rounded-full`;
    if (isStart) return `${bg} rounded-l-full`;
    if (isEnd) return `${bg} rounded-r-full`;
    return bg;
  }

  // Stats
  const nextPeriodDate = useMemo(() => {
    if (!lastPeriodDate) return null;
    const [y, m, d] = lastPeriodDate.split("-").map(Number);
    const start = new Date(y, m - 1, d);
    start.setDate(start.getDate() + cycleLength);
    return `${start.getDate()} ${MONTH_NAMES[start.getMonth()]}`;
  }, [lastPeriodDate, cycleLength]);

  // Glow insight
  const currentPhase = getCurrentPhase();
  const todayScore = getTodayGlowScore();

  // Selected day check-in details
  const selectedCheckIn = selectedDay ? getCheckInForDate(selectedDay) : undefined;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Calendar Card */}
      <div className="bg-white/40 rounded-3xl p-4 border border-stone-100">
        {/* Month header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-stone-100 transition-colors"
            aria-label="Предишен месец"
          >
            <ChevronLeft className="w-5 h-5 text-stone-600" />
          </button>
          <h2 className="text-lg font-bold text-brand-forest">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-stone-100 transition-colors"
            aria-label="Следващ месец"
          >
            <ChevronRight className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="text-center text-xs font-medium text-stone-400 py-1">
              {wd}
            </div>
          ))}
        </div>

        {/* Day grid */}
        {rows.map((row, ri) => (
          <div key={ri} className="grid grid-cols-7">
            {row.map((cell, ci) => {
              const isToday = cell.date === today;
              const isFuture = cell.date > today;
              const isSelected = selectedDay === cell.date;
              const checkIn = !isFuture && cell.isCurrentMonth ? getCheckInForDate(cell.date) : undefined;

              return (
                <div key={cell.date} className="relative">
                  <button
                    onClick={() => handleDayTap(cell)}
                    disabled={!cell.isCurrentMonth || isFuture}
                    className={`
                      w-full h-12 flex items-center justify-center text-sm relative
                      ${getBandClasses(row, ci)}
                      ${!cell.isCurrentMonth ? "opacity-30" : ""}
                      ${isFuture && cell.isCurrentMonth ? "opacity-40" : ""}
                      ${cell.isCurrentMonth && !isFuture ? "cursor-pointer active:scale-95 transition-transform" : ""}
                    `}
                    aria-label={
                      isToday
                        ? "Днес — отвори чек-ин"
                        : cell.isCurrentMonth
                          ? `${cell.dayNum} ${MONTH_NAMES[viewMonth]}`
                          : undefined
                    }
                  >
                    <span
                      className={`
                        w-8 h-8 flex items-center justify-center rounded-full text-sm
                        ${isToday ? "ring-2 ring-brand-forest ring-offset-2 font-bold text-brand-forest" : ""}
                        ${checkIn && !isToday ? "font-semibold" : ""}
                      `}
                    >
                      {cell.dayNum}
                    </span>
                    {/* Check-in dot — bigger for visibility */}
                    {checkIn && !isToday && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[5px] h-[5px] rounded-full bg-brand-forest" />
                    )}
                  </button>

                  {/* Detailed Tooltip for past days */}
                  {isSelected && checkIn && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20">
                      <div className="bg-brand-forest text-white text-xs px-4 py-3 rounded-xl shadow-lg whitespace-nowrap space-y-1">
                        <p className="font-bold text-sm">Glow Score: {checkIn.glowScore}</p>
                        <p>Сън: {checkIn.sleep}/10</p>
                        <p>Стрес: {checkIn.stress}/10</p>
                        {checkIn.symptoms.length > 0 && (
                          <p className="max-w-[180px] whitespace-normal">
                            {checkIn.symptoms.join(", ")}
                          </p>
                        )}
                      </div>
                      {/* Triangle pointer */}
                      <div className="w-0 h-0 mx-auto border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-brand-forest" />
                    </div>
                  )}
                  {isSelected && !checkIn && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 pointer-events-none">
                      <div className="bg-stone-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                        Няма чек-ин
                      </div>
                      <div className="w-0 h-0 mx-auto border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-stone-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Phase Legend */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {(Object.keys(PHASE_LABELS) as CyclePhase[]).map((phase) => (
          <div key={phase} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${PHASE_DOT[phase]}`} />
            <span className="text-xs text-stone-500 uppercase tracking-wide">
              {PHASE_LABELS[phase]}
            </span>
          </div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/60 rounded-2xl p-4 border border-stone-100 text-center">
          <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">Среден цикъл</p>
          <p className="text-2xl font-bold text-brand-forest">{cycleLength}</p>
          <p className="text-xs text-stone-400">дни</p>
        </div>
        <div className="bg-white/60 rounded-2xl p-4 border border-stone-100 text-center">
          <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">Следващ период</p>
          <p className="text-lg font-bold text-brand-forest">
            {nextPeriodDate ?? "\u2014"}
          </p>
        </div>
      </div>

      {/* Glow Insight Card */}
      <div className="bg-brand-forest rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">Glow Insight</span>
        </div>
        {todayScore !== null ? (
          <>
            <p className="text-3xl font-bold mb-1">{todayScore}</p>
            <p className="text-sm opacity-80">
              {getDailyTip(currentPhase, usePwaStore.getState().getTodayCheckIn()?.stress ?? 3)}
            </p>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold mb-1">Все още нямаш чек-ин днес</p>
            <p className="text-sm opacity-80">
              {getDailyTip(currentPhase, 3)}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
