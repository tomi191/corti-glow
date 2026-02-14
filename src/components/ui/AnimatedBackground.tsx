"use client";

import { useReducedMotion } from "framer-motion";

export function AnimatedBackground() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {/* Main gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFC1CC]/20 via-white to-[#B2D8C6]/20" />

      {/* Animated orbs — CSS animations for zero main thread cost */}
      <div
        className={`absolute top-20 right-20 w-[600px] h-[600px] rounded-full bg-[#FFC1CC]/30 blur-[120px] ${
          prefersReducedMotion ? "" : "animate-[orb1_8s_ease-in-out_infinite]"
        }`}
      />
      <div
        className={`absolute bottom-20 left-20 w-[500px] h-[500px] rounded-full bg-[#B2D8C6]/40 blur-[100px] ${
          prefersReducedMotion ? "" : "animate-[orb2_10s_ease-in-out_infinite]"
        }`}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(#2D4A3E 1px, transparent 1px), linear-gradient(90deg, #2D4A3E 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}
