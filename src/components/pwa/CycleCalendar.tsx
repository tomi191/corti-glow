"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Moon,
  Sun,
  Droplets,
  CloudSun,
} from "lucide-react";
import { usePwaStore } from "@/stores/pwa-store";
import {
  type CyclePhase,
  getPhaseForDate,
  getDailyTip,
} from "@/lib/pwa-logic";
import { haptic } from "@/lib/haptics";

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

const PHASE_ICONS: Record<CyclePhase, typeof Droplets> = {
  menstrual: Droplets,
  follicular: CloudSun,
  ovulation: Sun,
  luteal: Moon,
};

// Pill background colors (more saturated for the horizontal timeline)
const PHASE_PILL_BG: Record<CyclePhase, string> = {
  menstrual: "bg-brand-blush/60",
  follicular: "bg-brand-sage/50",
  ovulation: "bg-brand-cream/70",
  luteal: "bg-orange-200/60",
};

const PHASE_PILL_ACTIVE: Record<CyclePhase, string> = {
  menstrual: "bg-brand-blush",
  follicular: "bg-brand-sage",
  ovulation: "bg-brand-cream",
  luteal: "bg-orange-300",
};

const DAY_NAMES_SHORT = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

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
  const firstDow = new Date(year, month, 1).getDay();
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

  const rows: DayInfo[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

// Build the 14-day horizontal timeline data
interface TimelineDay {
  date: string;
  dayNum: number;
  dayName: string;
  monthName: string;
  phase: CyclePhase | null;
  isToday: boolean;
  isFuture: boolean;
}

function buildTimeline(
  lastPeriodDate: string | null,
  cycleLength: number,
  periodDuration: number
): TimelineDay[] {
  const today = new Date();
  const days: TimelineDay[] = [];
  const todayStr = getToday();

  for (let offset = -7; offset <= 6; offset++) {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    days.push({
      date: dateStr,
      dayNum: d.getDate(),
      dayName: DAY_NAMES_SHORT[d.getDay()],
      monthName: MONTH_NAMES[d.getMonth()],
      phase: getPhaseForDate(dateStr, lastPeriodDate, cycleLength, periodDuration),
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr,
    });
  }
  return days;
}

// ─── Component ───

export default function CycleCalendar() {
  const router = useRouter();
  const today = getToday();
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Timeline data
  const timeline = useMemo(
    () => buildTimeline(lastPeriodDate, cycleLength, periodDuration),
    [lastPeriodDate, cycleLength, periodDuration]
  );

  // Monthly grid data
  const rows = useMemo(
    () => buildMonthGrid(viewYear, viewMonth, lastPeriodDate, cycleLength, periodDuration),
    [viewYear, viewMonth, lastPeriodDate, cycleLength, periodDuration]
  );

  // Scroll to "today" pill on mount
  useEffect(() => {
    if (scrollRef.current) {
      const todayEl = scrollRef.current.querySelector("[data-today='true']");
      if (todayEl) {
        todayEl.scrollIntoView({ inline: "center", behavior: "instant" });
      }
    }
  }, []);

  const prevMonth = useCallback(() => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }, [viewMonth]);

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }, [viewMonth]);

  const handleTimelineTap = useCallback(
    (day: TimelineDay) => {
      haptic.light();

      if (day.isToday) {
        // If tapping today while it's already selected, go to check-in
        if (selectedDay === day.date) {
          router.push("/app/checkin");
          return;
        }
      }

      setSelectedDay((prev) => (prev === day.date ? null : day.date));
    },
    [selectedDay, router]
  );

  const handleGridDayTap = useCallback(
    (cell: DayInfo) => {
      if (!cell.isCurrentMonth) return;
      if (cell.date > today) return;

      haptic.light();

      if (cell.date === today) {
        router.push("/app/checkin");
        return;
      }

      setSelectedDay((prev) => (prev === cell.date ? null : cell.date));
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

  // Selected day details
  const selectedCheckIn = selectedDay ? getCheckInForDate(selectedDay) : undefined;
  const selectedPhase = selectedDay
    ? getPhaseForDate(selectedDay, lastPeriodDate, cycleLength, periodDuration)
    : null;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* ── Horizontal Timeline ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto snap-x snap-mandatory no-scrollbar py-2 px-1 -mx-1"
        >
          {timeline.map((day) => {
            const isSelected = selectedDay === day.date;
            const checkIn = !day.isFuture ? getCheckInForDate(day.date) : undefined;
            const pillBg = day.phase
              ? isSelected
                ? PHASE_PILL_ACTIVE[day.phase]
                : PHASE_PILL_BG[day.phase]
              : "bg-stone-100";

            return (
              <button
                key={day.date}
                data-today={day.isToday ? "true" : undefined}
                onClick={() => handleTimelineTap(day)}
                className={`
                  snap-center flex-shrink-0 flex flex-col items-center gap-1
                  w-14 py-2.5 rounded-2xl transition-all duration-200
                  ${pillBg}
                  ${day.isToday ? "ring-2 ring-brand-forest ring-offset-2 ring-offset-brand-sand" : ""}
                  ${isSelected && !day.isToday ? "ring-2 ring-stone-400/50 ring-offset-1 ring-offset-brand-sand" : ""}
                  ${day.isFuture ? "opacity-40" : ""}
                  active:scale-95
                `}
                aria-label={`${day.dayNum} ${day.monthName}${day.isToday ? " — Днес" : ""}`}
              >
                <span className="text-[10px] font-medium text-stone-500 uppercase">
                  {day.dayName}
                </span>
                <span
                  className={`
                    text-lg font-bold leading-none
                    ${day.isToday ? "text-brand-forest" : "text-stone-700"}
                  `}
                >
                  {day.dayNum}
                </span>
                {/* Check-in dot */}
                {checkIn ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-forest" />
                ) : (
                  <span className="w-1.5 h-1.5" /> // spacer to keep alignment
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Selected Day Detail Card ── */}
      <AnimatePresence mode="wait">
        {selectedDay && (
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, height: 0, scale: 0.97 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="glass rounded-2xl p-4 space-y-3">
              {/* Date header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-brand-forest">
                    {selectedDay === today ? "Днес" : (() => {
                      const [y, m, d] = selectedDay.split("-").map(Number);
                      return `${d} ${MONTH_NAMES[m - 1]}`;
                    })()}
                  </p>
                  {selectedPhase && (
                    <p className="text-xs text-stone-500">
                      {PHASE_LABELS[selectedPhase]} фаза
                    </p>
                  )}
                </div>
                {selectedPhase && (
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${PHASE_PILL_BG[selectedPhase]}`}
                  >
                    {(() => {
                      const Icon = PHASE_ICONS[selectedPhase];
                      return <Icon className="w-4 h-4 text-stone-600" />;
                    })()}
                  </div>
                )}
              </div>

              {/* Check-in data or empty state */}
              {selectedCheckIn ? (
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/50 rounded-xl p-2.5 text-center">
                    <p className="text-[10px] text-stone-400 uppercase font-medium">Glow</p>
                    <p className="text-xl font-bold text-brand-forest">{selectedCheckIn.glowScore}</p>
                  </div>
                  <div className="bg-white/50 rounded-xl p-2.5 text-center">
                    <p className="text-[10px] text-stone-400 uppercase font-medium">Сън</p>
                    <p className="text-xl font-bold text-stone-700">{selectedCheckIn.sleep}<span className="text-xs font-normal text-stone-400">/10</span></p>
                  </div>
                  <div className="bg-white/50 rounded-xl p-2.5 text-center">
                    <p className="text-[10px] text-stone-400 uppercase font-medium">Стрес</p>
                    <p className="text-xl font-bold text-stone-700">{selectedCheckIn.stress}<span className="text-xs font-normal text-stone-400">/10</span></p>
                  </div>
                  {selectedCheckIn.symptoms.length > 0 && (
                    <div className="col-span-3 flex flex-wrap gap-1.5 pt-1">
                      {selectedCheckIn.symptoms.map((s) => (
                        <span
                          key={s}
                          className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : selectedDay === today ? (
                <button
                  onClick={() => router.push("/app/checkin")}
                  className="w-full py-3 bg-brand-forest text-white text-sm font-semibold rounded-xl active:scale-[0.98] transition-transform"
                >
                  Запиши деня
                </button>
              ) : (
                <p className="text-sm text-stone-400 text-center py-2">
                  Няма данни за този ден
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Phase Legend ── */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {(Object.keys(PHASE_LABELS) as CyclePhase[]).map((phase) => {
          const Icon = PHASE_ICONS[phase];
          return (
            <div
              key={phase}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${PHASE_PILL_BG[phase]}`}
            >
              <Icon className="w-3 h-3 text-stone-600" />
              <span className="text-[10px] text-stone-600 font-semibold uppercase tracking-wide">
                {PHASE_LABELS[phase]}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Monthly Calendar Grid ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="glass rounded-3xl p-4"
      >
        {/* Month header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-stone-100/60 transition-colors active:scale-95"
            aria-label="Предишен месец"
          >
            <ChevronLeft className="w-5 h-5 text-stone-600" />
          </button>
          <h2 className="text-lg font-bold text-brand-forest">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-stone-100/60 transition-colors active:scale-95"
            aria-label="Следващ месец"
          >
            <ChevronRight className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="text-center text-[10px] font-semibold text-stone-400 uppercase tracking-wide py-1">
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
                    onClick={() => handleGridDayTap(cell)}
                    disabled={!cell.isCurrentMonth || isFuture}
                    className={`
                      w-full h-11 flex items-center justify-center text-sm relative
                      ${getBandClasses(row, ci)}
                      ${!cell.isCurrentMonth ? "opacity-20" : ""}
                      ${isFuture && cell.isCurrentMonth ? "opacity-35" : ""}
                      ${cell.isCurrentMonth && !isFuture ? "cursor-pointer active:scale-90 transition-transform" : ""}
                    `}
                    aria-label={
                      isToday
                        ? "Днес — запиши деня"
                        : cell.isCurrentMonth
                          ? `${cell.dayNum} ${MONTH_NAMES[viewMonth]}`
                          : undefined
                    }
                  >
                    <span
                      className={`
                        w-8 h-8 flex items-center justify-center rounded-full text-sm
                        ${isToday ? "bg-brand-forest text-white font-bold shadow-md" : ""}
                        ${isSelected && !isToday ? "ring-2 ring-brand-forest/40" : ""}
                        ${checkIn && !isToday ? "font-semibold text-stone-800" : ""}
                      `}
                    >
                      {cell.dayNum}
                    </span>
                    {/* Check-in dot */}
                    {checkIn && !isToday && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-forest" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="glass rounded-2xl p-4 text-center"
        >
          <p className="text-[10px] text-stone-400 uppercase tracking-wide font-medium mb-1">Среден цикъл</p>
          <p className="text-2xl font-bold text-brand-forest">{cycleLength}</p>
          <p className="text-[10px] text-stone-400">дни</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="glass rounded-2xl p-4 text-center"
        >
          <p className="text-[10px] text-stone-400 uppercase tracking-wide font-medium mb-1">Следващ период</p>
          <p className="text-lg font-bold text-brand-forest">
            {nextPeriodDate ?? "\u2014"}
          </p>
        </motion.div>
      </div>

      {/* ── Дневен съвет Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="bg-brand-forest rounded-2xl p-5 text-white"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-semibold uppercase tracking-wide">Дневен съвет</span>
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
            <p className="text-lg font-semibold mb-1">Все още нямаш запис за днес</p>
            <p className="text-sm opacity-80">
              {getDailyTip(currentPhase, 3)}
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
