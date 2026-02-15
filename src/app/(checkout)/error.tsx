"use client";

import { AlertTriangle, ShoppingCart, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-semibold text-[#2D4A3E] mb-3">
          Възникна грешка
        </h1>
        <p className="text-stone-600 mb-8">
          Нещо се обърка при обработка на поръчката ви. Моля, опитайте отново
          или се върнете към количката.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#2D4A3E] text-white rounded-full font-medium hover:bg-[#1f352c] transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Опитай отново
          </button>
          <Link
            href="/magazin"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#2D4A3E] text-[#2D4A3E] rounded-full font-medium hover:bg-stone-100 transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            Към Магазина
          </Link>
        </div>
      </div>
    </div>
  );
}
