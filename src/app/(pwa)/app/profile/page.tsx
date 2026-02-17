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
  Bell,
  Loader2,
} from "lucide-react";
import {
  isPushSupported,
  isIOSInBrowser,
  registerServiceWorker,
  subscribeToPush,
  getExistingSubscription,
} from "@/lib/push-notifications";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const [mounted, setMounted] = useState(false);

  const {
    lastPeriodDate,
    cycleLength,
    periodDuration,
    pushEnabled,
    setLastPeriodDate,
    setCycleLength,
    setPeriodDuration,
    setPushEnabled,
  } = usePwaStore();

  const [date, setDate] = useState("");
  const [length, setLength] = useState(28);
  const [duration, setDuration] = useState(5);
  const [saved, setSaved] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

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

  async function handlePushToggle() {
    if (pushLoading) return;
    setPushLoading(true);

    try {
      if (pushEnabled) {
        // Disable: unsubscribe
        const reg = await registerServiceWorker();
        if (reg) {
          const sub = await getExistingSubscription(reg);
          if (sub) {
            await fetch("/api/push/unsubscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ endpoint: sub.endpoint }),
            });
            await sub.unsubscribe();
          }
        }
        setPushEnabled(false);
      } else {
        // Enable: subscribe
        const reg = await registerServiceWorker();
        if (!reg) return;

        const sub = await subscribeToPush(reg);
        if (!sub) return;

        const res = await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription: {
              endpoint: sub.endpoint,
              keys: {
                p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey("p256dh")!))),
                auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey("auth")!))),
              },
            },
          }),
        });

        if (res.ok) {
          setPushEnabled(true);
        }
      }
    } catch (err) {
      console.error("Push toggle error:", err);
    } finally {
      setPushLoading(false);
    }
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

      {/* Notifications */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass rounded-[2rem] p-5 space-y-4"
      >
        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-forest/60">
          Известия
        </h3>

        {isIOSInBrowser() ? (
          <p className="text-sm text-stone-500">
            Първо добави приложението на началния екран, за да получаваш известия.
          </p>
        ) : isPushSupported() ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-sage/30 flex items-center justify-center">
                <Bell className="w-4 h-4 text-brand-forest" />
              </div>
              <span className="text-sm font-medium text-stone-700">
                Напомняния за чек-ин
              </span>
            </div>

            <button
              onClick={handlePushToggle}
              disabled={pushLoading}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                pushEnabled ? "bg-brand-forest" : "bg-stone-300"
              }`}
              aria-label={pushEnabled ? "Изключи известията" : "Включи известията"}
            >
              {pushLoading ? (
                <Loader2 className="w-4 h-4 text-white absolute top-1.5 left-1/2 -translate-x-1/2 animate-spin" />
              ) : (
                <span
                  className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    pushEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              )}
            </button>
          </div>
        ) : (
          <p className="text-sm text-stone-500">
            Браузърът ти не поддържа push известия.
          </p>
        )}
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
