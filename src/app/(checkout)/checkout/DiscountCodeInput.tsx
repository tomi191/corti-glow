"use client";

import { useState } from "react";
import { Tag, X, Check, Loader2 } from "lucide-react";
import { useCheckoutStore } from "@/stores/checkout-store";
import { useCartStore } from "@/stores/cart-store";

export function DiscountCodeInput() {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { discount, setDiscount, clearDiscount } = useCheckoutStore();
  const { items, getSubtotal } = useCartStore();

  const handleApply = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const subtotal = getSubtotal();
      const productIds = items.map((item) => item.productId);
      const variantIds = items.map((item) => item.variantId);

      const response = await fetch("/api/discount/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          subtotal,
          productIds,
          variantIds,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        setError(data.error || "Невалиден код за отстъпка");
        return;
      }

      setDiscount({
        code: data.discount.code,
        type: data.discount.type,
        value: data.discount.value,
        amount: data.discount.amount,
        description: data.discount.description,
      });
      setCode("");
    } catch {
      setError("Грешка при проверка на кода. Опитайте отново.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    clearDiscount();
    setCode("");
    setError("");
  };

  // Show applied discount
  if (discount) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            {discount.code}
          </span>
          <span className="text-sm text-green-600">
            ({discount.description})
          </span>
        </div>
        <button
          onClick={handleRemove}
          className="p-1 text-green-600 hover:text-green-800 transition"
          aria-label="Премахни промо кода"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm font-medium text-[#2D4A3E]/70 hover:text-[#2D4A3E] transition py-1"
      >
        <Tag className="w-4 h-4" />
        Имаш промо код? Въведи го тук
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
          placeholder="Въведи промо код"
          className="flex-1 bg-white border border-stone-200 rounded-lg px-4 py-2.5 text-sm uppercase tracking-wide focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
          disabled={isLoading}
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={isLoading || !code.trim()}
          className="px-4 py-2.5 bg-[#2D4A3E] text-white rounded-lg text-sm font-medium hover:bg-[#1f352c] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Приложи"
          )}
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-xs">{error}</p>
      )}
    </div>
  );
}
