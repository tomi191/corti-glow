"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export function GlassCard({
  children,
  className,
  hover = true,
  delay = 0,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -8, scale: 1.02 } : undefined}
      className={cn(
        "relative overflow-hidden rounded-3xl",
        "bg-white/70 backdrop-blur-xl",
        "border border-white/50",
        "shadow-[0_8px_32px_rgba(0,0,0,0.08)]",
        hover && "transition-shadow duration-500 hover:shadow-[0_20px_60px_rgba(45,74,62,0.15)]",
        className
      )}
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/80 via-transparent to-[#B2D8C6]/20 pointer-events-none" />

      {/* Inner glow */}
      <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/40 to-transparent blur-2xl pointer-events-none" />

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
