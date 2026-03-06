"use client";

import { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  XCircle,
  CreditCard,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface SubscriptionCustomer {
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
}

interface Subscription {
  id: string;
  customer_id: string;
  stripe_subscription_id: string | null;
  variant_name: string;
  quantity: number;
  price_per_cycle: number;
  original_price: number;
  currency: string;
  status: string;
  billing_interval: string;
  current_period_start: string | null;
  current_period_end: string | null;
  next_billing_date: string | null;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  paused_at: string | null;
  created_at: string;
  customers: SubscriptionCustomer;
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
  past_due: "bg-orange-100 text-orange-700",
  incomplete: "bg-stone-100 text-stone-700",
};

const statusLabels: Record<string, string> = {
  active: "Активен",
  paused: "Паузиран",
  cancelled: "Отменен",
  past_due: "Просрочен",
  incomplete: "Незавършен",
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      params.set("limit", limit.toString());
      params.set("offset", ((page - 1) * limit).toString());

      const res = await fetch(`/api/admin/subscriptions?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.subscriptions || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error("Fetch subscriptions error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSubscriptions();
  };

  const handleAction = async (id: string, action: string) => {
    const confirmMsg =
      action === "cancel"
        ? "Сигурни ли сте, че искате да отмените този абонамент?"
        : action === "pause"
        ? "Паузиране на абонамента?"
        : "Подновяване на абонамента?";

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });

      if (res.ok) {
        fetchSubscriptions();
      } else {
        const data = await res.json();
        alert(data.error || "Грешка");
      }
    } catch (err) {
      console.error("Action error:", err);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Абонаменти</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total} абонамент{total !== 1 ? "а" : ""}
          </p>
        </div>
        <button
          onClick={fetchSubscriptions}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Опресни
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Търси по имейл или име..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]/20 focus:border-[#2D4A3E]"
          />
        </form>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2D4A3E]/20"
        >
          <option value="">Всички статуси</option>
          <option value="active">Активни</option>
          <option value="paused">Паузирани</option>
          <option value="cancelled">Отменени</option>
          <option value="past_due">Просрочени</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Клиент</th>
                <th className="text-left px-4 py-3 font-medium">Продукт</th>
                <th className="text-left px-4 py-3 font-medium">Цена</th>
                <th className="text-left px-4 py-3 font-medium">Статус</th>
                <th className="text-left px-4 py-3 font-medium">Създаден</th>
                <th className="text-left px-4 py-3 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    Зареждане...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Няма абонаменти
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {sub.customers?.first_name} {sub.customers?.last_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {sub.customers?.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900">{sub.variant_name}</div>
                      <div className="text-xs text-gray-500">
                        x{sub.quantity} / {sub.billing_interval || "месец"}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(sub.price_per_cycle)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${
                          statusColors[sub.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {statusLabels[sub.status] || sub.status}
                      </span>
                      {sub.cancel_at_period_end && sub.status === "active" && (
                        <span className="ml-1 text-xs text-orange-500">
                          (до края на периода)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(sub.created_at).toLocaleDateString("bg-BG")}
                      {sub.next_billing_date && (
                        <div className="text-gray-400">
                          Следв: {new Date(sub.next_billing_date).toLocaleDateString("bg-BG")}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {sub.status === "active" && (
                          <>
                            <button
                              onClick={() => handleAction(sub.id, "pause")}
                              className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded"
                              title="Паузирай"
                            >
                              <Pause className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction(sub.id, "cancel")}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title="Отмени"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {sub.status === "paused" && (
                          <>
                            <button
                              onClick={() => handleAction(sub.id, "resume")}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                              title="Поднови"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction(sub.id, "cancel")}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title="Отмени"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              Страница {page} от {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
