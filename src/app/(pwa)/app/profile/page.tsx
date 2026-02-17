"use client";

import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import Image from "next/image";
import { motion } from "framer-motion";
import { usePwaStore } from "@/stores/pwa-store";
import {
  LogOut,
  Shield,
  User,
  Check,
  Calendar,
  Clock,
  Repeat,
} from "lucide-react";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();
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

  if (!mounted || !isLoaded) {
    return (
      <div className="max-w-lg mx-auto space-y-6 py-6">
        <div className="flex items-center gap-4 p-5 glass rounded-3xl">
          <div className="w-14 h-14 rounded-full bg-white/40 animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 bg-white/40 rounded animate-pulse" />
            <div className="h-3 w-48 bg-white/30 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-64 bg-white/30 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  function handleSave() {
    if (date) setLastPeriodDate(date);
    setCycleLength(length);
    setPeriodDuration(duration);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 py-6">
      {/* User card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 p-5 glass rounded-3xl"
      >
        {user.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt={user.fullName || "Аватар"}
            width={56}
            height={56}
            className="rounded-full border-2 border-white"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-brand-sage/30 flex items-center justify-center">
            <User className="w-7 h-7 text-brand-forest" />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-display font-semibold text-brand-forest truncate">
            {user.fullName || "Потребител"}
          </p>
          <p className="text-sm text-stone-500 truncate">
            {user.primaryEmailAddress?.emailAddress}
          </p>
        </div>
      </motion.div>

      {/* Cycle Settings */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-[2rem] p-5 space-y-5"
      >
        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-forest/60">
          Настройки на цикъла
        </h3>

        {/* Last period date */}
        <label className="block space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
            <Calendar className="w-4 h-4 text-brand-forest" />
            Начало на последна менструация
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="w-full py-3 px-4 border border-stone-200 rounded-xl text-stone-800 bg-white/60 focus:outline-none focus:ring-2 focus:ring-brand-sage/50 focus:border-brand-sage"
          />
        </label>

        {/* Period duration */}
        <label className="block space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
            <Clock className="w-4 h-4 text-brand-blush" />
            Продължителност на менструация
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={2}
              max={10}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="flex-1 accent-brand-forest"
              aria-label="Продължителност на менструация"
            />
            <span className="text-lg font-semibold text-brand-forest w-10 text-center">
              {duration}
            </span>
          </div>
          <p className="text-xs text-stone-400">Средно: 3-7 дни</p>
        </label>

        {/* Cycle length */}
        <label className="block space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
            <Repeat className="w-4 h-4 text-brand-cream" />
            Дължина на цикъл
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={21}
              max={40}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="flex-1 accent-brand-forest"
              aria-label="Дължина на цикъла"
            />
            <span className="text-lg font-semibold text-brand-forest w-10 text-center">
              {length}
            </span>
          </div>
          <p className="text-xs text-stone-400">Типичен: 21-40 дни (средно 28)</p>
        </label>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!date}
          className="w-full py-3 px-6 rounded-2xl bg-brand-forest text-white font-semibold shadow-lg shadow-brand-forest/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
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
      </motion.section>

      {/* Account actions */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-[2rem] divide-y divide-stone-200/50"
      >
        <button
          onClick={() => openUserProfile()}
          className="flex items-center gap-3 w-full px-5 py-4 text-left hover:bg-white/30 transition-colors first:rounded-t-[2rem]"
        >
          <div className="w-9 h-9 rounded-xl bg-brand-sage/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-brand-forest" />
          </div>
          <span className="flex-1 text-sm font-medium text-stone-700">
            Управление на акаунта
          </span>
        </button>

        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className="flex items-center gap-3 w-full px-5 py-4 text-left hover:bg-white/30 transition-colors last:rounded-b-[2rem]"
        >
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
            <LogOut className="w-4 h-4 text-red-500" />
          </div>
          <span className="flex-1 text-sm font-medium text-red-600">
            Изход
          </span>
        </button>
      </motion.section>

      {/* App info */}
      <p className="text-center text-xs text-stone-400">
        LURA App v2.0
      </p>
    </div>
  );
}
