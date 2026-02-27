"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUserSafe } from "@/hooks/use-clerk-safe";

const HAS_CLERK = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Only load UserButton when Clerk is configured
const UserButton = HAS_CLERK
  ? dynamic(() => import("@clerk/nextjs").then((m) => m.UserButton), { ssr: false })
  : null;
import {
  Home,
  CalendarDays,
  BarChart3,
  ShoppingBag,
  User,
} from "lucide-react";
import BoxBreathingFAB from "@/components/pwa/BoxBreathingFAB";
import IOSInstallBanner from "@/components/pwa/IOSInstallBanner";
import PremiumBackground from "@/components/pwa/PremiumBackground";
import { registerServiceWorker } from "@/lib/push-notifications";
import { haptic } from "@/lib/haptics";

function useTodayDate() {
  const [dateStr, setDateStr] = useState("");
  useEffect(() => {
    setDateStr(
      new Date().toLocaleDateString("bg-BG", { day: "numeric", month: "short" })
    );
  }, []);
  return dateStr;
}

const navItems = [
  { href: "/app", label: "Начало", icon: Home },
  { href: "/app/calendar", label: "Календар", icon: CalendarDays },
  { href: "/app/insights", label: "Анализ", icon: BarChart3 },
  { href: "/app/shop", label: "Магазин", icon: ShoppingBag },
  { href: "/app/profile", label: "Профил", icon: User },
];

export default function PWALayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const todayDate = useTodayDate();
  const { user, isLoaded: clerkLoaded } = useUserSafe();
  const firstName = clerkLoaded ? user?.firstName : null;

  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Animated premium background (mesh gradient + grain) */}
      <PremiumBackground />

      {/* Glass header */}
      <header className="fixed top-0 w-full z-50 px-5 py-3 flex items-center justify-between glass">
        {/* Left: LURA + date */}
        <Link
          href="/app"
          className="flex items-baseline gap-2"
        >
          <span className="font-display text-xl font-bold tracking-tight text-brand-forest uppercase">
            Lura
          </span>
          {todayDate && (
            <span className="text-xs text-stone-400 font-medium">
              {todayDate}
            </span>
          )}
        </Link>

        {/* Right: avatar + greeting */}
        <div className="flex items-center gap-2.5">
          <span className="text-sm text-stone-600 font-medium hidden min-[360px]:block">
            {firstName ? `Здравей, ${firstName}` : "Здравей!"}
          </span>
          {UserButton ? (
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 rounded-full border-2 border-white",
                },
              }}
            />
          ) : (
            <Link href="/app/profile" className="w-9 h-9 rounded-full border-2 border-white bg-brand-sage/30 flex items-center justify-center">
              <User className="w-5 h-5 text-brand-forest" />
            </Link>
          )}
        </div>
      </header>

      {/* Main content with page transitions */}
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          className="flex-1 pt-16 pb-28 px-5"
          initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {/* Breathing FAB */}
      <BoxBreathingFAB />

      {/* iOS Add to Home Screen banner */}
      <IOSInstallBanner />

      {/* 5-tab glass navigation */}
      <nav className="fixed bottom-0 w-full z-40 px-4 py-3 pb-safe border-t border-stone-200/50 rounded-t-[2rem] bg-white/90 backdrop-blur-xl">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/app"
                ? pathname === "/app"
                : item.href === "/app/calendar"
                  ? pathname.startsWith("/app/calendar") || pathname.startsWith("/app/checkin")
                  : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => haptic.light()}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors ${
                  isActive
                    ? "text-brand-forest"
                    : "text-stone-400 hover:text-stone-600"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
