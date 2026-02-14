import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({
  children,
  className,
  hover = true,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-white",
        "border border-stone-100",
        "shadow-sm",
        hover && "transition-shadow duration-300 hover:shadow-md",
        className
      )}
    >
      {children}
    </div>
  );
}
