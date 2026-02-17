"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  Home,
  CalendarDays,
  BarChart3,
  ShoppingBag,
  User,
} from "lucide-react";
import BoxBreathingFAB from "@/components/pwa/BoxBreathingFAB";

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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Glass header */}
      <header className="fixed top-0 w-full z-50 px-5 py-3 flex items-center justify-between glass">
        <Link
          href="/app"
          className="font-display text-xl font-bold tracking-tight text-brand-forest uppercase"
        >
          Lura
        </Link>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-9 h-9 rounded-full border-2 border-white",
            },
          }}
        />
      </header>

      {/* Main content with gradient */}
      <main className="flex-1 pt-16 pb-28 px-5 gradient-bg">
        {children}
      </main>

      {/* Breathing FAB */}
      <BoxBreathingFAB />

      {/* 5-tab glass navigation */}
      <nav className="fixed bottom-0 w-full z-40 glass px-4 py-3 pb-safe border-t border-stone-200/50 rounded-t-[2rem]">
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
