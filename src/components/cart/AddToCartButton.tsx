"use client";

import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  id: string;
  title: string;
  price: number;
  image?: string;
  variant?: "primary" | "secondary";
  className?: string;
  children?: React.ReactNode;
}

export function AddToCartButton({
  id,
  title,
  price,
  image = "/images/corti-glow.png",
  variant = "primary",
  className,
  children,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleClick = () => {
    addItem({
      id,
      title,
      price,
      image,
    });
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full py-3 rounded-xl font-medium transition",
        variant === "primary"
          ? "bg-[#2D4A3E] text-white shadow-lg shadow-[#2D4A3E]/20 hover:bg-[#1f352c]"
          : "border border-[#2D4A3E] text-[#2D4A3E] hover:bg-stone-100",
        className
      )}
    >
      {children || "Добави в Количката"}
    </button>
  );
}
