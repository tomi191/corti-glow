"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Tag,
  RefreshCw,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  Percent,
  DollarSign,
  Copy,
  CheckCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Discount, DiscountType } from "@/lib/supabase/types";
import { DiscountModal } from "./DiscountModal";

const statusOptions = [
  { value: "all", label: "Всички" },
  { value: "active", label: "Активни" },
  { value: "inactive", label: "Неактивни" },
];

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const limit = 20;

  const fetchDiscounts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      params.set("limit", limit.toString());
      params.set("offset", ((page - 1) * limit).toString());

      const res = await fetch(`/api/admin/discounts?${params}`);
      if (res.ok) {
        const data = await res.json();
        setDiscounts(data.discounts || []);
        setTotalCount(data.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch discounts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, [statusFilter, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDiscounts();
  };

  const handleEdit = (discount: Discount) => {
    setSelectedDiscount(discount);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleCreate = () => {
    setSelectedDiscount(null);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (discount: Discount) => {
    try {
      const res = await fetch(`/api/admin/discounts/${discount.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !discount.active }),
      });
      if (res.ok) {
        fetchDiscounts();
      }
    } catch (error) {
      console.error("Failed to update discount:", error);
    }
    setOpenMenuId(null);
  };

  const handleDelete = async (discount: Discount) => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете код "${discount.code}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/discounts/${discount.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchDiscounts();
      }
    } catch (error) {
      console.error("Failed to delete discount:", error);
    }
    setOpenMenuId(null);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDiscount(null);
  };

  const handleModalSave = () => {
    setIsModalOpen(false);
    setSelectedDiscount(null);
    fetchDiscounts();
  };

  const totalPages = Math.ceil(totalCount / limit);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("bg-BG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDiscountDisplay = (discount: Discount) => {
    if (discount.type === "percentage") {
      return `${discount.value}%`;
    }
    return formatPrice(discount.value);
  };

  const isExpired = (discount: Discount) => {
    if (!discount.end_date) return false;
    return new Date(discount.end_date) < new Date();
  };

  const isNotStarted = (discount: Discount) => {
    if (!discount.start_date) return false;
    return new Date(discount.start_date) > new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2D4A3E]">Промоции</h1>
          <p className="text-stone-500 text-sm mt-1">
            {totalCount} промо кода общо
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchDiscounts}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm font-medium hover:bg-stone-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Обнови
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#2D4A3E] text-white rounded-xl text-sm font-medium hover:bg-[#1a2e26] transition"
          >
            <Plus className="w-4 h-4" />
            Нов Код
          </button>
        </div>
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
                placeholder="Търси по код..."
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

      {/* Discounts Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-3 border-[#2D4A3E] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : discounts.length === 0 ? (
          <div className="p-8 text-center">
            <Tag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500">Няма намерени промо кодове</p>
            <p className="text-xs text-stone-400 mt-1">
              Създайте първия си промо код
            </p>
            <button
              onClick={handleCreate}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#2D4A3E] text-white rounded-xl text-sm font-medium hover:bg-[#1a2e26] transition"
            >
              <Plus className="w-4 h-4" />
              Нов Код
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Код
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Отстъпка
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Използван
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Валидност
                    </th>
                    <th className="text-center px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Статус
                    </th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {discounts.map((discount) => (
                    <tr key={discount.id} className="hover:bg-stone-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="px-3 py-1.5 bg-stone-100 rounded-lg text-sm font-mono font-bold text-stone-800">
                            {discount.code}
                          </code>
                          <button
                            onClick={() => handleCopyCode(discount.code)}
                            className="p-1.5 hover:bg-stone-100 rounded-lg transition"
                            title="Копирай код"
                          >
                            {copiedCode === discount.code ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-stone-400" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {discount.type === "percentage" ? (
                            <Percent className="w-4 h-4 text-[#2D4A3E]" />
                          ) : (
                            <DollarSign className="w-4 h-4 text-[#2D4A3E]" />
                          )}
                          <span className="font-bold text-stone-800">
                            {getDiscountDisplay(discount)}
                          </span>
                          {discount.min_order_value && (
                            <span className="text-xs text-stone-400">
                              (мин. {formatPrice(discount.min_order_value)})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-600">
                        {discount.used_count}
                        {discount.max_uses && (
                          <span className="text-stone-400"> / {discount.max_uses}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-500">
                        {discount.start_date || discount.end_date ? (
                          <div>
                            <span>{formatDate(discount.start_date)}</span>
                            <span className="mx-1">-</span>
                            <span>{formatDate(discount.end_date)}</span>
                          </div>
                        ) : (
                          "Без срок"
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isExpired(discount) ? (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            Изтекъл
                          </span>
                        ) : isNotStarted(discount) ? (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            Предстоящ
                          </span>
                        ) : discount.active ? (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Активен
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-700">
                            Неактивен
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === discount.id ? null : discount.id)}
                            className="p-2 hover:bg-stone-100 rounded-lg transition"
                          >
                            <MoreVertical className="w-4 h-4 text-stone-500" />
                          </button>

                          {openMenuId === discount.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-stone-200 rounded-xl shadow-lg z-10 py-1">
                              <button
                                onClick={() => handleEdit(discount)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-stone-50 flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Редактирай
                              </button>
                              <button
                                onClick={() => handleToggleActive(discount)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-stone-50 flex items-center gap-2"
                              >
                                {discount.active ? (
                                  <>
                                    <ToggleLeft className="w-4 h-4" />
                                    Деактивирай
                                  </>
                                ) : (
                                  <>
                                    <ToggleRight className="w-4 h-4" />
                                    Активирай
                                  </>
                                )}
                              </button>
                              <hr className="my-1 border-stone-100" />
                              <button
                                onClick={() => handleDelete(discount)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Изтрий
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-stone-100">
              {discounts.map((discount) => (
                <div
                  key={discount.id}
                  className="p-4 hover:bg-stone-50 transition"
                  onClick={() => handleEdit(discount)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <code className="px-2 py-1 bg-stone-100 rounded text-sm font-mono font-bold text-stone-800">
                        {discount.code}
                      </code>
                      <div className="flex items-center gap-2 mt-2">
                        {discount.type === "percentage" ? (
                          <Percent className="w-4 h-4 text-[#2D4A3E]" />
                        ) : (
                          <DollarSign className="w-4 h-4 text-[#2D4A3E]" />
                        )}
                        <span className="font-bold text-stone-800">
                          {getDiscountDisplay(discount)}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-1">
                        Използван: {discount.used_count}
                        {discount.max_uses && ` / ${discount.max_uses}`}
                      </p>
                    </div>
                    <div className="text-right">
                      {discount.active ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Активен
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700">
                          Неактивен
                        </span>
                      )}
                    </div>
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

      {/* Click outside to close menu */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setOpenMenuId(null)}
        />
      )}

      {/* Discount Modal */}
      {isModalOpen && (
        <DiscountModal
          discount={selectedDiscount}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
}
