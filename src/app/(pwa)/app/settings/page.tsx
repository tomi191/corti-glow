"use client";

import { useState, useEffect } from "react";
import { usePwaStore } from "@/stores/pwa-store";
import { Check } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const {
    lastPeriodDate,
    cycleLength,
    periodDuration,
    setLastPeriodDate,
    setCycleLength,
    setPeriodDuration,
  } = usePwaStore();

  const [date, setDate] = useState("");
  const [length, setLength] = useState(28);
  const [duration, setDuration] = useState(5);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDate(lastPeriodDate || "");
    setLength(cycleLength);
    setDuration(periodDuration);
  }, [lastPeriodDate, cycleLength, periodDuration]);

  if (!mounted) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="h-8 w-48 bg-stone-200 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          <div className="h-20 bg-stone-100 rounded-2xl animate-pulse" />
          <div className="h-20 bg-stone-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  function handleSave() {
    if (date) setLastPeriodDate(date);
    setCycleLength(length);
    setPeriodDuration(duration);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-brand-forest">Настройки</h1>
        <p className="text-sm text-stone-500 mt-1">
          Конфигурирай менструалния си цикъл
        </p>
      </div>

      <div className="space-y-4">
        {/* Last period date */}
        <label className="block bg-white rounded-2xl border border-stone-100 p-4">
          <span className="text-sm font-medium text-stone-700">
            Начало на последна менструация
          </span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="mt-2 w-full py-3 px-4 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-sage/50 focus:border-brand-sage"
          />
        </label>

        {/* Period duration */}
        <label className="block bg-white rounded-2xl border border-stone-100 p-4">
          <span className="text-sm font-medium text-stone-700">
            Колко дни ти върви обикновено?
          </span>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min={2}
              max={10}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="flex-1 accent-brand-forest"
            />
            <span className="text-lg font-semibold text-brand-forest w-10 text-center">
              {duration}
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Средна продължителност: 3-7 дни
          </p>
        </label>

        {/* Cycle length */}
        <label className="block bg-white rounded-2xl border border-stone-100 p-4">
          <span className="text-sm font-medium text-stone-700">
            Колко дни е дълъг целият ти цикъл?
          </span>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min={21}
              max={40}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="flex-1 accent-brand-forest"
            />
            <span className="text-lg font-semibold text-brand-forest w-10 text-center">
              {length}
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Типичен цикъл: 21-40 дни (средно 28)
          </p>
        </label>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!date}
        className="w-full py-3 px-6 rounded-full bg-brand-forest text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        {saved ? (
          <>
            <Check className="w-5 h-5" />
            Запазено!
          </>
        ) : (
          "Запази"
        )}
      </button>

      {/* Link to profile */}
      <Link
        href="/app/profile"
        className="block text-center text-sm text-stone-500 hover:text-brand-forest transition-colors"
      >
        Управление на акаунта &rarr;
      </Link>
    </div>
  );
}
