"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function MagneticButton({
  children,
  className,
  onClick,
  variant = "primary",
  size = "md",
  href,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.3;
    const y = (clientY - (top + height / 2)) * 0.3;
    setPosition({ x, y });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const variants = {
    primary:
      "bg-[#2D4A3E] text-white shadow-[0_10px_40px_rgba(45,74,62,0.3)] hover:shadow-[0_20px_60px_rgba(45,74,62,0.4)]",
    secondary:
      "bg-white/80 backdrop-blur-sm text-[#2D4A3E] border border-[#2D4A3E]/20 hover:bg-white",
    ghost: "text-[#2D4A3E] hover:bg-[#2D4A3E]/5",
  };

  const sizes = {
    sm: "px-5 py-2.5 text-sm",
    md: "px-8 py-4 text-base",
    lg: "px-10 py-5 text-lg",
  };

  const Component = href ? motion.a : motion.button;

  return (
    <Component
      ref={ref as never}
      href={href}
      onClick={onClick}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 350, damping: 15, mass: 0.5 }}
      className={cn(
        "relative inline-flex items-center justify-center rounded-full font-medium",
        "transition-all duration-300 ease-out",
        "overflow-hidden group",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {/* Shine effect */}
      <span className="absolute inset-0 overflow-hidden rounded-full">
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </span>

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </Component>
  );
}
