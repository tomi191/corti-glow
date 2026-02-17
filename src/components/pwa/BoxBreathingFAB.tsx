"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePwaStore } from "@/stores/pwa-store";
import { Wind, X } from "lucide-react";

// 4 phases x 4 seconds = 16 second cycle
const PHASE_DURATION = 4;
const CYCLE_TOTAL = 16;

const PHASES = [
  { label: "Вдишай", start: 0 },
  { label: "Задръж", start: 4 },
  { label: "Издишай", start: 8 },
  { label: "Задръж", start: 12 },
] as const;

function getBreathPhase(tick: number) {
  const pos = tick % CYCLE_TOTAL;
  if (pos < 4) return { label: PHASES[0].label, countdown: PHASE_DURATION - pos, scale: 1.5 };
  if (pos < 8) return { label: PHASES[1].label, countdown: PHASE_DURATION - (pos - 4), scale: 1.5 };
  if (pos < 12) return { label: PHASES[2].label, countdown: PHASE_DURATION - (pos - 8), scale: 1 };
  return { label: PHASES[3].label, countdown: PHASE_DURATION - (pos - 12), scale: 1 };
}

export default function BoxBreathingFAB() {
  const isOpen = usePwaStore((s) => s.isBreathingOpen);
  const openBreathing = usePwaStore((s) => s.openBreathing);
  const closeBreathing = usePwaStore((s) => s.closeBreathing);

  return (
    <>
      {/* FAB */}
      {!isOpen && (
        <motion.button
          onClick={openBreathing}
          className="fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-brand-forest text-white shadow-lg flex items-center justify-center"
          whileTap={{ scale: 0.9 }}
          animate={{ boxShadow: ["0 0 0 0 rgba(45,74,62,0.3)", "0 0 0 12px rgba(45,74,62,0)", "0 0 0 0 rgba(45,74,62,0.3)"] }}
          transition={{ duration: 3, repeat: Infinity }}
          aria-label="Дихателно упражнение"
        >
          <Wind className="w-6 h-6" />
        </motion.button>
      )}

      {/* Breathing Overlay */}
      <AnimatePresence>
        {isOpen && <BreathingOverlay onClose={closeBreathing} />}
      </AnimatePresence>
    </>
  );
}

function BreathingOverlay({ onClose }: { onClose: () => void }) {
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll while overlay is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Auto-focus close button on open
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const tryHaptic = useCallback((tick: number) => {
    if (tick % PHASE_DURATION === 0 && navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, []);

  useEffect(() => {
    tryHaptic(tick);
  }, [tick, tryHaptic]);

  const { label, countdown, scale } = getBreathPhase(tick);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-label="Дихателно упражнение"
      className="fixed inset-0 z-50 bg-brand-forest/95 flex flex-col items-center justify-center"
    >
      {/* Close button */}
      <button
        ref={closeRef}
        onClick={onClose}
        onKeyDown={(e) => {
          // Trap focus — only one interactive element
          if (e.key === "Tab") {
            e.preventDefault();
          }
        }}
        className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
        aria-label="Затвори дихателно упражнение"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Animated circle */}
      <motion.div
        className="w-40 h-40 rounded-full border-4 border-brand-sage/40 bg-brand-sage/20"
        animate={{ scale }}
        transition={{ duration: PHASE_DURATION, ease: "easeInOut" }}
      />

      {/* Label */}
      <div className="mt-10 text-center">
        <motion.p
          key={label + Math.floor(tick / PHASE_DURATION)}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white"
        >
          {label}
        </motion.p>
        <p className="text-5xl font-light text-brand-sage mt-2">
          {countdown}
        </p>
      </div>

      {/* Cycle counter */}
      <p className="absolute bottom-12 text-white/40 text-sm">
        Цикъл {Math.floor(tick / CYCLE_TOTAL) + 1}
      </p>
    </motion.div>
  );
}
