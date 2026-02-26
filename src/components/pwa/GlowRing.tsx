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

const SIZE = 220;
const STROKE_WIDTH = 7;

// ─── Organic blob paths (roughly circular, with natural undulations) ───
// Two shapes that morph between each other for the "breathing" effect.
// Generated around center (110,110) with ~radius 96.

const BLOB_INHALE =
  "M110,14 C142,10 170,26 188,54 C204,80 206,114 198,146 C188,176 164,200 134,206 C104,212 72,202 48,182 C24,162 12,132 12,102 C12,72 24,44 48,28 C72,12 96,14 110,14Z";

const BLOB_EXHALE =
  "M110,10 C146,6 176,22 194,50 C208,76 212,118 202,150 C190,182 160,206 130,210 C100,214 66,206 42,186 C18,166 6,136 8,104 C10,72 20,40 44,24 C68,8 92,10 110,10Z";

interface GlowRingProps {
  score: number | null;
  hasCheckIn: boolean;
}

export default function GlowRing({ score, hasCheckIn }: GlowRingProps) {
  const normalizedScore = score ?? 0;
  // pathLength=100 means dasharray of 100 maps to full path
  const dashOffset = 100 - normalizedScore;

  // Animated counter
  const springValue = useSpring(0, { stiffness: 50, damping: 20 });
  const rounded = useTransform(springValue, (v) => Math.round(v));
  const [displayed, setDisplayed] = useState(0);

  useMotionValueEvent(rounded, "change", (v) => setDisplayed(v));

  useEffect(() => {
    springValue.set(hasCheckIn && score !== null ? score : 0);
  }, [score, hasCheckIn, springValue]);

  const ring = (
    <div className="relative w-[220px] h-[220px]">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
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

          {/* Soft glow filter for the progress path */}
          <filter id="glow-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background blob — breathes with SMIL morphing animation */}
        <path
          d={BLOB_INHALE}
          fill="none"
          stroke="#e7e5e4"
          strokeWidth={STROKE_WIDTH}
          opacity={0.4}
          pathLength={100}
        >
          <animate
            attributeName="d"
            values={`${BLOB_INHALE};${BLOB_EXHALE};${BLOB_INHALE}`}
            dur="6s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
          />
        </path>

        {/* Glow layer behind progress (soft light effect) */}
        <motion.path
          d={BLOB_INHALE}
          fill="none"
          stroke="url(#glow-gradient)"
          strokeWidth={STROKE_WIDTH + 6}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={100}
          opacity={0.15}
          filter="url(#glow-blur)"
          initial={{ strokeDashoffset: 100 }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.2,
          }}
        >
          <animate
            attributeName="d"
            values={`${BLOB_INHALE};${BLOB_EXHALE};${BLOB_INHALE}`}
            dur="6s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
          />
        </motion.path>

        {/* Progress blob — main visible ring */}
        <motion.path
          d={BLOB_INHALE}
          fill="none"
          stroke="url(#glow-gradient)"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={100}
          initial={{ strokeDashoffset: 100 }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.2,
          }}
        >
          <animate
            attributeName="d"
            values={`${BLOB_INHALE};${BLOB_EXHALE};${BLOB_INHALE}`}
            dur="6s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
          />
        </motion.path>
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {hasCheckIn ? (
          <div className="text-center">
            <motion.span
              className="block text-4xl font-display font-bold text-brand-forest"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              {displayed}
            </motion.span>
            <span className="text-xs font-medium uppercase tracking-widest text-brand-forest/60">
              Glow Score
            </span>
          </div>
        ) : (
          <motion.div
            className="text-center"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-7 h-7 text-brand-sage mx-auto mb-1" />
            <span className="block text-base font-bold text-brand-forest">
              Чек-Ін
            </span>
            <span className="text-[10px] text-brand-forest/50">
              Натисни тук
            </span>
          </motion.div>
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
