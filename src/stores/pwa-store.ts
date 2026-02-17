"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  type DailyCheckIn,
  type CyclePhase,
  type PhaseInfo,
  getCycleDay,
  getCyclePhase,
  getPhaseInfo,
  calculateGlowScore,
} from "@/lib/pwa-logic";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

interface PwaState {
  lastPeriodDate: string | null;
  cycleLength: number;
  periodDuration: number;
  checkIns: DailyCheckIn[];
  onboardingCompleted: boolean;
  // Transient (not persisted)
  isBreathingOpen: boolean;
}

interface PwaActions {
  saveCheckIn: (data: {
    periodStarted: boolean;
    sleep: number;
    stress: number;
    symptoms: string[];
  }) => void;
  setLastPeriodDate: (date: string) => void;
  setCycleLength: (length: number) => void;
  setPeriodDuration: (days: number) => void;
  completeOnboarding: () => void;
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
      onboardingCompleted: false,
      isBreathingOpen: false,

      // Actions
      saveCheckIn: ({ periodStarted, sleep, stress, symptoms }) => {
        const today = getToday();
        const glowScore = calculateGlowScore(sleep, stress);

        const entry: DailyCheckIn = {
          date: today,
          periodStarted,
          sleep,
          stress,
          symptoms,
          glowScore,
        };

        set((state) => {
          // Replace same-day entry or add new
          const filtered = state.checkIns.filter((c) => c.date !== today);
          const newCheckIns = [...filtered, entry];

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
      completeOnboarding: () => set({ onboardingCompleted: true }),
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
        onboardingCompleted: state.onboardingCompleted,
        // isBreathingOpen intentionally excluded
      }),
    }
  )
);
