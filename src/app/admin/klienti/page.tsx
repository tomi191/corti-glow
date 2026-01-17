"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Users,
  Mail,
  Phone,
  ShoppingBag,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Customer } from "@/lib/supabase/types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("limit", limit.toString());
      params.set("offset", ((page - 1) * limit).toString());

      const res = await fetch(`/api/admin/customers?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
        setTotalCount(data.count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2D4A3E]">Клиенти</h1>
          <p className="text-stone-500 text-sm mt-1">
            {totalCount} клиенти общо
          </p>
        </div>

        <button
          onClick={fetchCustomers}
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
              placeholder="Търси по имейл или име..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
            />
          </div>
        </form>
      </div>

      {/* Customers List */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-3 border-[#2D4A3E] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500">Няма намерени клиенти</p>
            <p className="text-xs text-stone-400 mt-1">
              Клиентите ще се появят тук след първата поръчка
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
                      Клиент
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Контакт
                    </th>
                    <th className="text-center px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Поръчки
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Общо изхарчено
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {customers.map((customer, index) => (
                    <tr key={index} className="hover:bg-stone-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B2D8C6] to-[#FFC1CC] flex items-center justify-center text-[#2D4A3E] font-bold">
                            {customer.first_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-stone-800">
                              {customer.first_name} {customer.last_name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-stone-600">
                            <Mail className="w-4 h-4 text-stone-400" />
                            <a
                              href={`mailto:${customer.email}`}
                              className="hover:text-[#2D4A3E]"
                            >
                              {customer.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-stone-600">
                            <Phone className="w-4 h-4 text-stone-400" />
                            <a
                              href={`tel:${customer.phone}`}
                              className="hover:text-[#2D4A3E]"
                            >
                              {customer.phone}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                          <ShoppingBag className="w-4 h-4" />
                          {customer.order_count}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-stone-800">
                          {formatPrice(customer.total_spent)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-stone-100">
              {customers.map((customer, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B2D8C6] to-[#FFC1CC] flex items-center justify-center text-[#2D4A3E] font-bold">
                        {customer.first_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-stone-800">
                          {customer.first_name} {customer.last_name}
                        </p>
                        <p className="text-sm text-stone-500">{customer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-stone-800">
                        {formatPrice(customer.total_spent)}
                      </p>
                      <p className="text-xs text-stone-500">
                        {customer.order_count} поръчки
                      </p>
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
    </div>
  );
}
