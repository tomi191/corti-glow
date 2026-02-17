"use client";

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

  const handleClick = () => {
    if (disabled) return;

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
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "w-full py-3 rounded-xl font-medium transition",
        disabled
          ? "bg-stone-300 text-stone-500 cursor-not-allowed"
          : variant === "primary"
            ? "bg-[#2D4A3E] text-white shadow-lg shadow-[#2D4A3E]/20 hover:bg-[#1f352c]"
            : "border border-[#2D4A3E] text-[#2D4A3E] hover:bg-stone-100",
        className
      )}
    >
      {disabled ? "Изчерпан" : IS_PRELAUNCH ? "Запиши се Първа" : (children || "Започни трансформацията")}
    </button>
  );
}
