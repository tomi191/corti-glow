"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  Home,
  ClipboardCheck,
  Settings,
} from "lucide-react";
import BoxBreathingFAB from "@/components/pwa/BoxBreathingFAB";

const navItems = [
  { href: "/app", label: "Начало", icon: Home },
  { href: "/app/checkin", label: "Чек-Ин", icon: ClipboardCheck },
  { href: "/app/settings", label: "Настройки", icon: Settings },
];

export default function PWALayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-brand-sand flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <Link href="/app" className="text-lg font-bold text-brand-forest tracking-wide">
          LURA
        </Link>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
            },
          }}
        />
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-6 pb-24">
        {children}
      </main>

      {/* Breathing FAB - between content and nav */}
      <BoxBreathingFAB />

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200 pb-safe">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/app"
                ? pathname === "/app"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                  isActive
                    ? "text-brand-forest"
                    : "text-stone-400 hover:text-stone-600"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
