"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Smartphone,
  Bell,
  BellOff,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CalendarCheck,
  TrendingUp,
  Moon,
} from "lucide-react";

interface PwaUser {
  clerk_user_id: string;
  user_name: string | null;
  email: string | null;
  age_range: string | null;
  concerns: string[];
  push_enabled: boolean;
  created_at: string;
  total_checkins: number;
  last_checkin_date: string | null;
  avg_stress: string | null;
  avg_sleep: string | null;
}

export default function PwaUsersPage() {
  const [users, setUsers] = useState<PwaUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("limit", limit.toString());
      params.set("offset", ((page - 1) * limit).toString());

      const res = await fetch(`/api/admin/pwa-users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setTotalCount(data.count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch PWA users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const totalPages = Math.ceil(totalCount / limit);

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("bg-BG", { day: "numeric", month: "short", year: "numeric" });
  }

  function daysAgo(dateStr: string | null): string {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "днес";
    if (diff === 1) return "вчера";
    return `преди ${diff} дни`;
  }

  function stressColor(val: string | null): string {
    if (!val) return "text-stone-400";
    const n = parseFloat(val);
    if (n >= 7) return "text-red-600";
    if (n >= 4) return "text-amber-600";
    return "text-emerald-600";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2D4A3E]">PWA Потребители</h1>
          <p className="text-stone-500 text-sm mt-1">
            {totalCount} потребители общо
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm font-medium hover:bg-stone-50 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Обнови
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Търси по име или имейл..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
            />
          </div>
        </form>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-3 border-[#2D4A3E] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <Smartphone className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500">Няма намерени PWA потребители</p>
            <p className="text-xs text-stone-400 mt-1">
              Потребителите ще се появят тук след завършване на onboarding
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
                      Потребител
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Check-ins
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Последен
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Avg Стрес
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Avg Сън
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Push
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Регистрация
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {users.map((user) => (
                    <tr key={user.clerk_user_id} className="hover:bg-stone-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B2D8C6] to-[#FFC1CC] flex items-center justify-center text-[#2D4A3E] font-bold text-sm">
                            {(user.user_name || user.email || "?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-stone-800">
                              {user.user_name || "Без име"}
                            </p>
                            <p className="text-xs text-stone-500">
                              {user.email || "—"}
                            </p>
                            {user.concerns && user.concerns.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {user.concerns.slice(0, 3).map((c) => (
                                  <span
                                    key={c}
                                    className="px-1.5 py-0.5 bg-stone-100 rounded text-[10px] text-stone-500"
                                  >
                                    {c}
                                  </span>
                                ))}
                                {user.concerns.length > 3 && (
                                  <span className="text-[10px] text-stone-400">
                                    +{user.concerns.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                          <CalendarCheck className="w-3.5 h-3.5" />
                          {user.total_checkins}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div>
                          <p className="text-sm text-stone-700">
                            {formatDate(user.last_checkin_date)}
                          </p>
                          <p className="text-[10px] text-stone-400">
                            {daysAgo(user.last_checkin_date)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-sm font-semibold ${stressColor(user.avg_stress)}`}>
                          <TrendingUp className="w-3.5 h-3.5" />
                          {user.avg_stress ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">
                          <Moon className="w-3.5 h-3.5" />
                          {user.avg_sleep ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {user.push_enabled ? (
                          <Bell className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : (
                          <BellOff className="w-4 h-4 text-stone-300 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-stone-500">
                        {formatDate(user.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-stone-100">
              {users.map((user) => (
                <div key={user.clerk_user_id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B2D8C6] to-[#FFC1CC] flex items-center justify-center text-[#2D4A3E] font-bold text-sm">
                        {(user.user_name || user.email || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-stone-800">
                          {user.user_name || "Без име"}
                        </p>
                        <p className="text-xs text-stone-500">{user.email || "—"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-stone-800">
                        {user.total_checkins} check-ins
                      </p>
                      <p className="text-[10px] text-stone-400">
                        {daysAgo(user.last_checkin_date) || "няма"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2 pl-13 text-xs text-stone-500">
                    <span className={stressColor(user.avg_stress)}>
                      Стрес: {user.avg_stress ?? "—"}
                    </span>
                    <span className="text-indigo-600">
                      Сън: {user.avg_sleep ?? "—"}
                    </span>
                    <span>
                      {user.push_enabled ? "Push: Да" : "Push: Не"}
                    </span>
                  </div>
                </div>
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
