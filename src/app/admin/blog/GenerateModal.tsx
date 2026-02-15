"use client";

import { useState } from "react";
import { X, Sparkles, Loader2 } from "lucide-react";
import type { BlogPostRow } from "@/lib/supabase/types";

interface GenerateModalProps {
  onClose: () => void;
  onGenerated: (data: Partial<BlogPostRow>) => void;
}

const categoryOptions = [
  { value: "hormoni", label: "Хормони" },
  { value: "stress", label: "Стрес" },
  { value: "sŭn", label: "Сън" },
  { value: "hranene", label: "Хранене" },
  { value: "wellness", label: "Уелнес" },
];

const contentTypeOptions = [
  { value: "tofu", label: "TOFU (Top of Funnel) — образователен" },
  { value: "mofu", label: "MOFU (Middle) — сравнителен" },
  { value: "bofu", label: "BOFU (Bottom) — продуктов" },
  { value: "advertorial", label: "Advertorial — рекламен" },
];

const authorOptions = [
  { value: "dr-maria", label: "Д-р Мария Иванова (Ендокринолог)" },
  { value: "lura-team", label: "Екипът на LURA" },
];

export function GenerateModal({ onClose, onGenerated }: GenerateModalProps) {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [contentType, setContentType] = useState("tofu");
  const [category, setCategory] = useState("wellness");
  const [targetWordCount, setTargetWordCount] = useState(1500);
  const [author, setAuthor] = useState("lura-team");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!topic.trim() || topic.trim().length < 5) {
      setError("Моля, въведете тема (минимум 5 символа)");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/admin/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          keywords: keywords
            ? keywords.split(",").map((k) => k.trim()).filter(Boolean)
            : [],
          contentType,
          category,
          targetWordCount,
          author,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Грешка при генериране");
        return;
      }

      // Map author string to full author object
      const authorMap: Record<string, { name: string; credentials?: string; bio: string; image?: string }> = {
        "dr-maria": {
          name: "Д-р Мария Иванова",
          credentials: "Ендокринолог",
          bio: "Д-р Иванова е специалист по ендокринология с над 15 години опит в областта на хормоналния баланс.",
          image: "/images/author-dr-maria.webp",
        },
        "lura-team": {
          name: "Екипът на LURA",
          bio: "Експертният екип на LURA включва диетолози, wellness специалисти и изследователи, посветени на женското здраве.",
          image: "/images/author-lura-team.webp",
        },
      };

      const generated = data.generated;
      onGenerated({
        title: generated.title,
        slug: generated.slug,
        excerpt: generated.excerpt,
        content: generated.content,
        image: "",
        category: generated.category,
        author: authorMap[author] || authorMap["lura-team"],
        read_time: generated.read_time,
        featured: false,
        published: false,
        tldr: generated.tldr,
        key_takeaways: generated.key_takeaways,
        faq: generated.faq,
        sources: generated.sources,
        meta_title: generated.meta_title,
        meta_description: generated.meta_description,
        keywords: generated.keywords,
        content_type: generated.content_type,
        ai_generated: true,
        ai_model: generated.ai_model,
        word_count: generated.word_count,
      } as Partial<BlogPostRow>);
    } catch {
      setError("Грешка при свързване със сървъра");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-[#2D4A3E]">Генерирай с AI</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Тема *</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="напр. Как кортизолът влияе на качеството на съня"
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Ключови думи</label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="кортизол, сън, мелатонин (разделени със запетая)"
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Категория</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-purple-500"
              >
                {categoryOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Целеви думи</label>
              <input
                type="number"
                value={targetWordCount}
                onChange={(e) => setTargetWordCount(Number(e.target.value))}
                min={500}
                max={5000}
                step={100}
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Тип съдържание</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-purple-500"
            >
              {contentTypeOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Автор</label>
            <select
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-purple-500"
            >
              {authorOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-xl transition"
          >
            Отказ
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Генериране...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Генерирай
              </>
            )}
          </button>
        </div>

        {/* Loading overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-3" />
            <p className="text-sm font-medium text-purple-700">AI генерира статията...</p>
            <p className="text-xs text-stone-500 mt-1">Това може да отнеме до 60 секунди</p>
          </div>
        )}
      </div>
    </div>
  );
}
