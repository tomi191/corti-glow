// Section 7 — Full Transparency (Ingredient label)
// Server Component — no "use client"
// Dark forest green section inspired by seed.com

export function FullTransparency() {
  return (
    <section className="py-32 md:py-48 bg-[#2D4A3E]">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <p className="text-xs uppercase tracking-[0.3em] text-white/30 font-semibold mb-6">
            Пълна прозрачност
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-light italic text-white leading-[0.9] tracking-[-0.02em]">
            Пълен състав.
            <br />
            <span className="text-white/40">Нищо скрито.</span>
          </h2>
        </div>

        {/* Level 1 — Clinical Ingredients */}
        <div className="mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-white/35 font-semibold mb-8">
            Клинични съставки
          </p>

          <div className="flex justify-between items-baseline border-b border-white/[0.08] py-5 md:py-6">
            <span className="text-xl md:text-2xl font-serif text-white">
              Мио-инозитол
            </span>
            <span className="text-3xl md:text-4xl font-serif font-light text-white tabular-nums">
              2000 mg
            </span>
          </div>

          <div className="flex justify-between items-baseline border-b border-white/[0.08] py-5 md:py-6">
            <span className="text-xl md:text-2xl font-serif text-white">
              Екстракт от Ашваганда{" "}
              <span className="text-sm text-white/30">
                (&ge;5% витанолиди)
              </span>
            </span>
            <span className="text-3xl md:text-4xl font-serif font-light text-white tabular-nums">
              300 mg
            </span>
          </div>

          <div className="flex justify-between items-baseline border-b border-white/[0.08] py-5 md:py-6">
            <span className="text-xl md:text-2xl font-serif text-white">
              Магнезиев Бисглицинат{" "}
              <span className="text-sm text-white/30">
                (100 mg елементен)
              </span>
            </span>
            <span className="text-3xl md:text-4xl font-serif font-light text-white tabular-nums">
              670 mg
            </span>
          </div>

          <div className="flex justify-between items-baseline border-b border-white/[0.08] py-5 md:py-6">
            <span className="text-xl md:text-2xl font-serif text-white">
              Инулин от цикория
            </span>
            <span className="text-3xl md:text-4xl font-serif font-light text-white tabular-nums">
              2500 mg
            </span>
          </div>
        </div>

        {/* Level 2 — Supporting Ingredients */}
        <div className="mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-white/25 font-semibold mb-8">
            Подкрепящи съставки
          </p>

          <div className="flex justify-between items-baseline border-b border-white/[0.08] py-5 md:py-6">
            <span className="text-base md:text-lg text-white/60">
              L-Теанин
            </span>
            <span className="text-lg md:text-xl text-white/50 font-light tabular-nums">
              200 mg
            </span>
          </div>

          <div className="flex justify-between items-baseline border-b border-white/[0.08] py-5 md:py-6">
            <span className="text-base md:text-lg text-white/60">
              Бромелаин{" "}
              <span className="text-sm text-white/30">
                (&ge;2400 GDU/g)
              </span>
            </span>
            <span className="text-lg md:text-xl text-white/50 font-light tabular-nums">
              100 mg
            </span>
          </div>

          <div className="flex justify-between items-baseline border-b border-white/[0.08] py-5 md:py-6">
            <span className="text-base md:text-lg text-white/60">
              Витамин B6 (P-5-P)
            </span>
            <span className="text-lg md:text-xl text-white/50 font-light tabular-nums">
              1.4 mg
            </span>
          </div>
        </div>

        {/* Level 3 — Clean Base */}
        <div className="mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-white/15 font-semibold mb-6">
            Чиста база
          </p>

          <div className="space-y-2">
            <p className="text-sm text-white/30">
              Естествен вкус горска ягода и лайм
            </p>
            <p className="text-sm text-white/30">
              Червено цвекло на прах
            </p>
            <p className="text-sm text-white/30">Лимонена киселина</p>
            <p className="text-sm text-white/30">
              Екстракт от стевия (Reb-A 97%) — 0 добавена захар
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.08] pt-8">
          <p className="text-sm text-white/35 font-light text-center">
            Без изкуствени оцветители. Без подсладители. Без глутен.
          </p>
        </div>
      </div>
    </section>
  );
}
