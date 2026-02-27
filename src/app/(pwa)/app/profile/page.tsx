"use client";

import { useState, useEffect, useMemo } from "react";
import { useUserSafe as useUser, useClerkSafe as useClerk } from "@/hooks/use-clerk-safe";
import Image from "next/image";
import { motion } from "framer-motion";
import { usePwaStore } from "@/stores/pwa-store";
import { haptic } from "@/lib/haptics";
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
  Flame,
  TrendingUp,
  Activity,
  Moon,
  ChevronRight,
} from "lucide-react";
import {
  isPushSupported,
  isIOSInBrowser,
  registerServiceWorker,
  subscribeToPush,
  getExistingSubscription,
} from "@/lib/push-notifications";

// --- Shimmer Skeleton ---
function ShimmerSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-[2rem] overflow-hidden ${className ?? ""}`}
      style={{
        background:
          "linear-gradient(90deg, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.3) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s ease-in-out infinite",
      }}
    />
  );
}

// --- Stagger animation variants ---
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// --- Premium Toggle ---
function PremiumToggle({
  enabled,
  onToggle,
  loading,
  label,
}: {
  enabled: boolean;
  onToggle: () => void;
  loading?: boolean;
  label: string;
}) {
  return (
    <button
      onClick={() => {
        haptic.light();
        onToggle();
      }}
      disabled={loading}
      className={`relative w-12 h-7 rounded-full transition-colors ${
        enabled ? "bg-brand-forest" : "bg-stone-300"
      }`}
      aria-label={label}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 text-white absolute top-1.5 left-1/2 -translate-x-1/2 animate-spin" />
      ) : (
        <span
          className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      )}
    </button>
  );
}

// --- Streak calculator ---
function computeStreak(checkIns: { date: string }[]): number {
  if (checkIns.length === 0) return 0;
  const sorted = [...checkIns]
    .map((c) => c.date)
    .sort()
    .reverse();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  // Streak must start from today or yesterday
  if (sorted[0] !== todayStr && sorted[0] !== yesterdayStr) return 0;

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffMs = prev.getTime() - curr.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const [mounted, setMounted] = useState(false);

  const {
    lastPeriodDate,
    cycleLength,
    periodDuration,
    checkIns,
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
  const [cycleReminder, setCycleReminder] = useState(true);

  useEffect(() => {
    setMounted(true);
    setDate(lastPeriodDate || "");
    setLength(cycleLength);
    setDuration(periodDuration);
  }, [lastPeriodDate, cycleLength, periodDuration]);

  // Compute stats
  const stats = useMemo(() => {
    const totalCheckIns = checkIns.length;
    const streak = computeStreak(checkIns);
    const avgGlow =
      checkIns.length > 0
        ? Math.round(
            checkIns.reduce((sum, c) => sum + c.glowScore, 0) / checkIns.length
          )
        : 0;
    return { totalCheckIns, streak, avgGlow, cycleLength };
  }, [checkIns, cycleLength]);

  if (!mounted || !isLoaded) {
    return (
      <div className="max-w-lg mx-auto space-y-5 py-6">
        <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
        <ShimmerSkeleton className="h-24" />
        <div className="grid grid-cols-2 gap-3">
          <ShimmerSkeleton className="h-28" />
          <ShimmerSkeleton className="h-28" />
          <ShimmerSkeleton className="h-28" />
          <ShimmerSkeleton className="h-28" />
        </div>
        <ShimmerSkeleton className="h-64" />
      </div>
    );
  }

  const userName = user?.fullName || "Потребител";
  const userEmail = user?.primaryEmailAddress?.emailAddress || null;
  const userImage = user?.imageUrl || null;

  function handleSave() {
    if (date) setLastPeriodDate(date);
    setCycleLength(length);
    setPeriodDuration(duration);
    setSaved(true);
    haptic.success();
    setTimeout(() => setSaved(false), 2000);
  }

  async function handlePushToggle() {
    if (pushLoading) return;
    setPushLoading(true);

    try {
      if (pushEnabled) {
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
                p256dh: btoa(
                  String.fromCharCode(
                    ...new Uint8Array(sub.getKey("p256dh")!)
                  )
                ),
                auth: btoa(
                  String.fromCharCode(...new Uint8Array(sub.getKey("auth")!))
                ),
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

  const statCards: {
    label: string;
    value: string | number;
    icon: typeof Flame;
    iconBg: string;
    iconColor: string;
  }[] = [
    {
      label: "Записи",
      value: stats.totalCheckIns,
      icon: Activity,
      iconBg: "bg-brand-sage/30",
      iconColor: "text-brand-forest",
    },
    {
      label: "Поредни дни",
      value: `${stats.streak} дни`,
      icon: Flame,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
    },
    {
      label: "Среден резултат",
      value: stats.avgGlow > 0 ? stats.avgGlow : "—",
      icon: TrendingUp,
      iconBg: "bg-brand-blush/30",
      iconColor: "text-pink-500",
    },
    {
      label: "Дължина на цикъл",
      value: `${stats.cycleLength} дни`,
      icon: Moon,
      iconBg: "bg-brand-cream/40",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <motion.div
      className="max-w-lg mx-auto space-y-5 py-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>

      {/* Avatar / User Section */}
      <motion.div
        variants={itemVariants}
        className="glass rounded-[2rem] p-5 flex items-center gap-4 shadow-lg shadow-brand-forest/5 relative overflow-hidden"
      >
        {/* Decorative organic shapes */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-brand-sage/10 blur-sm" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-brand-blush/10 blur-sm" />

        <div className="relative">
          {userImage ? (
            <Image
              src={userImage}
              alt={userName}
              width={64}
              height={64}
              className="rounded-2xl border-2 border-white shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-sage/40 to-brand-blush/40 flex items-center justify-center shadow-md">
              <User className="w-8 h-8 text-brand-forest" />
            </div>
          )}
          {/* Online indicator */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white" />
        </div>

        <div className="min-w-0 relative">
          <p className="font-display text-lg font-bold text-brand-forest truncate">
            {userName}
          </p>
          <p className="text-sm text-stone-500 truncate">
            {userEmail}
          </p>
          {stats.streak > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-xs font-semibold text-orange-600">
                {stats.streak} поредни дни
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="glass rounded-[1.5rem] p-4 flex flex-col gap-2 shadow-md shadow-brand-forest/5"
            >
              <div
                className={`w-9 h-9 rounded-xl ${stat.iconBg} flex items-center justify-center`}
              >
                <Icon className={`w-4.5 h-4.5 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-brand-forest">
                  {stat.value}
                </p>
                <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wide">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Cycle Settings */}
      <motion.section
        variants={itemVariants}
        className="glass rounded-[2rem] p-5 space-y-5 shadow-md shadow-brand-forest/5"
      >
        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-forest/60 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" />
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
            className="w-full py-3 px-4 border border-stone-200 rounded-xl text-stone-800 bg-white/60 focus:outline-none focus:ring-2 focus:ring-brand-sage/50 focus:border-brand-sage transition-shadow"
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
          <p className="text-xs text-stone-400">
            Типичен: 21-40 дни (средно 28)
          </p>
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

      {/* Quick Settings / Notifications */}
      <motion.section
        variants={itemVariants}
        className="glass rounded-[2rem] p-5 space-y-4 shadow-md shadow-brand-forest/5"
      >
        <h3 className="text-xs font-bold uppercase tracking-widest text-brand-forest/60 flex items-center gap-2">
          <Bell className="w-3.5 h-3.5" />
          Настройки
        </h3>

        {/* Push notifications */}
        {isIOSInBrowser() ? (
          <p className="text-sm text-stone-500">
            Първо добави приложението на началния екран, за да получаваш
            известия.
          </p>
        ) : isPushSupported() ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-sage/30 flex items-center justify-center">
                <Bell className="w-4 h-4 text-brand-forest" />
              </div>
              <span className="text-sm font-medium text-stone-700">
                Напомняния за запис
              </span>
            </div>
            <PremiumToggle
              enabled={pushEnabled}
              onToggle={handlePushToggle}
              loading={pushLoading}
              label={
                pushEnabled ? "Изключи известията" : "Включи известията"
              }
            />
          </div>
        ) : (
          <p className="text-sm text-stone-500">
            Браузърът ти не поддържа push известия.
          </p>
        )}

        {/* Cycle reminder toggle (UI-only) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-blush/30 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-pink-500" />
            </div>
            <span className="text-sm font-medium text-stone-700">
              Напомняне за цикъл
            </span>
          </div>
          <PremiumToggle
            enabled={cycleReminder}
            onToggle={() => setCycleReminder(!cycleReminder)}
            label={
              cycleReminder
                ? "Изключи напомняне за цикъл"
                : "Включи напомняне за цикъл"
            }
          />
        </div>
      </motion.section>

      {/* Account actions */}
      <motion.section
        variants={itemVariants}
        className="glass rounded-[2rem] divide-y divide-stone-200/50 shadow-md shadow-brand-forest/5 overflow-hidden"
      >
        <button
          onClick={() => {
            haptic.light();
            openUserProfile();
          }}
          className="flex items-center gap-3 w-full px-5 py-4 text-left hover:bg-white/30 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-brand-sage/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-brand-forest" />
          </div>
          <span className="flex-1 text-sm font-medium text-stone-700">
            Управление на акаунта
          </span>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>

        <button
          onClick={() => {
            haptic.light();
            signOut({ redirectUrl: "/" });
          }}
          className="flex items-center gap-3 w-full px-5 py-4 text-left hover:bg-white/30 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
            <LogOut className="w-4 h-4 text-red-500" />
          </div>
          <span className="flex-1 text-sm font-medium text-red-600">
            Изход
          </span>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>
      </motion.section>

      {/* App info */}
      <motion.p
        variants={itemVariants}
        className="text-center text-xs text-stone-400"
      >
        LURA App v2.0
      </motion.p>
    </motion.div>
  );
}
