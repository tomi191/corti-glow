"use client";

import { useEffect } from "react";
import { Building, MapPin, CheckCircle, Loader2 } from "lucide-react";
import { useCheckoutStore, type ShippingMethod } from "@/stores/checkout-store";
import { useCartStore } from "@/stores/cart-store";
import { useShippingCalculation } from "@/hooks/useShippingCalculation";
import { formatPrice } from "@/lib/utils";

const shippingOptions: {
  method: ShippingMethod;
  title: string;
  description: string;
  basePrice: number;
  icon: React.ReactNode;
}[] = [
  {
    method: "econt_office",
    title: "До офис на Еконт",
    description: "Безплатно при поръчка над 80 лв",
    basePrice: 4.99,
    icon: <Building className="w-5 h-5" />,
  },
  {
    method: "econt_address",
    title: "До адрес",
    description: "Доставка до врата",
    basePrice: 6.99,
    icon: <MapPin className="w-5 h-5" />,
  },
];

export function ShippingMethodSelector() {
  const {
    shipping,
    setShippingMethod,
    shippingCalculating,
    shippingEstimated,
  } = useCheckoutStore();
  const { isFreeShipping } = useCartStore();
  const { immediateCalculate } = useShippingCalculation();
  const hasFreeShipping = isFreeShipping();

  const handleSelect = (method: ShippingMethod) => {
    if (method === shipping.method) return;
    setShippingMethod(method);
  };

  // Trigger calculation when method changes and we have enough info
  useEffect(() => {
    // Give time for state to update, then calculate
    const timer = setTimeout(() => {
      immediateCalculate();
    }, 100);
    return () => clearTimeout(timer);
  }, [shipping.method, shipping.selectedOffice?.code, shipping.city, shipping.street, immediateCalculate]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wide">
        Метод на Доставка
      </h3>

      <div className="space-y-3">
        {shippingOptions.map((option) => {
          const isSelected = shipping.method === option.method;
          // Show current calculated price if selected, otherwise show base price
          const displayPrice = hasFreeShipping
            ? 0
            : isSelected
              ? shipping.price
              : option.basePrice;
          const isCalculating = isSelected && shippingCalculating;

          return (
            <button
              key={option.method}
              type="button"
              onClick={() => handleSelect(option.method)}
              disabled={isCalculating}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 disabled:cursor-wait
                ${isSelected
                  ? "border-[#2D4A3E] bg-[#2D4A3E]/5"
                  : "border-stone-200 hover:border-stone-300 bg-white"
                }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                  ${isSelected ? "bg-[#2D4A3E] text-white" : "bg-stone-100 text-stone-500"}`}
              >
                {option.icon}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${isSelected ? "text-[#2D4A3E]" : "text-stone-800"}`}>
                    {option.title}
                  </span>
                  <span className={`font-bold flex items-center gap-2 ${displayPrice === 0 ? "text-[#2D4A3E]" : "text-stone-800"}`}>
                    {isCalculating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : displayPrice === 0 ? (
                      "БЕЗПЛАТНО"
                    ) : (
                      <>
                        {formatPrice(displayPrice)}
                        {isSelected && shippingEstimated && (
                          <span className="text-xs font-normal text-stone-400">~</span>
                        )}
                      </>
                    )}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">{option.description}</p>
              </div>

              {isSelected && !isCalculating && (
                <CheckCircle className="w-5 h-5 text-[#2D4A3E] flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {hasFreeShipping && (
        <p className="text-xs text-[#2D4A3E] flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Безплатна доставка е включена!
        </p>
      )}
    </div>
  );
}
