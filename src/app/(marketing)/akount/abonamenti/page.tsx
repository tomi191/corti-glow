"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  RefreshCw,
  Pause,
  Play,
  XCircle,
  SkipForward,
  Loader2,
  Package,
  Mail,
} from "lucide-react";

interface Subscription {
  id: string;
  variant_name: string;
  price_per_cycle: number;
  original_price: number;
  status: string;
  billing_interval: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  active: "Активен",
  paused: "Паузиран",
  cancelled: "Отменен",
  past_due: "Просрочен",
  incomplete: "Непълен",
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-stone-100 text-stone-500",
  past_due: "bg-red-100 text-red-800",
  incomplete: "bg-stone-100 text-stone-500",
};

export default function SubscriptionsPage() {
  const [email, setEmail] = useState("");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [looked, setLooked] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/account/subscriptions?email=${encodeURIComponent(email)}`
      );
      const data = await res.json();
      setSubscriptions(data.subscriptions || []);
      setLooked(true);
    } catch {
      setSubscriptions([]);
      setLooked(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    subId: string,
    action: "pause" | "resume" | "cancel" | "skip"
  ) => {
    setActionLoading(`${subId}-${action}`);
    try {
      await fetch(`/api/subscriptions/${subId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      // Refresh
      await handleLookup({ preventDefault: () => {} } as React.FormEvent);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#2D4A3E]">
            Моите Абонаменти
          </h1>
          <p className="text-stone-500 mt-1">
            Управлявай месечните си доставки на Corti-Glow.
          </p>
        </div>

        {/* Email lookup */}
        <form onSubmit={handleLookup} className="flex gap-3">
          <div className="flex-1 relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Въведи имейла си"
              required
              className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B2D8C6] text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#2D4A3E] text-white rounded-xl text-sm font-medium disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Провери"
            )}
          </button>
        </form>

        {/* Results */}
        {looked && subscriptions.length === 0 && (
          <div className="text-center py-12 text-stone-400">
            <Package className="w-12 h-12 mx-auto mb-3 text-stone-300" />
            <p>Няма намерени абонаменти за този имейл.</p>
          </div>
        )}

        {subscriptions.map((sub) => (
          <motion.div
            key={sub.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-stone-200 p-6 space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#2D4A3E]">
                  Corti-Glow ({sub.variant_name})
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusColors[sub.status] || "bg-stone-100 text-stone-500"
                    }`}
                  >
                    <RefreshCw className="w-3 h-3" />
                    {statusLabels[sub.status] || sub.status}
                  </span>
                  {sub.cancel_at_period_end && (
                    <span className="text-xs text-stone-400">
                      (ще бъде отменен в края на периода)
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-[#2D4A3E]">
                  €{sub.price_per_cycle}
                </p>
                <p className="text-xs text-stone-400 line-through">
                  €{sub.original_price}
                </p>
                <p className="text-xs text-stone-500">/месец</p>
              </div>
            </div>

            {/* Period info */}
            {sub.current_period_end && (
              <p className="text-sm text-stone-500">
                Следващо плащане:{" "}
                <strong>
                  {new Date(sub.current_period_end).toLocaleDateString("bg-BG")}
                </strong>
              </p>
            )}

            {/* Actions */}
            {sub.status !== "cancelled" && (
              <div className="flex flex-wrap gap-2 pt-2">
                {sub.status === "active" && (
                  <>
                    <button
                      onClick={() => handleAction(sub.id, "pause")}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === `${sub.id}-pause` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Pause className="w-3.5 h-3.5" />
                      )}
                      Паузирай
                    </button>
                    <button
                      onClick={() => handleAction(sub.id, "skip")}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === `${sub.id}-skip` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <SkipForward className="w-3.5 h-3.5" />
                      )}
                      Пропусни Месец
                    </button>
                  </>
                )}
                {sub.status === "paused" && (
                  <button
                    onClick={() => handleAction(sub.id, "resume")}
                    disabled={!!actionLoading}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm bg-[#2D4A3E] text-white rounded-lg hover:bg-[#1f352c] transition-colors disabled:opacity-50"
                  >
                    {actionLoading === `${sub.id}-resume` ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                    Възобнови
                  </button>
                )}
                {!sub.cancel_at_period_end && (
                  <button
                    onClick={() => handleAction(sub.id, "cancel")}
                    disabled={!!actionLoading}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === `${sub.id}-cancel` ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    Отмени
                  </button>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
