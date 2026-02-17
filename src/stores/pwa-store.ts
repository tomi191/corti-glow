"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  type DailyCheckIn,
  type CyclePhase,
  type PhaseInfo,
  type SymptomOption,
  getCycleDay,
  getCyclePhase,
  getPhaseInfo,
  calculateGlowScore,
} from "@/lib/pwa-logic";

function getToday(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

interface PwaState {
  lastPeriodDate: string | null;
  cycleLength: number;
  periodDuration: number;
  checkIns: DailyCheckIn[];
  // Transient (not persisted)
  isBreathingOpen: boolean;
}

interface PwaActions {
  saveCheckIn: (data: {
    periodStarted: boolean;
    sleep: number;
    stress: number;
    symptoms: SymptomOption[];
  }) => void;
  setLastPeriodDate: (date: string) => void;
  setCycleLength: (length: number) => void;
  setPeriodDuration: (days: number) => void;
  openBreathing: () => void;
  closeBreathing: () => void;
}

interface PwaGetters {
  getTodayCheckIn: () => DailyCheckIn | undefined;
  getCurrentCycleDay: () => number;
  getCurrentPhase: () => CyclePhase;
  getCurrentPhaseInfo: () => PhaseInfo;
  getTodayGlowScore: () => number | null;
}

type PwaStore = PwaState & PwaActions & PwaGetters;

export const usePwaStore = create<PwaStore>()(
  persist(
    (set, get) => ({
      // State
      lastPeriodDate: null,
      cycleLength: 28,
      periodDuration: 5,
      checkIns: [],
      isBreathingOpen: false,

      // Actions
      saveCheckIn: ({ periodStarted, sleep, stress, symptoms }) => {
        const today = getToday();
        // Clamp numeric values to valid ranges
        const clampedSleep = Math.max(0, Math.min(10, Math.round(sleep)));
        const clampedStress = Math.max(0, Math.min(10, Math.round(stress)));
        const glowScore = calculateGlowScore(clampedSleep, clampedStress);

        const entry: DailyCheckIn = {
          date: today,
          periodStarted,
          sleep: clampedSleep,
          stress: clampedStress,
          symptoms,
          glowScore,
        };

        set((state) => {
          // Replace same-day entry or add new
          const filtered = state.checkIns.filter((c) => c.date !== today);
          const combined = [...filtered, entry];
          // Cap at 90 days — trim oldest entries
          const MAX_CHECKINS = 90;
          const newCheckIns =
            combined.length > MAX_CHECKINS
              ? combined
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .slice(-MAX_CHECKINS)
              : combined;

          // Auto-update lastPeriodDate if period started today
          const updates: Partial<PwaState> = { checkIns: newCheckIns };
          if (periodStarted) {
            updates.lastPeriodDate = today;
          }

          return updates;
        });
      },

      setLastPeriodDate: (date) => set({ lastPeriodDate: date }),
      setCycleLength: (length) => set({ cycleLength: length }),
      setPeriodDuration: (days) => set({ periodDuration: days }),
      openBreathing: () => set({ isBreathingOpen: true }),
      closeBreathing: () => set({ isBreathingOpen: false }),

      // Getters
      getTodayCheckIn: () => {
        const today = getToday();
        return get().checkIns.find((c) => c.date === today);
      },

      getCurrentCycleDay: () =>
        getCycleDay(get().lastPeriodDate, get().cycleLength),

      getCurrentPhase: () => {
        const day = getCycleDay(get().lastPeriodDate, get().cycleLength);
        return getCyclePhase(day, get().periodDuration);
      },

      getCurrentPhaseInfo: () => {
        const day = getCycleDay(get().lastPeriodDate, get().cycleLength);
        return getPhaseInfo(getCyclePhase(day, get().periodDuration));
      },

      getTodayGlowScore: () => {
        const checkIn = get().getTodayCheckIn();
        return checkIn ? checkIn.glowScore : null;
      },
    }),
    {
      name: "lura-pwa",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lastPeriodDate: state.lastPeriodDate,
        cycleLength: state.cycleLength,
        periodDuration: state.periodDuration,
        checkIns: state.checkIns,
        // isBreathingOpen intentionally excluded
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("PWA store rehydration failed:", error);
          // Clear corrupted data so store resets to defaults
          try {
            localStorage.removeItem("lura-pwa");
          } catch {
            // localStorage itself may be unavailable
          }
        }
      },
    }
  )
);
