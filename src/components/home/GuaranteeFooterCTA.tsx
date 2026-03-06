"use client";

import { ChevronRight } from "lucide-react";
import { IS_PRELAUNCH } from "@/lib/constants";
import { useWaitlist } from "@/components/providers/WaitlistProvider";

export function GuaranteeFooterCTA() {
  const { openWaitlist } = useWaitlist();

  const handleCTA = () => {
    if (IS_PRELAUNCH) {
      openWaitlist();
      return;
    }
    const el = document.getElementById("checkout-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="py-32 md:py-48 bg-[#2D4A3E]">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-white/25 mb-6">
          Без риск
        </p>

        <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-light italic text-white leading-[0.9] tracking-[-0.02em] mb-8">
          Не ти хареса?
          <br />
          <span className="text-white/40">Връщаме ти парите.</span>
          <br />
          <span className="text-white/40">Без въпроси.</span>
        </h2>

        <p className="text-lg md:text-xl text-white/50 font-light leading-relaxed mb-12 max-w-xl mx-auto">
          Вярваме в тази формула, защото знаем какво има в нея. Ако след 30 дни
          не усетиш разлика — пиши ни и ти връщаме сумата. Това е.
        </p>

        <button
          onClick={handleCTA}
          className="inline-flex items-center gap-2 px-9 py-4.5 bg-white text-[#2D4A3E] rounded-full text-base font-medium hover:bg-white/90 transition-colors duration-300 shadow-lg shadow-white/10 mb-6 cursor-pointer"
        >
          {IS_PRELAUNCH ? "Запиши се Първа" : "Започни с Corti-Glow"}
          <ChevronRight className="w-4 h-4" />
        </button>

        <p className="text-sm text-white/30">
          Доставка за 2-3 работни дни в цяла България.
        </p>
      </div>
    </section>
  );
}
