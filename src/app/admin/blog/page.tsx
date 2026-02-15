"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  FileText,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import type { BlogPostRow } from "@/lib/supabase/types";
import { BlogPostModal } from "./BlogPostModal";
import { GenerateModal } from "./GenerateModal";

const categoryOptions = [
  { value: "all", label: "Всички категории" },
  { value: "hormoni", label: "Хормони" },
  { value: "stress", label: "Стрес" },
  { value: "sŭn", label: "Сън" },
  { value: "hranene", label: "Хранене" },
  { value: "wellness", label: "Уелнес" },
];

const publishedOptions = [
  { value: "all", label: "Всички" },
  { value: "true", label: "Публикувани" },
  { value: "false", label: "Чернови" },
];

const categoryColors: Record<string, string> = {
  hormoni: "bg-pink-100 text-pink-700",
  stress: "bg-green-100 text-green-700",
  sŭn: "bg-yellow-100 text-yellow-700",
  hranene: "bg-orange-100 text-orange-700",
  wellness: "bg-stone-100 text-stone-700",
};

const categoryLabels: Record<string, string> = {
  hormoni: "Хормони",
  stress: "Стрес",
  sŭn: "Сън",
  hranene: "Хранене",
  wellness: "Уелнес",
};

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [publishedFilter, setPublishedFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<BlogPostRow | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const limit = 20;

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (publishedFilter !== "all") params.set("published", publishedFilter);
      if (search) params.set("search", search);
      params.set("limit", limit.toString());
      params.set("offset", ((page - 1) * limit).toString());

      const res = await fetch(`/api/admin/blog?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
        setTotalCount(data.total || 0);
        setIsDemoMode(data.demo || false);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [categoryFilter, publishedFilter, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  const handleEdit = (post: BlogPostRow) => {
    setSelectedPost(post);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleCreate = () => {
    setSelectedPost(null);
    setIsModalOpen(true);
  };

  const handleTogglePublished = async (post: BlogPostRow) => {
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !post.published }),
      });
      if (res.ok) fetchPosts();
    } catch (error) {
      console.error("Failed to toggle published:", error);
    }
    setOpenMenuId(null);
  };

  const handleToggleFeatured = async (post: BlogPostRow) => {
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !post.featured }),
      });
      if (res.ok) fetchPosts();
    } catch (error) {
      console.error("Failed to toggle featured:", error);
    }
    setOpenMenuId(null);
  };

  const handleDelete = async (post: BlogPostRow) => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете "${post.title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, { method: "DELETE" });
      if (res.ok) fetchPosts();
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
    setOpenMenuId(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const handleModalSave = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
    fetchPosts();
  };

  const handleGenerateComplete = (generatedData: Partial<BlogPostRow>) => {
    setIsGenerateOpen(false);
    // Pre-fill the BlogPostModal with generated data
    setSelectedPost(generatedData as BlogPostRow);
    setIsModalOpen(true);
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
              Показват се примерни данни. Свържете Supabase за реални публикации.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2D4A3E]">Блог</h1>
          <p className="text-stone-500 text-sm mt-1">{totalCount} статии общо</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchPosts}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm font-medium hover:bg-stone-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Обнови
          </button>
          <button
            onClick={() => setIsGenerateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-purple-200 text-purple-700 rounded-xl text-sm font-medium hover:bg-purple-50 transition"
          >
            <Sparkles className="w-4 h-4" />
            Генерирай с AI
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#2D4A3E] text-white rounded-xl text-sm font-medium hover:bg-[#1a2e26] transition"
          >
            <Plus className="w-4 h-4" />
            Нова Статия
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Търси по заглавие или slug..."
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
              />
            </div>
          </form>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E]"
            >
              {categoryOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select
              value={publishedFilter}
              onChange={(e) => { setPublishedFilter(e.target.value); setPage(1); }}
              className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E]"
            >
              {publishedOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-3 border-[#2D4A3E] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500">Няма намерени статии</p>
            <p className="text-xs text-stone-400 mt-1">Създайте първата си статия</p>
            <button
              onClick={handleCreate}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#2D4A3E] text-white rounded-xl text-sm font-medium hover:bg-[#1a2e26] transition"
            >
              <Plus className="w-4 h-4" />
              Нова Статия
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">Заглавие</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">Категория</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">Автор</th>
                    <th className="text-center px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">Статус</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-stone-500 uppercase tracking-wide">Дата</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {posts.map((post) => {
                    const author = post.author as { name?: string } | null;
                    return (
                      <tr key={post.id} className="hover:bg-stone-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {post.featured && <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                            <div>
                              <p className="font-medium text-stone-800 line-clamp-1">{post.title}</p>
                              <div className="flex items-center gap-2 text-xs text-stone-500">
                                <span>{post.slug}</span>
                                {post.ai_generated && (
                                  <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded text-[10px] font-medium">AI</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors[post.category] || "bg-stone-100 text-stone-700"}`}>
                            {categoryLabels[post.category] || post.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-stone-600">
                          {author?.name || "—"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {post.published ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <Eye className="w-3 h-3" /> Публикувана
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-600">
                              <EyeOff className="w-3 h-3" /> Чернова
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-stone-500">
                          {new Date(post.published_at).toLocaleDateString("bg-BG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <button
                              onClick={() => setOpenMenuId(openMenuId === post.id ? null : post.id)}
                              className="p-2 hover:bg-stone-100 rounded-lg transition"
                            >
                              <MoreVertical className="w-4 h-4 text-stone-500" />
                            </button>
                            {openMenuId === post.id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-stone-200 rounded-xl shadow-lg z-10 py-1">
                                <button onClick={() => handleEdit(post)} className="w-full px-4 py-2 text-left text-sm hover:bg-stone-50 flex items-center gap-2">
                                  <Edit className="w-4 h-4" /> Редактирай
                                </button>
                                <button onClick={() => handleTogglePublished(post)} className="w-full px-4 py-2 text-left text-sm hover:bg-stone-50 flex items-center gap-2">
                                  {post.published ? <><EyeOff className="w-4 h-4" /> Скрий</> : <><Eye className="w-4 h-4" /> Публикувай</>}
                                </button>
                                <button onClick={() => handleToggleFeatured(post)} className="w-full px-4 py-2 text-left text-sm hover:bg-stone-50 flex items-center gap-2">
                                  {post.featured ? <><StarOff className="w-4 h-4" /> Премахни Featured</> : <><Star className="w-4 h-4" /> Направи Featured</>}
                                </button>
                                {post.published && (
                                  <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="w-full px-4 py-2 text-left text-sm hover:bg-stone-50 flex items-center gap-2">
                                    <ExternalLink className="w-4 h-4" /> Виж на сайта
                                  </a>
                                )}
                                <hr className="my-1 border-stone-100" />
                                <button onClick={() => handleDelete(post)} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                  <Trash2 className="w-4 h-4" /> Изтрий
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-stone-100">
              {posts.map((post) => {
                const author = post.author as { name?: string } | null;
                return (
                  <div key={post.id} className="p-4 hover:bg-stone-50 transition" onClick={() => handleEdit(post)}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {post.featured && <Star className="w-3.5 h-3.5 text-yellow-500" />}
                          <p className="font-medium text-stone-800 line-clamp-2">{post.title}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[post.category] || "bg-stone-100 text-stone-700"}`}>
                            {categoryLabels[post.category] || post.category}
                          </span>
                          {post.published ? (
                            <Eye className="w-4 h-4 text-green-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-stone-400" />
                          )}
                          <span className="text-xs text-stone-500">{author?.name}</span>
                        </div>
                      </div>
                      <span className="text-xs text-stone-400 whitespace-nowrap">
                        {new Date(post.published_at).toLocaleDateString("bg-BG", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between">
                <p className="text-sm text-stone-500">Страница {page} от {totalPages}</p>
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
      {openMenuId && <div className="fixed inset-0 z-0" onClick={() => setOpenMenuId(null)} />}

      {/* Blog Post Modal */}
      {isModalOpen && (
        <BlogPostModal
          post={selectedPost}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}

      {/* AI Generate Modal */}
      {isGenerateOpen && (
        <GenerateModal
          onClose={() => setIsGenerateOpen(false)}
          onGenerated={handleGenerateComplete}
        />
      )}
    </div>
  );
}
