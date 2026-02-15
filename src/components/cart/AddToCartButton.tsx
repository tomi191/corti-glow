"use client";

import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";
import { trackAddToCart } from "@/components/analytics/GoogleAnalytics";

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
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleClick = () => {
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
      className={cn(
        "w-full py-3 rounded-xl font-medium transition",
        variant === "primary"
          ? "bg-[#2D4A3E] text-white shadow-lg shadow-[#2D4A3E]/20 hover:bg-[#1f352c]"
          : "border border-[#2D4A3E] text-[#2D4A3E] hover:bg-stone-100",
        className
      )}
    >
      {children || "Започни трансформацията"}
    </button>
  );
}
