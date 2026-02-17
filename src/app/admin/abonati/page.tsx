"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Mail,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
  UserPlus,
} from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  active: boolean;
  source: string | null;
  subscribed_at: string;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 30;

  const fetchSubscribers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("limit", limit.toString());
      params.set("offset", ((page - 1) * limit).toString());

      const res = await fetch(`/api/admin/subscribers?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers || []);
        setTotalCount(data.count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch subscribers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSubscribers();
  };

  const exportCSV = () => {
    if (subscribers.length === 0) return;

    const header = "Email,Дата,Източник,Активен\n";
    const rows = subscribers
      .map(
        (s) =>
          `${s.email},${new Date(s.subscribed_at).toLocaleDateString("bg-BG")},${s.source || "website"},${s.active ? "Да" : "Не"}`
      )
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(totalCount / limit);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("bg-BG", {
      day: "2-digit",
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
          <h1 className="text-2xl font-bold text-[#2D4A3E]">Waitlist / Абонати</h1>
          <p className="text-stone-500 text-sm mt-1">
            {totalCount} записани имейла
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            disabled={subscribers.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm font-medium hover:bg-stone-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={fetchSubscribers}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm font-medium hover:bg-stone-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Обнови
          </button>
        </div>
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
              placeholder="Търси по имейл..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
            />
          </div>
        </form>
      </div>

      {/* Subscribers List */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-3 border-[#2D4A3E] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : subscribers.length === 0 ? (
          <div className="p-8 text-center">
            <UserPlus className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500">Няма записани абонати</p>
            <p className="text-xs text-stone-400 mt-1">
              Абонатите ще се появят тук след записване през waitlist модала
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
                      Имейл
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Дата
                    </th>
                    <th className="text-center px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Източник
                    </th>
                    <th className="text-center px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Статус
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {subscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-stone-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#B2D8C6] to-[#FFC1CC] flex items-center justify-center">
                            <Mail className="w-4 h-4 text-[#2D4A3E]" />
                          </div>
                          <a
                            href={`mailto:${sub.email}`}
                            className="text-sm font-medium text-stone-800 hover:text-[#2D4A3E]"
                          >
                            {sub.email}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-600">
                        {formatDate(sub.subscribed_at)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex px-2.5 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-medium">
                          {sub.source || "website"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            sub.active
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {sub.active ? "Активен" : "Отписан"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-stone-100">
              {subscribers.map((sub) => (
                <div key={sub.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#B2D8C6] to-[#FFC1CC] flex items-center justify-center">
                        <Mail className="w-4 h-4 text-[#2D4A3E]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-800">
                          {sub.email}
                        </p>
                        <p className="text-xs text-stone-400">
                          {formatDate(sub.subscribed_at)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        sub.active
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {sub.active ? "Активен" : "Отписан"}
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
