"use client";

import { motion } from "framer-motion";

/**
 * Animated mesh gradient background with SVG grain texture.
 * Creates a "tactile digital" feel — organic, alive, premium.
 *
 * Usage: Place inside PWA layout as the first child (behind content).
 * The blob colors can be swapped per cycle phase for mood shifts.
 */
export default function PremiumBackground() {
  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none bg-brand-sand"
      style={{ zIndex: -1 }}
      aria-hidden="true"
    >
      {/* Blob 1 — top-left, sage-toned */}
      <motion.div
        animate={{
          x: ["0%", "-10%", "5%", "0%"],
          y: ["0%", "15%", "-5%", "0%"],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[10%] -left-[10%] w-[60%] h-[50%] rounded-full mix-blend-multiply blur-[80px] opacity-40 bg-brand-sage"
      />

      {/* Blob 2 — bottom-right, cream-toned */}
      <motion.div
        animate={{
          x: ["0%", "15%", "-10%", "0%"],
          y: ["0%", "-10%", "10%", "0%"],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute -bottom-[10%] -right-[10%] w-[70%] h-[60%] rounded-full mix-blend-multiply blur-[90px] opacity-50 bg-brand-cream"
      />

      {/* Blob 3 — center, blush accent (subtle) */}
      <motion.div
        animate={{
          x: ["0%", "8%", "-6%", "0%"],
          y: ["0%", "-8%", "12%", "0%"],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
        className="absolute top-[30%] left-[20%] w-[40%] h-[35%] rounded-full mix-blend-multiply blur-[100px] opacity-25 bg-brand-blush"
      />

      {/* SVG Noise / Grain texture — kills the "plastic screen" feel */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.035] mix-blend-overlay">
        <filter id="premium-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#premium-noise)" />
      </svg>
    </div>
  );
}
