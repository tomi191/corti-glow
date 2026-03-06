"use client";

import { useState, useCallback } from "react";
import { Check } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";
import { trackAddToCart } from "@/components/analytics/GoogleAnalytics";
import { IS_PRELAUNCH } from "@/lib/constants";
import { useWaitlist } from "@/components/providers/WaitlistProvider";

interface AddToCartButtonProps {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  price: number;
  image?: string;
  variant?: "primary" | "secondary";
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export function AddToCartButton({
  id,
  productId,
  variantId,
  title,
  price,
  image = "/images/product-hero-box.webp",
  variant = "primary",
  className,
  children,
  disabled,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { openWaitlist } = useWaitlist();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClick = useCallback(() => {
    if (disabled || showSuccess) return;

    if (IS_PRELAUNCH) {
      openWaitlist();
      return;
    }

    addItem({
      id,
      productId,
      variantId,
      title,
      price,
      image,
    });
    trackAddToCart({ id, name: title, price });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  }, [disabled, showSuccess, id, productId, variantId, title, price, image, addItem, openWaitlist]);

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "w-full py-3 rounded-xl font-medium transition-all duration-300",
        disabled
          ? "bg-stone-300 text-stone-500 cursor-not-allowed"
          : showSuccess
            ? "bg-[#B2D8C6] text-[#2D4A3E] scale-[1.02] shadow-lg shadow-[#B2D8C6]/30"
            : variant === "primary"
              ? "bg-[#2D4A3E] text-white shadow-lg shadow-[#2D4A3E]/20 hover:bg-[#1f352c]"
              : "border border-[#2D4A3E] text-[#2D4A3E] hover:bg-stone-100",
        className
      )}
    >
      {disabled ? (
        "Изчерпан"
      ) : IS_PRELAUNCH ? (
        "Запиши се Първа"
      ) : showSuccess ? (
        <span className="inline-flex items-center gap-2">
          <Check className="w-5 h-5" />
          Добавено в количката
        </span>
      ) : (
        children || "Започни трансформацията"
      )}
    </button>
  );
}
