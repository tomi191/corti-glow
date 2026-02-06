"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Package,
  RefreshCw,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/supabase/types";

const statusOptions = [
  { value: "", label: "Всички" },
  { value: "new", label: "Нови" },
  { value: "processing", label: "В обработка" },
  { value: "shipped", label: "Изпратени" },
  { value: "delivered", label: "Доставени" },
  { value: "cancelled", label: "Отказани" },
];

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  processing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  new: "Нова",
  processing: "В обработка",
  shipped: "Изпратена",
  delivered: "Доставена",
  cancelled: "Отказана",
};

const paymentStatusLabels: Record<string, string> = {
  pending: "Чака плащане",
  paid: "Платена",
  failed: "Неуспешна",
  refunded: "Възстановена",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-stone-100 text-stone-700",
};

function OrdersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [appliedSearch, setAppliedSearch] = useState(search);
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const limit = 20;

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter) params.set("status", statusFilter);
        if (appliedSearch) params.set("search", appliedSearch);
        params.set("limit", limit.toString());
        params.set("offset", ((page - 1) * limit).toString());

        const res = await fetch(`/api/admin/orders?${params}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
          setTotalCount(data.count || 0);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [statusFilter, page, appliedSearch, refreshKey]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(search);
  };

  const totalPages = Math.ceil(totalCount / limit);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("bg-BG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2D4A3E]">Поръчки</h1>
          <p className="text-stone-500 text-sm mt-1">
            {totalCount} поръчки общо
          </p>
        </div>

        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm font-medium hover:bg-stone-50 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Обнови
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Търси по номер, имейл или име..."
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
              />
            </div>
          </form>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E]"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-3 border-[#2D4A3E] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500">Няма намерени поръчки</p>
            <p className="text-xs text-stone-400 mt-1">
              Опитайте с други филтри или търсене
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Поръчка
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Клиент
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Дата
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Статус
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Плащане
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Сума
                    </th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-stone-50 transition">
                      <td className="px-6 py-4">
                        <span className="font-medium text-stone-800">
                          {order.order_number}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-stone-800">
                            {order.customer_first_name} {order.customer_last_name}
                          </p>
                          <p className="text-xs text-stone-500">
                            {order.customer_email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            statusColors[order.status] || "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            paymentStatusColors[order.payment_status] ||
                            "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {paymentStatusLabels[order.payment_status] ||
                            order.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-stone-800">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/porachki/${order.id}`}
                          className="text-[#2D4A3E] hover:underline text-sm flex items-center gap-1"
                        >
                          Детайли
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-stone-100">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/porachki/${order.id}`}
                  className="block p-4 hover:bg-stone-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-stone-800">
                        {order.order_number}
                      </p>
                      <p className="text-sm text-stone-500 mt-0.5">
                        {order.customer_first_name} {order.customer_last_name}
                      </p>
                      <p className="text-xs text-stone-400 mt-1">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-stone-800">
                        {formatPrice(order.total)}
                      </p>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                          statusColors[order.status] || "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between">
                <p className="text-sm text-stone-500">
                  Страница {page} от {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    }>
      <OrdersPageContent />
    </Suspense>
  );
}
