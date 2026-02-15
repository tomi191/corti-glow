"use client";

import { useState } from "react";
import { X, Save, Loader2, Eye, EyeOff, Star, StarOff } from "lucide-react";
import type { BlogPostRow } from "@/lib/supabase/types";

interface BlogPostModalProps {
  post: BlogPostRow | null;
  onClose: () => void;
  onSave: () => void;
}

type TabKey = "basic" | "content" | "seo" | "extra";

const tabs: { key: TabKey; label: string }[] = [
  { key: "basic", label: "Основни" },
  { key: "content", label: "Съдържание" },
  { key: "seo", label: "SEO" },
  { key: "extra", label: "Допълнителни" },
];

const categoryOptions = [
  { value: "hormoni", label: "Хормони" },
  { value: "stress", label: "Стрес" },
  { value: "sŭn", label: "Сън" },
  { value: "hranene", label: "Хранене" },
  { value: "wellness", label: "Уелнес" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[а-я]/g, (ch) => {
      const map: Record<string, string> = {
        а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh", з: "z",
        и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p",
        р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch",
        ш: "sh", щ: "sht", ъ: "a", ь: "y", ю: "yu", я: "ya",
      };
      return map[ch] || ch;
    })
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function BlogPostModal({ post, onClose, onSave }: BlogPostModalProps) {
  const isEdit = post?.id && !post.id.startsWith?.("demo-") && post.id.includes("-");

  const [activeTab, setActiveTab] = useState<TabKey>("basic");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Form state
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [category, setCategory] = useState(post?.category || "wellness");
  const [image, setImage] = useState(post?.image || "");
  const [readTime, setReadTime] = useState(post?.read_time || 5);
  const [featured, setFeatured] = useState(post?.featured || false);
  const [published, setPublished] = useState(post?.published || false);
  const [publishedAt, setPublishedAt] = useState(
    post?.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
  );
  const [authorName, setAuthorName] = useState(
    (post?.author as { name?: string })?.name || "Екипът на LURA"
  );
  const [authorCredentials, setAuthorCredentials] = useState(
    (post?.author as { credentials?: string })?.credentials || ""
  );
  const [authorBio, setAuthorBio] = useState(
    (post?.author as { bio?: string })?.bio || ""
  );
  const [authorImage, setAuthorImage] = useState(
    (post?.author as { image?: string })?.image || ""
  );

  // Content
  const [content, setContent] = useState(post?.content || "");

  // SEO
  const [metaTitle, setMetaTitle] = useState(post?.meta_title || "");
  const [metaDescription, setMetaDescription] = useState(post?.meta_description || "");
  const [keywords, setKeywords] = useState(
    Array.isArray(post?.keywords) ? (post.keywords as string[]).join(", ") : ""
  );

  // Extra
  const [tldr, setTldr] = useState(post?.tldr || "");
  const [keyTakeaways, setKeyTakeaways] = useState(
    Array.isArray(post?.key_takeaways) ? (post.key_takeaways as string[]).join("\n") : ""
  );
  const [faqText, setFaqText] = useState(
    Array.isArray(post?.faq)
      ? (post.faq as { question: string; answer: string }[])
          .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
          .join("\n\n")
      : ""
  );
  const [sourcesText, setSourcesText] = useState(
    Array.isArray(post?.sources)
      ? (post.sources as { title: string; publication?: string; year?: number; url?: string }[])
          .map((s) => `${s.title}${s.publication ? ` | ${s.publication}` : ""}${s.year ? ` | ${s.year}` : ""}${s.url ? ` | ${s.url}` : ""}`)
          .join("\n")
      : ""
  );

  // AI metadata (read-only display)
  const aiGenerated = post?.ai_generated || false;
  const aiModel = post?.ai_model || null;
  const contentType = post?.content_type || null;

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!isEdit) {
      setSlug(slugify(value));
    }
  };

  const parseFaq = (): { question: string; answer: string }[] => {
    if (!faqText.trim()) return [];
    return faqText
      .split(/\n\n+/)
      .map((block) => {
        const lines = block.trim().split("\n");
        const question = lines.find((l) => l.startsWith("Q:"))?.replace("Q:", "").trim() || "";
        const answer = lines.find((l) => l.startsWith("A:"))?.replace("A:", "").trim() || "";
        return question && answer ? { question, answer } : null;
      })
      .filter(Boolean) as { question: string; answer: string }[];
  };

  const parseSources = (): { title: string; publication?: string; year?: number; url?: string }[] => {
    if (!sourcesText.trim()) return [];
    return sourcesText
      .split("\n")
      .filter((l) => l.trim())
      .map((line) => {
        const parts = line.split("|").map((p) => p.trim());
        const source: { title: string; publication?: string; year?: number; url?: string } = {
          title: parts[0] || "",
        };
        if (parts[1]) source.publication = parts[1];
        if (parts[2] && !isNaN(Number(parts[2]))) source.year = Number(parts[2]);
        const urlPart = parts.find((p) => p.startsWith("http"));
        if (urlPart) source.url = urlPart;
        return source;
      });
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim() || !excerpt.trim() || !content.trim()) {
      setError("Заглавие, slug, резюме и съдържание са задължителни.");
      return;
    }

    setIsSaving(true);
    setError("");

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim(),
      content,
      image,
      category,
      author: {
        name: authorName,
        ...(authorCredentials && { credentials: authorCredentials }),
        bio: authorBio,
        ...(authorImage && { image: authorImage }),
      },
      published_at: new Date(publishedAt).toISOString(),
      read_time: readTime,
      featured,
      published,
      tldr: tldr || null,
      key_takeaways: keyTakeaways.trim()
        ? keyTakeaways.split("\n").map((l) => l.trim()).filter(Boolean)
        : [],
      faq: parseFaq(),
      sources: parseSources(),
      meta_title: metaTitle || null,
      meta_description: metaDescription || null,
      keywords: keywords
        ? keywords.split(",").map((k) => k.trim()).filter(Boolean)
        : [],
      content_type: contentType,
      ai_generated: aiGenerated,
      ai_model: aiModel,
      word_count: content.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length,
    };

    try {
      const url = isEdit ? `/api/admin/blog/${post!.id}` : "/api/admin/blog";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Грешка при запазване");
        return;
      }

      onSave();
    } catch {
      setError("Грешка при свързване със сървъра");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 pb-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="text-lg font-bold text-[#2D4A3E]">
            {isEdit ? "Редактиране на статия" : "Нова статия"}
          </h2>
          <div className="flex items-center gap-2">
            {/* Quick toggles */}
            <button
              onClick={() => setPublished(!published)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                published ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-600"
              }`}
            >
              {published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {published ? "Публикувана" : "Чернова"}
            </button>
            <button
              onClick={() => setFeatured(!featured)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                featured ? "bg-yellow-100 text-yellow-700" : "bg-stone-100 text-stone-600"
              }`}
            >
              {featured ? <Star className="w-3.5 h-3.5" /> : <StarOff className="w-3.5 h-3.5" />}
              Featured
            </button>
            <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-100 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === tab.key
                  ? "border-[#2D4A3E] text-[#2D4A3E]"
                  : "border-transparent text-stone-500 hover:text-stone-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
          )}

          {/* AI Badge */}
          {aiGenerated && (
            <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-700">
              <span className="font-medium">AI генерирано</span>
              {aiModel && <span className="text-purple-500">({aiModel})</span>}
              {contentType && <span className="text-purple-500">| {contentType}</span>}
            </div>
          )}

          {/* Tab: Basic */}
          {activeTab === "basic" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Заглавие *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
                  placeholder="Заглавие на статията"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Slug *</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
                  placeholder="slug-na-statiyata"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Резюме *</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
                  placeholder="Кратко описание на статията"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Категория</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BlogPostRow["category"])}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E]"
                  >
                    {categoryOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Време за четене (мин)</label>
                  <input
                    type="number"
                    value={readTime}
                    onChange={(e) => setReadTime(Number(e.target.value))}
                    min={1}
                    max={60}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Изображение (URL)</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
                  placeholder="/images/blog-post.webp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Дата на публикуване</label>
                <input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
                />
              </div>
              {/* Author */}
              <fieldset className="border border-stone-200 rounded-xl p-4">
                <legend className="text-sm font-medium text-stone-700 px-2">Автор</legend>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-stone-500 mb-1">Име</label>
                      <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#2D4A3E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-500 mb-1">Титла</label>
                      <input
                        type="text"
                        value={authorCredentials}
                        onChange={(e) => setAuthorCredentials(e.target.value)}
                        placeholder="напр. Ендокринолог"
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#2D4A3E]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-stone-500 mb-1">Биография</label>
                    <textarea
                      value={authorBio}
                      onChange={(e) => setAuthorBio(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#2D4A3E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-stone-500 mb-1">Снимка (URL)</label>
                    <input
                      type="text"
                      value={authorImage}
                      onChange={(e) => setAuthorImage(e.target.value)}
                      placeholder="/images/author-name.webp"
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#2D4A3E]"
                    />
                  </div>
                </div>
              </fieldset>
            </div>
          )}

          {/* Tab: Content */}
          {activeTab === "content" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-stone-700">Съдържание (HTML/Markdown) *</label>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-xs text-[#2D4A3E] hover:underline"
                >
                  {showPreview ? "Редактор" : "Преглед"}
                </button>
              </div>
              {showPreview ? (
                <div
                  className="prose prose-stone max-w-none p-6 border border-stone-200 rounded-xl min-h-[400px] bg-stone-50 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
                  placeholder="HTML съдържание на статията..."
                />
              )}
              <p className="text-xs text-stone-400">
                Брой думи: ~{content.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length}
              </p>
            </div>
          )}

          {/* Tab: SEO */}
          {activeTab === "seo" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Meta Title</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
                  placeholder={title || "Заглавието ще се използва ако е празно"}
                />
                <p className="text-xs text-stone-400 mt-1">{(metaTitle || title).length}/60 символа</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Meta Description</label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
                  placeholder={excerpt || "Резюмето ще се използва ако е празно"}
                />
                <p className="text-xs text-stone-400 mt-1">{(metaDescription || excerpt).length}/155 символа</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Ключови думи</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
                  placeholder="кортизол, стрес, ашваганда (разделени със запетая)"
                />
              </div>
              {/* Google Preview */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                <p className="text-xs text-stone-400 mb-2 font-medium">Google Preview</p>
                <div className="space-y-1">
                  <p className="text-[#1a0dab] text-base hover:underline cursor-pointer line-clamp-1">
                    {metaTitle || title || "Заглавие на статията"}
                  </p>
                  <p className="text-[#006621] text-xs">luralab.eu/blog/{slug || "slug"}</p>
                  <p className="text-stone-600 text-sm line-clamp-2">
                    {metaDescription || excerpt || "Описание на статията..."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Extra */}
          {activeTab === "extra" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">TL;DR</label>
                <textarea
                  value={tldr}
                  onChange={(e) => setTldr(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
                  placeholder="40-60 думи кратко обобщение"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Ключови изводи (по едно на ред)</label>
                <textarea
                  value={keyTakeaways}
                  onChange={(e) => setKeyTakeaways(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
                  placeholder="Извод 1&#10;Извод 2&#10;Извод 3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  FAQ (формат: Q: въпрос / A: отговор, разделени с празен ред)
                </label>
                <textarea
                  value={faqText}
                  onChange={(e) => setFaqText(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
                  placeholder={"Q: Какъв е въпросът?\nA: Ето отговора.\n\nQ: Втори въпрос?\nA: Втори отговор."}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Източници (по един на ред, формат: Заглавие | Издание | Година | URL)
                </label>
                <textarea
                  value={sourcesText}
                  onChange={(e) => setSourcesText(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
                  placeholder="Study on Ashwagandha | Indian J Psychol Med | 2012 | https://..."
                />
              </div>
            </div>
          )}
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
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-[#2D4A3E] text-white rounded-xl text-sm font-medium hover:bg-[#1a2e26] disabled:opacity-50 transition"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? "Запази промените" : "Създай статия"}
          </button>
        </div>
      </div>
    </div>
  );
}
