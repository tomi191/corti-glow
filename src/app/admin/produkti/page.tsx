"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Package,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Archive,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Product, ProductStatus, ProductVariantDB } from "@/lib/supabase/types";
import { ProductModal } from "./ProductModal";

const statusOptions = [
  { value: "all", label: "Всички" },
  { value: "active", label: "Активни" },
  { value: "draft", label: "Чернови" },
  { value: "archived", label: "Архивирани" },
];

const statusColors: Record<ProductStatus, string> = {
  active: "bg-green-100 text-green-700",
  draft: "bg-yellow-100 text-yellow-700",
  archived: "bg-stone-100 text-stone-700",
};

const statusLabels: Record<ProductStatus, string> = {
  active: "Активен",
  draft: "Чернова",
  archived: "Архивиран",
};

function getVariantPriceInfo(variants: unknown): { minPrice: number; count: number } | null {
  if (!Array.isArray(variants) || variants.length === 0) return null;
  const typed = variants as ProductVariantDB[];
  const prices = typed.map((v) => v.price);
  return { minPrice: Math.min(...prices), count: typed.length };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const limit = 20;

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      params.set("limit", limit.toString());
      params.set("offset", ((page - 1) * limit).toString());

      const res = await fetch(`/api/admin/products?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setTotalCount(data.total || 0);
        setIsDemoMode(data.demo || false);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [statusFilter, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleTogglePublished = async (product: Product) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !product.published }),
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Failed to update product:", error);
    }
    setOpenMenuId(null);
  };

  const handleArchive = async (product: Product) => {
    try {
      const newStatus = product.status === "archived" ? "active" : "archived";
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Failed to archive product:", error);
    }
    setOpenMenuId(null);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете "${product.name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
    setOpenMenuId(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleModalSave = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    fetchProducts();
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Демо Режим</p>
            <p className="text-xs text-amber-600">
              Показват се примерни данни. Свържете Supabase за реални продукти.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2D4A3E]">Продукти</h1>
          <p className="text-stone-500 text-sm mt-1">
            {totalCount} продукта общо
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchProducts}
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
            Нов Продукт
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
                placeholder="Търси по име или slug..."
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

      {/* Products Grid/Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-3 border-[#2D4A3E] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500">Няма намерени продукти</p>
            <p className="text-xs text-stone-400 mt-1">
              Създайте първия си продукт
            </p>
            <button
              onClick={handleCreate}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#2D4A3E] text-white rounded-xl text-sm font-medium hover:bg-[#1a2e26] transition"
            >
              <Plus className="w-4 h-4" />
              Нов Продукт
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
                      Продукт
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Статус
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Наличност
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Цена
                    </th>
                    <th className="text-center px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Публикуван
                    </th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-stone-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-stone-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-stone-800">{product.name}</p>
                            <div className="flex items-center gap-2 text-xs text-stone-500">
                              <span>{product.slug}</span>
                              {product.sku && (
                                <>
                                  <span className="text-stone-300">|</span>
                                  <span className="font-mono">{product.sku}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            statusColors[product.status]
                          }`}
                        >
                          {statusLabels[product.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                              product.stock <= 0
                                ? "bg-red-100 text-red-700"
                                : product.stock <= (product.low_stock_threshold || 10)
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {product.stock <= 0
                              ? "Изчерпан"
                              : product.stock <= (product.low_stock_threshold || 10)
                              ? `${product.stock} бр. (нисък)`
                              : `${product.stock} бр.`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {(() => {
                          const info = getVariantPriceInfo(product.variants);
                          return (
                            <div>
                              <p className="font-bold text-stone-800">
                                {info ? `от ${formatPrice(info.minPrice)}` : formatPrice(product.price)}
                              </p>
                              {!info && product.compare_at_price && (
                                <p className="text-xs text-stone-400 line-through">
                                  {formatPrice(product.compare_at_price)}
                                </p>
                              )}
                              {info && info.count > 1 && (
                                <p className="text-xs text-stone-400">
                                  {info.count} варианта
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {product.published ? (
                          <Eye className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-stone-400 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                            className="p-2 hover:bg-stone-100 rounded-lg transition"
                          >
                            <MoreVertical className="w-4 h-4 text-stone-500" />
                          </button>

                          {openMenuId === product.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-stone-200 rounded-xl shadow-lg z-10 py-1">
                              <button
                                onClick={() => handleEdit(product)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-stone-50 flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Редактирай
                              </button>
                              <button
                                onClick={() => handleTogglePublished(product)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-stone-50 flex items-center gap-2"
                              >
                                {product.published ? (
                                  <>
                                    <EyeOff className="w-4 h-4" />
                                    Скрий
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4" />
                                    Публикувай
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleArchive(product)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-stone-50 flex items-center gap-2"
                              >
                                <Archive className="w-4 h-4" />
                                {product.status === "archived" ? "Възстанови" : "Архивирай"}
                              </button>
                              <hr className="my-1 border-stone-100" />
                              <button
                                onClick={() => handleDelete(product)}
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
              {products.map((product) => (
                <div
                  key={product.id}
                  className="p-4 hover:bg-stone-50 transition"
                  onClick={() => handleEdit(product)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-stone-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-stone-800">{product.name}</p>
                          <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                            <span>{product.slug}</span>
                            {product.sku && (
                              <span className="font-mono text-stone-400">{product.sku}</span>
                            )}
                          </div>
                        </div>
                        {(() => {
                          const info = getVariantPriceInfo(product.variants);
                          return (
                            <div className="text-right">
                              <p className="font-bold text-stone-800">
                                {info ? `от ${formatPrice(info.minPrice)}` : formatPrice(product.price)}
                              </p>
                              {info && info.count > 1 && (
                                <p className="text-xs text-stone-400">
                                  {info.count} варианта
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[product.status]
                          }`}
                        >
                          {statusLabels[product.status]}
                        </span>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            product.stock <= 0
                              ? "bg-red-100 text-red-700"
                              : product.stock <= (product.low_stock_threshold || 10)
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {product.stock <= 0
                            ? "Изчерпан"
                            : `${product.stock} бр.`}
                        </span>
                        {product.published ? (
                          <Eye className="w-4 h-4 text-green-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-stone-400" />
                        )}
                      </div>
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

      {/* Product Modal */}
      {isModalOpen && (
        <ProductModal
          product={selectedProduct}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
}
