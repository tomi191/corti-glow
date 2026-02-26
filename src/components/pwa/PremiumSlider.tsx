"use client";

import { useRef, useCallback, useState } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

interface PremiumSliderProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  /** Color at min end (CSS color) */
  colorFrom?: string;
  /** Color at max end (CSS color) */
  colorTo?: string;
  /** Accessible label */
  label: string;
}

const THUMB_SIZE = 28;
const TRACK_HEIGHT = 6;
const HIT_AREA_HEIGHT = 44; // a11y min touch target

/**
 * Premium drag slider with spring physics, gradient fill, and haptic feedback.
 * Replaces <input type="range"> with a tactile, organic feel.
 */
export default function PremiumSlider({
  value,
  onChange,
  min = 0,
  max = 10,
  colorFrom = "#B2D8C6", // brand-sage
  colorTo = "#2D4A3E", // brand-forest
  label,
}: PremiumSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastSnappedValue = useRef(value);

  // Fraction 0→1
  const fraction = (value - min) / (max - min);

  // Motion values for thumb position (pixels)
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 500, damping: 35 });

  // Track "bulge" effect — the track inflates slightly where the thumb is
  const bulge = useTransform(springX, (v) => {
    if (!trackRef.current) return TRACK_HEIGHT;
    const width = trackRef.current.offsetWidth;
    const center = width / 2;
    const distance = Math.abs(v - center) / center;
    return isDragging ? TRACK_HEIGHT + 4 * (1 - distance) : TRACK_HEIGHT;
  });

  // Interpolated color based on value
  const currentColor = interpolateColor(colorFrom, colorTo, fraction);

  // Haptic feedback
  const vibrate = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, []);

  // Convert pixel position → snapped value
  const positionToValue = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return value;
      const rect = trackRef.current.getBoundingClientRect();
      const rawFraction = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width)
      );
      return Math.round(rawFraction * (max - min) + min);
    },
    [min, max, value]
  );

  // Handle drag (pointer events for both touch & mouse)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // Graceful fallback if setPointerCapture isn't supported
      }
      setIsDragging(true);

      const newVal = positionToValue(e.clientX);
      if (newVal !== lastSnappedValue.current) {
        lastSnappedValue.current = newVal;
        onChange(newVal);
        vibrate();
      }
    },
    [positionToValue, onChange, vibrate]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const newVal = positionToValue(e.clientX);
      if (newVal !== lastSnappedValue.current) {
        lastSnappedValue.current = newVal;
        onChange(newVal);
        vibrate();
      }

      // Update motion value for spring effect
      if (trackRef.current) {
        const rect = trackRef.current.getBoundingClientRect();
        const rawFraction = Math.max(
          0,
          Math.min(1, (e.clientX - rect.left) / rect.width)
        );
        x.set(rawFraction * rect.width);
      }
    },
    [isDragging, positionToValue, onChange, vibrate, x]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      className="relative w-full select-none touch-none"
      style={{ height: HIT_AREA_HEIGHT }}
      role="slider"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") {
          e.preventDefault();
          const next = Math.min(value + 1, max);
          onChange(next);
          vibrate();
        } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
          e.preventDefault();
          const next = Math.max(value - 1, min);
          onChange(next);
          vibrate();
        }
      }}
    >
      {/* Invisible hit area for easier touch */}
      <div
        className="absolute inset-0 cursor-pointer"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />

      {/* Track container — centered vertically */}
      <div
        ref={trackRef}
        className="absolute left-0 right-0 top-1/2 -translate-y-1/2"
        style={{ height: TRACK_HEIGHT }}
      >
        {/* Background track */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: `${colorFrom}30` }}
        />

        {/* Filled track with gradient glow */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${fraction * 100}%`,
            background: `linear-gradient(90deg, ${colorFrom}, ${currentColor})`,
            height: bulge,
            top: "50%",
            translateY: "-50%",
          }}
          layout
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />

        {/* Glow under filled track */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full blur-md"
          style={{
            width: `${fraction * 100}%`,
            background: currentColor,
            opacity: isDragging ? 0.4 : 0.15,
          }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Step dots */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between px-[2px]">
        {Array.from({ length: max - min + 1 }).map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-200"
            style={{
              width: i <= value - min ? 3 : 2,
              height: i <= value - min ? 3 : 2,
              backgroundColor:
                i <= value - min ? currentColor : `${colorFrom}40`,
            }}
          />
        ))}
      </div>

      {/* Thumb */}
      <motion.div
        className="absolute top-1/2 pointer-events-none"
        style={{
          left: `calc(${fraction * 100}% - ${THUMB_SIZE / 2}px)`,
          y: "-50%",
        }}
        animate={{
          scale: isDragging ? 1.2 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Outer glow ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: THUMB_SIZE + 12,
            height: THUMB_SIZE + 12,
            left: -6,
            top: -6,
            backgroundColor: currentColor,
          }}
          animate={{
            opacity: isDragging ? 0.2 : 0,
            scale: isDragging ? 1 : 0.8,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />

        {/* Thumb circle */}
        <div
          className="rounded-full shadow-lg border-2 border-white"
          style={{
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            backgroundColor: currentColor,
          }}
        />
      </motion.div>
    </div>
  );
}

// ─── Color interpolation helper ───

function interpolateColor(from: string, to: string, t: number): string {
  const f = hexToRgb(from);
  const toRgb = hexToRgb(to);
  if (!f || !toRgb) return to;

  const r = Math.round(f.r + (toRgb.r - f.r) * t);
  const g = Math.round(f.g + (toRgb.g - f.g) * t);
  const b = Math.round(f.b + (toRgb.b - f.b) * t);

  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.replace("#", "").match(/.{2}/g);
  if (!match || match.length < 3) return null;
  return {
    r: parseInt(match[0], 16),
    g: parseInt(match[1], 16),
    b: parseInt(match[2], 16),
  };
}
