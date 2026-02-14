"use client";

import { CreditCard, Banknote, CheckCircle, Lock, Info } from "lucide-react";
import { useCheckoutStore, type PaymentMethod } from "@/stores/checkout-store";

const paymentOptions: {
  method: PaymentMethod;
  title: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    method: "card",
    title: "Карта",
    description: "Visa, Mastercard, Apple Pay, Google Pay",
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    method: "cod",
    title: "Наложен платеж",
    description: "Плащане при доставка",
    icon: <Banknote className="w-5 h-5" />,
  },
];

export function PaymentMethodSelector() {
  const { payment, setPaymentMethod, isSubscription } = useCheckoutStore();

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wide">
        Метод на Плащане
      </h3>

      <div className="space-y-3">
        {paymentOptions.map((option) => {
          const isSelected = payment.method === option.method;
          const isCodDisabled = option.method === "cod" && isSubscription;

          return (
            <button
              key={option.method}
              type="button"
              onClick={() => !isCodDisabled && setPaymentMethod(option.method)}
              disabled={isCodDisabled}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4
                ${isCodDisabled
                  ? "border-stone-100 bg-stone-50 opacity-50 cursor-not-allowed"
                  : isSelected
                    ? "border-[#2D4A3E] bg-[#2D4A3E]/5"
                    : "border-stone-200 hover:border-stone-300 bg-white"
                }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                  ${isCodDisabled ? "bg-stone-100 text-stone-400" : isSelected ? "bg-[#2D4A3E] text-white" : "bg-stone-100 text-stone-500"}`}
              >
                {option.icon}
              </div>

              <div className="flex-1">
                <span className={`font-medium ${isCodDisabled ? "text-stone-400" : isSelected ? "text-[#2D4A3E]" : "text-stone-800"}`}>
                  {option.title}
                </span>
                <p className="text-xs text-stone-500 mt-0.5">{option.description}</p>
                {isCodDisabled && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Абонаментите изискват картово плащане
                  </p>
                )}
              </div>

              {isSelected && !isCodDisabled && (
                <CheckCircle className="w-5 h-5 text-[#2D4A3E] flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {payment.method === "card" && (
        <div className="flex items-center gap-2 text-xs text-stone-500 mt-2">
          <Lock className="w-3 h-3" />
          <span>Сигурно плащане чрез Stripe</span>
        </div>
      )}
    </div>
  );
}
