"use client";

import { useState, useEffect } from "react";
import {
  motion,
  useSpring,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import Link from "next/link";
import { Sparkles } from "lucide-react";

const SIZE = 200;
const STROKE_WIDTH = 8;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface GlowRingProps {
  score: number | null;
  hasCheckIn: boolean;
}

export default function GlowRing({ score, hasCheckIn }: GlowRingProps) {
  const normalizedScore = score ?? 0;
  const targetOffset =
    CIRCUMFERENCE - (normalizedScore / 100) * CIRCUMFERENCE;

  // Animated counter
  const springValue = useSpring(0, { stiffness: 50, damping: 20 });
  const rounded = useTransform(springValue, (v) => Math.round(v));
  const [displayed, setDisplayed] = useState(0);

  useMotionValueEvent(rounded, "change", (v) => setDisplayed(v));

  useEffect(() => {
    springValue.set(hasCheckIn && score !== null ? score : 0);
  }, [score, hasCheckIn, springValue]);

  const ring = (
    <div className="relative w-[200px] h-[200px]">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="-rotate-90"
        role="img"
        aria-label={
          hasCheckIn ? `Glow Score: ${score}` : "Натисни за чек-ін"
        }
      >
        <defs>
          <linearGradient
            id="glow-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#2D4A3E" />
            <stop offset="50%" stopColor="#B2D8C6" />
            <stop offset="100%" stopColor="#FFC1CC" />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="#e7e5e4"
          strokeWidth={STROKE_WIDTH}
          opacity={0.5}
        />

        {/* Progress */}
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="url(#glow-gradient)"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: targetOffset }}
          transition={{
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.2,
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {hasCheckIn ? (
          <div className="text-center">
            <span className="block text-4xl font-display font-bold text-brand-forest">
              {displayed}
            </span>
            <span className="text-xs font-medium uppercase tracking-widest text-brand-forest/60">
              Glow Score
            </span>
          </div>
        ) : (
          <div className="text-center">
            <Sparkles className="w-7 h-7 text-brand-sage mx-auto mb-1" />
            <span className="block text-base font-bold text-brand-forest">
              Чек-Ін
            </span>
            <span className="text-[10px] text-brand-forest/50">
              Натисни тук
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (!hasCheckIn) {
    return (
      <Link href="/app/checkin" className="block">
        {ring}
      </Link>
    );
  }

  return ring;
}
