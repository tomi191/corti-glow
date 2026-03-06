"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  type DailyCheckIn,
  type CyclePhase,
  type PhaseInfo,
  type SymptomOption,
  type ConcernOption,
  getCycleDay,
  getCyclePhase,
  getPhaseInfo,
  calculateGlowScore,
} from "@/lib/pwa-logic";
import { getToday, formatDateStr } from "@/lib/date-utils";

interface PwaState {
  lastPeriodDate: string | null;
  cycleLength: number;
  periodDuration: number;
  checkIns: DailyCheckIn[];
  hasSeenTour: boolean;
  pushEnabled: boolean;
  iosInstallDismissed: boolean;
  userName: string | null;
  ageRange: string | null;
  concerns: ConcernOption[];
  contraception: "yes" | "no" | "unsure" | null;
  email: string | null;
  timezone: string | null;
  lastSyncedAt: string | null;
  // Transient (not persisted)
  isBreathingOpen: boolean;
  isSyncing: boolean;
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
  setUserName: (name: string) => void;
  setAgeRange: (range: string) => void;
  setConcerns: (concerns: ConcernOption[]) => void;
  setContraception: (value: "yes" | "no" | "unsure") => void;
  setEmail: (email: string) => void;
  markTourSeen: () => void;
  setPushEnabled: (enabled: boolean) => void;
  dismissIOSInstall: () => void;
  openBreathing: () => void;
  closeBreathing: () => void;
  syncWithServer: () => Promise<void>;
}

interface PwaGetters {
  getTodayCheckIn: () => DailyCheckIn | undefined;
  getYesterdayCheckIn: () => DailyCheckIn | undefined;
  getCurrentCycleDay: () => number;
  getCurrentPhase: () => CyclePhase;
  getCurrentPhaseInfo: () => PhaseInfo;
  getTodayGlowScore: () => number | null;
  getCheckInForDate: (date: string) => DailyCheckIn | undefined;
  getStreak: () => number;
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
      hasSeenTour: false,
      pushEnabled: false,
      iosInstallDismissed: false,
      userName: null,
      ageRange: null,
      concerns: [],
      contraception: null,
      email: null,
      timezone: null,
      lastSyncedAt: null,
      isBreathingOpen: false,
      isSyncing: false,

      // Actions
      saveCheckIn: ({ periodStarted, sleep, stress, symptoms }) => {
        const today = getToday();
        // Clamp numeric values to valid ranges
        const clampedSleep = Math.max(0, Math.min(10, Math.round(sleep)));
        const clampedStress = Math.max(0, Math.min(10, Math.round(stress)));
        const glowScore = calculateGlowScore(clampedSleep, clampedStress, symptoms.length);

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

        // Fire-and-forget: sync with server after check-in
        // Small delay to let Zustand persist finish first
        setTimeout(() => get().syncWithServer(), 500);
      },

      markTourSeen: () => set({ hasSeenTour: true }),
      setPushEnabled: (enabled) => set({ pushEnabled: enabled }),
      dismissIOSInstall: () => set({ iosInstallDismissed: true }),
      setLastPeriodDate: (date) => set({ lastPeriodDate: date }),
      setCycleLength: (length) => set({ cycleLength: length }),
      setPeriodDuration: (days) => set({ periodDuration: days }),
      setUserName: (name) => set({ userName: name }),
      setAgeRange: (range) => set({ ageRange: range }),
      setConcerns: (concerns) => set({ concerns }),
      setContraception: (value) => set({ contraception: value }),
      setEmail: (email) => set({ email }),
      openBreathing: () => set({ isBreathingOpen: true }),
      closeBreathing: () => set({ isBreathingOpen: false }),

      syncWithServer: async () => {
        const state = get();
        if (state.isSyncing) return;
        set({ isSyncing: true });

        const MAX_RETRIES = 3;
        const BASE_DELAY_MS = 1000; // 1s, 2s, 4s exponential backoff

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
          try {
            const currentState = get();
            const res = await fetch("/api/pwa/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                profile: {
                  lastPeriodDate: currentState.lastPeriodDate,
                  cycleLength: currentState.cycleLength,
                  periodDuration: currentState.periodDuration,
                  userName: currentState.userName,
                  ageRange: currentState.ageRange,
                  concerns: currentState.concerns,
                  contraception: currentState.contraception,
                  email: currentState.email,
                  timezone: currentState.timezone,
                  hasSeenTour: currentState.hasSeenTour,
                  pushEnabled: currentState.pushEnabled,
                  iosInstallDismissed: currentState.iosInstallDismissed,
                },
                checkIns: currentState.checkIns,
                lastSyncedAt: currentState.lastSyncedAt,
              }),
            });

            if (!res.ok) {
              throw new Error(`HTTP ${res.status}`);
            }

            const data = await res.json();
            if (!data.success) {
              throw new Error("Server returned success=false");
            }

            // Merge server response into local state
            set({
              lastPeriodDate: data.profile.lastPeriodDate,
              cycleLength: data.profile.cycleLength,
              periodDuration: data.profile.periodDuration,
              userName: data.profile.userName,
              ageRange: data.profile.ageRange,
              concerns: data.profile.concerns,
              contraception: data.profile.contraception,
              hasSeenTour: data.profile.hasSeenTour,
              pushEnabled: data.profile.pushEnabled,
              iosInstallDismissed: data.profile.iosInstallDismissed,
              checkIns: data.checkIns,
              lastSyncedAt: data.syncedAt,
              isSyncing: false,
            });
            return; // Success — exit retry loop
          } catch (err) {
            const isLastAttempt = attempt === MAX_RETRIES - 1;
            if (isLastAttempt) {
              console.warn(
                `PWA sync failed after ${MAX_RETRIES} attempts:`,
                err instanceof Error ? err.message : err
              );
              set({ isSyncing: false });
              return;
            }
            // Exponential backoff: 1s, 2s, 4s
            const delay = BASE_DELAY_MS * Math.pow(2, attempt);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }

        set({ isSyncing: false });
      },

      // Getters
      getTodayCheckIn: () => {
        const today = getToday();
        return get().checkIns.find((c) => c.date === today);
      },

      getCurrentCycleDay: () =>
        getCycleDay(get().lastPeriodDate, get().cycleLength),

      getCurrentPhase: () => {
        const day = getCycleDay(get().lastPeriodDate, get().cycleLength);
        return getCyclePhase(day, get().periodDuration, get().cycleLength);
      },

      getCurrentPhaseInfo: () => {
        const day = getCycleDay(get().lastPeriodDate, get().cycleLength);
        return getPhaseInfo(getCyclePhase(day, get().periodDuration, get().cycleLength));
      },

      getTodayGlowScore: () => {
        const checkIn = get().getTodayCheckIn();
        return checkIn ? checkIn.glowScore : null;
      },

      getCheckInForDate: (date: string) => {
        return get().checkIns.find((c) => c.date === date);
      },

      getYesterdayCheckIn: () => {
        const yd = new Date();
        yd.setDate(yd.getDate() - 1);
        return get().checkIns.find((c) => c.date === formatDateStr(yd));
      },

      getStreak: () => {
        const { checkIns } = get();
        if (checkIns.length === 0) return 0;
        const sorted = [...checkIns].map((c) => c.date).sort().reverse();
        const todayStr = getToday();
        const yd = new Date();
        yd.setDate(yd.getDate() - 1);
        const yesterdayStr = formatDateStr(yd);
        if (sorted[0] !== todayStr && sorted[0] !== yesterdayStr) return 0;
        let streak = 1;
        for (let i = 1; i < sorted.length; i++) {
          const [py, pm, pd] = sorted[i - 1].split("-").map(Number);
          const prev = new Date(py, pm - 1, pd);
          prev.setDate(prev.getDate() - 1);
          if (sorted[i] === formatDateStr(prev)) {
            streak++;
          } else {
            break;
          }
        }
        return streak;
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
        hasSeenTour: state.hasSeenTour,
        pushEnabled: state.pushEnabled,
        iosInstallDismissed: state.iosInstallDismissed,
        userName: state.userName,
        ageRange: state.ageRange,
        concerns: state.concerns,
        contraception: state.contraception,
        email: state.email,
        timezone: state.timezone,
        lastSyncedAt: state.lastSyncedAt,
        // isBreathingOpen, isSyncing intentionally excluded
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
          return;
        }
        // Auto-detect timezone on every hydration
        if (state) {
          try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (tz && tz !== state.timezone) {
              state.timezone = tz;
            }
          } catch {
            // Intl not available in rare environments
          }
        }
      },
    }
  )
);
