"use client";

import { Shield, Truck, CreditCard, RotateCcw, Lock, Award } from "lucide-react";

export function TrustBar() {
  return (
    <div className="border-y border-stone-100 bg-stone-50/50 py-4">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-y-2 gap-x-6 md:gap-10 text-sm">
          <div className="flex items-center gap-2 text-stone-600">
            <Shield className="w-5 h-5 text-[#B2D8C6]" />
            <span>14-дневна гаранция</span>
          </div>
          <div className="flex items-center gap-2 text-stone-600">
            <Truck className="w-5 h-5 text-[#B2D8C6]" />
            <span>Безплатна доставка над 80€</span>
          </div>
          <div className="flex items-center gap-2 text-stone-600">
            <Lock className="w-5 h-5 text-[#B2D8C6]" />
            <span>Сигурно плащане</span>
          </div>
          <div className="flex items-center gap-2 text-stone-600">
            <Award className="w-5 h-5 text-[#B2D8C6]" />
            <span>Клинично тествани съставки</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GuaranteeBadge() {
  return (
    <div className="bg-gradient-to-br from-[#B2D8C6]/20 to-[#FFC1CC]/10 rounded-2xl p-6 border border-[#B2D8C6]/30">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-[#B2D8C6] flex items-center justify-center flex-shrink-0">
          <RotateCcw className="w-7 h-7 text-[#2D4A3E]" />
        </div>
        <div>
          <h3 className="font-semibold text-[#2D4A3E] text-lg">
            14-дневна гаранция за връщане
          </h3>
          <p className="text-sm text-stone-600 mt-1">
            Ако не си доволна от Corti-Glow, ще ти възстановим парите. Без въпроси.
            Изпитай го без риск!
          </p>
        </div>
      </div>
    </div>
  );
}

export function PaymentMethods() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-stone-400">
      <span className="text-xs uppercase tracking-wide mr-2">Плащане:</span>
      {/* Visa */}
      <div className="w-12 h-8 bg-white rounded border border-stone-200 flex items-center justify-center p-1">
        <svg viewBox="0 0 780 500" className="w-full h-full" aria-label="Visa">
          <path d="M293.2 348.7l33.4-195.8h53.4l-33.4 195.8zM524.3 156.7c-10.6-4-27.2-8.3-47.9-8.3-52.8 0-90 26.5-90.2 64.5-.3 28.1 26.5 43.7 46.8 53.1 20.8 9.6 27.8 15.7 27.7 24.3-.1 13.1-16.6 19.1-32 19.1-21.4 0-32.7-3-50.3-10.2l-6.9-3.1-7.5 43.8c12.5 5.5 35.6 10.2 59.5 10.5 56.2 0 92.7-26.2 93.1-66.8.2-22.3-14-39.2-44.8-53.2-18.7-9.1-30.1-15.1-30-24.3 0-8.1 9.7-16.8 30.6-16.8 17.5-.3 30.1 3.5 40 7.5l4.8 2.3 7.1-42.4zM661.6 152.9h-41.3c-12.8 0-22.4 3.5-28 16.3l-79.3 179.5h56.1s9.2-24.1 11.2-29.4c6.1 0 60.7.1 68.5.1 1.6 6.9 6.5 29.3 6.5 29.3h49.6l-43.3-195.8zm-65.8 126.4c4.4-11.3 21.4-54.7 21.4-54.7-.3.5 4.4-11.4 7.1-18.8l3.6 17s10.3 47 12.4 56.5h-44.5zM176.1 152.9l-52.3 133.5-5.6-27.1c-9.7-31.2-39.9-65-73.7-81.9l47.8 170.9 56.5-.1 84.1-195.4h-56.8" fill="#1434CB"/>
        </svg>
      </div>
      {/* Mastercard */}
      <div className="w-12 h-8 bg-white rounded border border-stone-200 flex items-center justify-center p-1">
        <svg viewBox="0 0 780 500" className="w-full h-full" aria-label="Mastercard">
          <circle cx="299.4" cy="250" r="158.6" fill="#EB001B"/>
          <circle cx="480.6" cy="250" r="158.6" fill="#F79E1B"/>
          <path d="M390 113.4c-58.3 45.7-95.6 116.2-95.6 195.1 0 78.9 37.3 149.4 95.6 195.1 58.3-45.7 95.6-116.2 95.6-195.1 0-78.9-37.3-149.4-95.6-195.1z" fill="#FF5F00"/>
        </svg>
      </div>
      {/* COD */}
      <div className="px-2.5 h-8 bg-white rounded border border-stone-200 flex items-center justify-center">
        <span className="text-[10px] font-medium text-stone-600">Наложен платеж</span>
      </div>
    </div>
  );
}
