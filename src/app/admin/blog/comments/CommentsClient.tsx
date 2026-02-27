"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageCircle,
  Check,
  X,
  Trash2,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface AdminComment {
  id: string;
  blog_post_id: string;
  author_name: string;
  author_email: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  ip_address: string | null;
  created_at: string;
  blog_posts: { title: string; slug: string };
}

const statusOptions = [
  { value: "pending", label: "Чакащи" },
  { value: "approved", label: "Одобрени" },
  { value: "rejected", label: "Отхвърлени" },
  { value: "all", label: "Всички" },
];

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        limit: limit.toString(),
        offset: ((page - 1) * limit).toString(),
      });

      const res = await fetch(`/api/admin/blog/comments?${params}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    try {
      const res = await fetch("/api/admin/blog/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: action }),
      });
      if (res.ok) fetchComments();
    } catch (error) {
      console.error("Action failed:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете този коментар?")) return;
    try {
      const res = await fetch("/api/admin/blog/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) fetchComments();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2D4A3E]">Коментари</h1>
          <p className="text-stone-500 text-sm mt-1">{total} коментара</p>
        </div>
        <button
          onClick={fetchComments}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm font-medium hover:bg-stone-50 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Обнови
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-stone-400" />
        {statusOptions.map((o) => (
          <button
            key={o.value}
            onClick={() => { setStatusFilter(o.value); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              statusFilter === o.value
                ? "bg-[#2D4A3E] text-white"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Comments list */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-3 border-[#2D4A3E] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : comments.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500">Няма коментари</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {comments.map((comment) => (
              <div key={comment.id} className="p-5 hover:bg-stone-50 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Post title */}
                    <div className="flex items-center gap-2 mb-2">
                      <a
                        href={`/blog/${comment.blog_posts.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-stone-400 hover:text-[#2D4A3E] flex items-center gap-1 transition"
                      >
                        {comment.blog_posts.title}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Author info */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#B2D8C6] to-[#FFC1CC] flex items-center justify-center text-xs font-bold text-[#2D4A3E]">
                        {comment.author_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-sm text-stone-800">{comment.author_name}</span>
                      <span className="text-xs text-stone-400">{comment.author_email}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[comment.status]}`}>
                        {comment.status === "pending" ? "Чакащ" : comment.status === "approved" ? "Одобрен" : "Отхвърлен"}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">
                      {comment.content}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-stone-400">
                      <span>
                        {new Date(comment.created_at).toLocaleDateString("bg-BG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {comment.ip_address && <span>IP: {comment.ip_address}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {comment.status !== "approved" && (
                      <button
                        onClick={() => handleAction(comment.id, "approved")}
                        title="Одобри"
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {comment.status !== "rejected" && (
                      <button
                        onClick={() => handleAction(comment.id, "rejected")}
                        title="Отхвърли"
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(comment.id)}
                      title="Изтрий"
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
      </div>
    </div>
  );
}
