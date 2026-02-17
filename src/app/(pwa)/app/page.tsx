"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { BookHeart, TrendingUp, Sparkles } from "lucide-react";

const quickActions = [
  {
    href: "/app/log",
    label: "Кортизол Дневник",
    description: "Запиши как се чувстваш днес",
    icon: BookHeart,
    color: "bg-brand-sage/30 text-brand-forest",
  },
  {
    href: "/app/progress",
    label: "Моят Прогрес",
    description: "Виж своя напредък",
    icon: TrendingUp,
    color: "bg-brand-cream/50 text-amber-700",
  },
  {
    href: "/app/profile",
    label: "Glow Guide Резултати",
    description: "Персонализиран план",
    icon: Sparkles,
    color: "bg-brand-blush/30 text-pink-700",
  },
];

export default function AppDashboard() {
  const { user } = useUser();
  const firstName = user?.firstName || "there";

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-brand-forest">
          Здравей, {firstName}!
        </h1>
        <p className="text-stone-500 mt-1">
          Готова ли си за днешния ритуал?
        </p>
      </div>

      {/* Quick actions */}
      <div className="space-y-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-stone-800">{action.label}</p>
                <p className="text-sm text-stone-500">{action.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
