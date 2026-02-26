"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePwaStore } from "@/stores/pwa-store";
import { trackPwaEvent } from "@/lib/pwa-analytics";
import { Wind, X } from "lucide-react";

// 4 phases x 4 seconds = 16 second cycle
const PHASE_DURATION = 4;
const CYCLE_TOTAL = 16;

const PHASES = [
  { label: "Вдишай", scale: 1.4 },   // expand
  { label: "Задръж", scale: 1.4 },    // hold big
  { label: "Издишай", scale: 0.85 },  // contract
  { label: "Задръж", scale: 0.85 },   // hold small
] as const;

// Cycle-specific motivational texts (Bulgarian)
const BREATHING_TEXTS = [
  "Уравновесяваме кислорода в тялото... Нервната система започва да се успокоява.",
  "Кортизолът намалява. Тялото минава в режим на възстановяване.",
  "Сърдечният ритъм се стабилизира. Дишането е твоят инструмент.",
  "Пълно спокойствие. Продължи колкото желаеш.",
  "Вече си в зоната. Всеки вдих подсилва ефекта.",
];

// Visual transformation: stress → calm per cycle
const CYCLE_COLORS = [
  "#FFC1CC", // Cycle 1: blush (stress)
  "#E2D0C1", // Cycle 2: warm (settling)
  "#B2D8C6", // Cycle 3: sage (calm)
  "#8FBFAA", // Cycle 4+: deep sage (deep calm)
];

const CYCLE_RADII = [
  "40% 60% 70% 30% / 40% 50% 60% 50%",       // Cycle 1: chaotic/stressed
  "42% 58% 55% 45% / 43% 57% 48% 52%",       // Cycle 2: settling
  "44% 56% 52% 48% / 45% 55% 46% 54%",       // Cycle 3: almost smooth
  "48% 52% 50% 50% / 49% 51% 49% 51%",       // Cycle 4+: nearly perfect circle
];

function getBreathPhase(tick: number) {
  const pos = tick % CYCLE_TOTAL;
  const phaseIndex = Math.min(Math.floor(pos / PHASE_DURATION), 3);
  const phase = PHASES[phaseIndex];
  const countdown = PHASE_DURATION - (pos - phaseIndex * PHASE_DURATION);
  const cycles = Math.floor(tick / CYCLE_TOTAL) + 1;
  const visualIndex = Math.min(cycles - 1, 3);
  const textIndex = Math.min(cycles - 1, 4);
  const cycleColor = CYCLE_COLORS[visualIndex];
  const cycleRadius = CYCLE_RADII[visualIndex];
  const cycleText = BREATHING_TEXTS[textIndex];
  return { ...phase, phaseIndex, countdown, cycles, cycleColor, cycleRadius, cycleText, textIndex };
}

// Floating particles — fixed values (no hydration mismatch since overlay is client-only)
const PARTICLES = [
  { size: 3, x1: -60, y1: -80, x2: 50, y2: 70, dur: 12, op: 0.25 },
  { size: 2, x1: 70, y1: -50, x2: -40, y2: 90, dur: 15, op: 0.2 },
  { size: 4, x1: -80, y1: 40, x2: 60, y2: -60, dur: 18, op: 0.15 },
  { size: 2, x1: 50, y1: 70, x2: -70, y2: -40, dur: 14, op: 0.3 },
  { size: 3, x1: -30, y1: -90, x2: 80, y2: 30, dur: 16, op: 0.2 },
  { size: 2, x1: 90, y1: 20, x2: -50, y2: -80, dur: 20, op: 0.18 },
];

export default function BoxBreathingFAB() {
  const isOpen = usePwaStore((s) => s.isBreathingOpen);
  const openBreathing = usePwaStore((s) => s.openBreathing);
  const closeBreathing = usePwaStore((s) => s.closeBreathing);

  return (
    <>
      {/* FAB */}
      {!isOpen && (
        <motion.button
          onClick={() => {
            openBreathing();
            trackPwaEvent("breathing_started");
          }}
          className="fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-brand-forest text-white shadow-lg flex items-center justify-center"
          whileTap={{ scale: 0.9 }}
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(45,74,62,0.3)",
              "0 0 0 12px rgba(45,74,62,0)",
              "0 0 0 0 rgba(45,74,62,0.3)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          aria-label="Дихателно упражнение"
        >
          <Wind className="w-6 h-6" />
        </motion.button>
      )}

      {/* Breathing Overlay */}
      <AnimatePresence>
        {isOpen && <BreathingOverlay onClose={(cycles: number, seconds: number) => {
          trackPwaEvent("breathing_finished", {
            cycles,
            duration_seconds: seconds,
          });
          closeBreathing();
        }} />}
      </AnimatePresence>
    </>
  );
}

// ─── Premium Breathing Overlay ───

function BreathingOverlay({ onClose }: { onClose: (cycles: number, seconds: number) => void }) {
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Auto-focus close button
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // Tick timer
  useEffect(() => {
    intervalRef.current = setInterval(() => setTick((t) => t + 1), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Haptic on phase transitions
  const tryHaptic = useCallback((t: number) => {
    if (t % PHASE_DURATION === 0 && navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, []);

  useEffect(() => {
    tryHaptic(tick);
  }, [tick, tryHaptic]);

  const { label, countdown, scale, phaseIndex, cycles, cycleColor, cycleRadius, cycleText, textIndex } = getBreathPhase(tick);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      role="dialog"
      aria-label="Дихателно упражнение"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* ── Dark organic background ── */}
      <div className="absolute inset-0 bg-[#1a2e26]">
        {/* Ambient color blob — top left */}
        <motion.div
          className="absolute -top-[20%] -left-[20%] w-[70%] h-[60%] rounded-full blur-[100px]"
          animate={{ backgroundColor: cycleColor }}
          transition={{ duration: 1, ease: "easeInOut" }}
          style={{ opacity: 0.08 }}
        />
        {/* Ambient color blob — bottom right */}
        <motion.div
          className="absolute -bottom-[20%] -right-[20%] w-[60%] h-[50%] rounded-full blur-[90px]"
          animate={{ backgroundColor: cycleColor }}
          transition={{ duration: 1, ease: "easeInOut" }}
          style={{ opacity: 0.06 }}
        />
      </div>

      {/* SVG noise grain */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.03] mix-blend-overlay"
        aria-hidden="true"
      >
        <filter id="breath-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#breath-noise)" />
      </svg>

      {/* Close button (glass) */}
      <button
        ref={closeRef}
        onClick={() => onClose(getBreathPhase(tick).cycles, tick)}
        onKeyDown={(e) => {
          if (e.key === "Tab") e.preventDefault();
        }}
        className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
        aria-label="Затвори дихателно упражнение"
      >
        <X className="w-5 h-5" />
      </button>

      {/* ── Central breathing visualization ── */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Layer 1: Outer aura (largest, most blurred) */}
        <motion.div
          className="absolute"
          style={{ width: 280, height: 280, filter: "blur(60px)", willChange: "transform, filter" }}
          animate={{ scale, backgroundColor: cycleColor, borderRadius: cycleRadius, opacity: 0.25 }}
          transition={{
            scale: { duration: PHASE_DURATION, ease: "easeInOut" },
            backgroundColor: { duration: 1, ease: "easeInOut" },
            borderRadius: { duration: 1, ease: "easeInOut" },
            opacity: { duration: PHASE_DURATION, ease: "easeInOut" },
          }}
        />

        {/* Layer 2: Middle glow */}
        <motion.div
          className="absolute"
          style={{ width: 200, height: 200, filter: "blur(30px)", willChange: "transform, filter" }}
          animate={{ scale, backgroundColor: cycleColor, borderRadius: cycleRadius, opacity: 0.4 }}
          transition={{
            scale: { duration: PHASE_DURATION, ease: "easeInOut" },
            backgroundColor: { duration: 1, ease: "easeInOut" },
            borderRadius: { duration: 1, ease: "easeInOut" },
            opacity: { duration: PHASE_DURATION, ease: "easeInOut" },
          }}
        />

        {/* Layer 3: Core blob */}
        <motion.div
          className="absolute shadow-2xl"
          style={{ width: 150, height: 150 }}
          animate={{ scale, backgroundColor: cycleColor, borderRadius: cycleRadius }}
          transition={{
            scale: { duration: PHASE_DURATION, ease: "easeInOut" },
            backgroundColor: { duration: 1, ease: "easeInOut" },
            borderRadius: { duration: 1, ease: "easeInOut" },
          }}
        />

        {/* Layer 4: Inner highlight */}
        <motion.div
          className="absolute rounded-full bg-white/10"
          style={{ width: 60, height: 60, filter: "blur(12px)" }}
          animate={{ scale }}
          transition={{ duration: PHASE_DURATION, ease: "easeInOut" }}
        />

        {/* Floating particles */}
        {PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{ width: p.size, height: p.size }}
            animate={{
              x: [p.x1, p.x2, p.x1],
              y: [p.y1, p.y2, p.y1],
              opacity: [0, p.op, 0],
            }}
            transition={{
              duration: p.dur,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* ── Phase text + countdown ── */}
      <div className="absolute bottom-[28%] left-0 right-0 text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={`${phaseIndex}-${Math.floor(tick / PHASE_DURATION)}`}
            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.4 }}
            className="text-2xl font-display font-bold text-white/90"
          >
            {label}
          </motion.p>
        </AnimatePresence>

        <motion.p
          className="text-6xl font-extralight text-white/50 mt-3 tabular-nums"
          key={`cd-${tick}`}
          initial={{ opacity: 0.3, scale: 1.1 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {countdown}
        </motion.p>

        {/* Cycle motivational text */}
        <div className="mt-4 h-12 flex items-start justify-center px-8">
          <AnimatePresence mode="wait">
            <motion.p
              key={`text-${textIndex}`}
              initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
              animate={{ opacity: 0.45, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(3px)" }}
              transition={{ duration: 0.6 }}
              className="text-sm text-white text-center leading-relaxed max-w-[280px]"
            >
              {cycleText}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Phase indicator dots */}
      <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-2">
        {PHASES.map((p, i) => (
          <motion.div
            key={i}
            className="h-1.5 rounded-full"
            animate={{
              width: i === phaseIndex ? 20 : 6,
              backgroundColor: i === phaseIndex ? cycleColor : "rgba(255,255,255,0.2)",
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Cycle counter */}
      <p className="absolute bottom-8 left-0 right-0 text-center text-white/30 text-xs font-medium tracking-wider uppercase">
        Цикъл {cycles}
      </p>
    </motion.div>
  );
}
