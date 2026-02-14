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
    <div className="bg-[#B2D8C6]/10 rounded-2xl p-6 border border-[#B2D8C6]/30">
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
      <div className="w-10 h-6 bg-white rounded border border-stone-200 flex items-center justify-center">
        <span className="text-[10px] font-bold text-blue-600">VISA</span>
      </div>
      {/* Mastercard */}
      <div className="w-10 h-6 bg-white rounded border border-stone-200 flex items-center justify-center">
        <div className="flex">
          <div className="w-3 h-3 rounded-full bg-red-500 -mr-1" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
        </div>
      </div>
      {/* COD */}
      <div className="px-2 h-6 bg-white rounded border border-stone-200 flex items-center justify-center">
        <span className="text-[9px] font-medium text-stone-600">Наложен платеж</span>
      </div>
    </div>
  );
}
