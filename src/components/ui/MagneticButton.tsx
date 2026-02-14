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
  const variants = {
    primary: "bg-[#2D4A3E] text-white hover:bg-[#1f352c]",
    secondary: "bg-white text-[#2D4A3E] border border-stone-200 hover:border-stone-300",
    ghost: "text-[#2D4A3E] hover:bg-stone-50",
  };

  const sizes = {
    sm: "px-5 py-2.5 text-sm",
    md: "px-8 py-4 text-base",
    lg: "px-10 py-5 text-lg",
  };

  const classes = cn(
    "inline-flex items-center justify-center rounded-full font-medium",
    "transition-colors duration-200",
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick}>
        <span className="flex items-center gap-2">{children}</span>
      </a>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      <span className="flex items-center gap-2">{children}</span>
    </button>
  );
}
