"use client";

import { useState, useCallback } from "react";
import {
  X,
  Sparkles,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import type { BlogPostRow } from "@/lib/supabase/types";

interface GenerateModalProps {
  onClose: () => void;
  onGenerated: (data: Partial<BlogPostRow>) => void;
}

interface ImagePrompt {
  id: string;
  prompt: string;
  section: string;
}

interface ImageResult {
  id: string;
  url: string;
  status: "pending" | "generating" | "done" | "error";
  error?: string;
}

type Step = "form" | "preview" | "images";

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

const authorMap: Record<
  string,
  { name: string; credentials?: string; bio: string; image?: string }
> = {
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

export function GenerateModal({ onClose, onGenerated }: GenerateModalProps) {
  // Form state
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [contentType, setContentType] = useState("tofu");
  const [category, setCategory] = useState("wellness");
  const [targetWordCount, setTargetWordCount] = useState(1500);
  const [author, setAuthor] = useState("lura-team");

  // Suggest topic state
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionReasoning, setSuggestionReasoning] = useState("");

  // Flow state
  const [step, setStep] = useState<Step>("form");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  // Generated data (from text generation step)
  const [generatedData, setGeneratedData] = useState<Record<string, unknown> | null>(null);
  const [imagePrompts, setImagePrompts] = useState<ImagePrompt[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

  // Image generation state
  const [imageResults, setImageResults] = useState<Map<string, ImageResult>>(new Map());
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(-1);

  // Suggest a trending topic with AI
  const handleSuggestTopic = async () => {
    setIsSuggesting(true);
    setError("");
    setSuggestionReasoning("");

    try {
      const res = await fetch("/api/admin/blog/suggest-topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: category !== "wellness" ? category : "" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Грешка при предлагане на тема");
        return;
      }

      const s = data.suggestion;
      setTopic(s.topic);
      setKeywords(s.keywords.join(", "));
      if (s.category) setCategory(s.category);
      if (s.contentType) setContentType(s.contentType);
      setSuggestionReasoning(s.reasoning);
    } catch {
      setError("Грешка при свързване със сървъра");
    } finally {
      setIsSuggesting(false);
    }
  };

  // Step 1: Generate text
  const handleGenerateText = async () => {
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

      setGeneratedData(data.generated);

      // Parse image prompts
      const prompts: ImagePrompt[] = data.generated.image_prompts || [];
      setImagePrompts(prompts);
      // Select all by default
      setSelectedImages(new Set(prompts.map((p: ImagePrompt) => p.id)));

      setStep("preview");
    } catch {
      setError("Грешка при свързване със сървъра");
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle image selection
  const toggleImage = (id: string) => {
    setSelectedImages((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Step 2 → Step 3: Generate images
  const handleGenerateImages = useCallback(async () => {
    if (!generatedData) return;

    const slug = generatedData.slug as string;
    const toGenerate = imagePrompts.filter((p) => selectedImages.has(p.id));

    if (toGenerate.length === 0) {
      // Skip images, go directly to result
      finishWithoutImages();
      return;
    }

    setStep("images");
    setIsGeneratingImages(true);

    // Initialize results
    const initial = new Map<string, ImageResult>();
    for (const p of toGenerate) {
      initial.set(p.id, { id: p.id, url: "", status: "pending" });
    }
    setImageResults(new Map(initial));

    // Generate one by one
    for (let i = 0; i < toGenerate.length; i++) {
      const p = toGenerate[i];
      setCurrentImageIndex(i);

      // Mark as generating
      setImageResults((prev) => {
        const next = new Map(prev);
        next.set(p.id, { ...next.get(p.id)!, status: "generating" });
        return next;
      });

      try {
        const res = await fetch("/api/admin/blog/generate-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: p.prompt,
            slug,
            imageId: p.id,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setImageResults((prev) => {
            const next = new Map(prev);
            next.set(p.id, {
              id: p.id,
              url: "",
              status: "error",
              error: data.error || "Failed",
            });
            return next;
          });
          continue;
        }

        setImageResults((prev) => {
          const next = new Map(prev);
          next.set(p.id, { id: p.id, url: data.url, status: "done" });
          return next;
        });
      } catch {
        setImageResults((prev) => {
          const next = new Map(prev);
          next.set(p.id, {
            id: p.id,
            url: "",
            status: "error",
            error: "Network error",
          });
          return next;
        });
      }
    }

    setIsGeneratingImages(false);
    setCurrentImageIndex(-1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatedData, imagePrompts, selectedImages]);

  // Finish: insert images into content and call onGenerated
  const finishWithImages = () => {
    if (!generatedData) return;

    let content = generatedData.content as string;
    let heroImage = "";

    // Replace <figure> placeholders with actual <img> tags
    imageResults.forEach((result) => {
      if (result.status !== "done" || !result.url) return;

      const section = imagePrompts.find((p) => p.id === result.id)?.section || "";

      if (result.id === "hero") {
        heroImage = result.url;
        // Remove hero figure from content — it's rendered separately as featured image
        content = content.replace(
          /<figure class="blog-image" data-image-id="hero"><\/figure>/,
          ""
        );
      } else {
        content = content.replace(
          new RegExp(
            `<figure class="blog-image" data-image-id="${result.id}"></figure>`
          ),
          `<figure class="blog-image"><img src="${result.url}" alt="${section}" loading="lazy" /><figcaption>${section}</figcaption></figure>`
        );
      }
    });

    submitResult(content, heroImage);
  };

  const finishWithoutImages = () => {
    if (!generatedData) return;

    // Remove all figure placeholders
    let content = (generatedData.content as string).replace(
      /<figure class="blog-image" data-image-id="[^"]*"><\/figure>/g,
      ""
    );

    submitResult(content, "");
  };

  const submitResult = (content: string, heroImage: string) => {
    if (!generatedData) return;

    onGenerated({
      title: generatedData.title as string,
      slug: generatedData.slug as string,
      excerpt: generatedData.excerpt as string,
      content,
      image: heroImage,
      category: generatedData.category as BlogPostRow["category"],
      author: authorMap[author] || authorMap["lura-team"],
      read_time: generatedData.read_time as number,
      featured: false,
      published: false,
      tldr: (generatedData.tldr as string) || null,
      key_takeaways: generatedData.key_takeaways as unknown[],
      faq: generatedData.faq as unknown[],
      sources: generatedData.sources as unknown[],
      meta_title: generatedData.meta_title as string,
      meta_description: generatedData.meta_description as string,
      keywords: generatedData.keywords as string[],
      content_type: generatedData.content_type as string,
      ai_generated: true,
      ai_model: generatedData.ai_model as string,
      word_count: generatedData.word_count as number,
    } as Partial<BlogPostRow>);
  };

  const doneCount = Array.from(imageResults.values()).filter(
    (r) => r.status === "done"
  ).length;
  const errorCount = Array.from(imageResults.values()).filter(
    (r) => r.status === "error"
  ).length;
  const totalSelected = selectedImages.size;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-[#2D4A3E]">
              {step === "form" && "Генерирай с AI"}
              {step === "preview" && "Преглед на текста"}
              {step === "images" && "Генериране на изображения"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Step indicators */}
            <div className="flex items-center gap-1.5">
              {(["form", "preview", "images"] as Step[]).map((s, i) => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition ${
                    s === step
                      ? "bg-purple-600 w-4"
                      : (["form", "preview", "images"].indexOf(step) > i
                          ? "bg-purple-300"
                          : "bg-stone-200")
                  }`}
                />
              ))}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          {/* STEP 1: Form */}
          {step === "form" && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-stone-700">
                    Тема *
                  </label>
                  <button
                    onClick={handleSuggestTopic}
                    disabled={isSuggesting}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition disabled:opacity-50"
                  >
                    {isSuggesting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Мисля...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="w-3.5 h-3.5" />
                        Предложи тема с AI
                      </>
                    )}
                  </button>
                </div>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => { setTopic(e.target.value); setSuggestionReasoning(""); }}
                  placeholder="напр. Как кортизолът влияе на качеството на съня"
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
                {suggestionReasoning && (
                  <p className="mt-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                    <Lightbulb className="w-3 h-3 inline mr-1 -mt-0.5" />
                    {suggestionReasoning}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Ключови думи
                </label>
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
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Категория
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                  >
                    {categoryOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Целеви думи
                  </label>
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
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Тип съдържание
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                >
                  {contentTypeOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Автор
                </label>
                <select
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                >
                  {authorOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: Preview */}
          {step === "preview" && generatedData && (
            <div className="space-y-5">
              {/* Title & meta */}
              <div className="bg-stone-50 rounded-xl p-4 space-y-2">
                <h3 className="font-bold text-[#2D4A3E] text-base">
                  {generatedData.title as string}
                </h3>
                <p className="text-xs text-stone-500">
                  Slug: /{generatedData.slug as string}
                </p>
                <p className="text-sm text-stone-600">
                  {generatedData.excerpt as string}
                </p>
                <div className="flex gap-3 text-xs text-stone-400">
                  <span>{generatedData.word_count as number} думи</span>
                  <span>{generatedData.read_time as number} мин четене</span>
                </div>
              </div>

              {/* Content preview */}
              <div>
                <h4 className="text-sm font-medium text-stone-700 mb-2">
                  Съдържание (превю)
                </h4>
                <div
                  className="blog-content bg-white border border-stone-200 rounded-xl p-4 max-h-60 overflow-y-auto text-sm prose prose-stone prose-sm"
                  dangerouslySetInnerHTML={{
                    __html: generatedData.content as string,
                  }}
                />
              </div>

              {/* Image prompts */}
              {imagePrompts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-stone-700 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4" />
                      Изображения за генериране ({imagePrompts.length})
                    </h4>
                    <button
                      onClick={() => {
                        if (selectedImages.size === imagePrompts.length) {
                          setSelectedImages(new Set());
                        } else {
                          setSelectedImages(
                            new Set(imagePrompts.map((p) => p.id))
                          );
                        }
                      }}
                      className="text-xs text-purple-600 hover:text-purple-700"
                    >
                      {selectedImages.size === imagePrompts.length
                        ? "Размаркирай всички"
                        : "Маркирай всички"}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {imagePrompts.map((p) => (
                      <label
                        key={p.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                          selectedImages.has(p.id)
                            ? "border-purple-300 bg-purple-50"
                            : "border-stone-200 bg-stone-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedImages.has(p.id)}
                          onChange={() => toggleImage(p.id)}
                          className="mt-0.5 accent-purple-600"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-mono bg-stone-200 px-1.5 py-0.5 rounded">
                              {p.id === "hero" ? "HERO" : `#${p.id}`}
                            </span>
                            <span className="text-xs text-stone-500 truncate">
                              {p.section}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            {p.prompt}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Image Generation */}
          {step === "images" && (
            <div className="space-y-4">
              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-stone-600">
                    {isGeneratingImages
                      ? `Генериране ${currentImageIndex + 1} от ${totalSelected}...`
                      : `Готово: ${doneCount} от ${totalSelected}`}
                  </span>
                  {errorCount > 0 && (
                    <span className="text-red-500 text-xs">
                      {errorCount} грешки
                    </span>
                  )}
                </div>
                <div className="w-full bg-stone-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 rounded-full h-2 transition-all duration-500"
                    style={{
                      width: `${totalSelected > 0 ? ((doneCount + errorCount) / totalSelected) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Image results list */}
              <div className="space-y-2">
                {imagePrompts
                  .filter((p) => selectedImages.has(p.id))
                  .map((p) => {
                    const result = imageResults.get(p.id);
                    return (
                      <div
                        key={p.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border ${
                          result?.status === "done"
                            ? "border-green-200 bg-green-50"
                            : result?.status === "error"
                              ? "border-red-200 bg-red-50"
                              : result?.status === "generating"
                                ? "border-purple-200 bg-purple-50"
                                : "border-stone-200 bg-stone-50"
                        }`}
                      >
                        {/* Status icon */}
                        <div className="shrink-0">
                          {result?.status === "generating" && (
                            <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                          )}
                          {result?.status === "done" && (
                            <Check className="w-5 h-5 text-green-600" />
                          )}
                          {result?.status === "error" && (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          )}
                          {result?.status === "pending" && (
                            <div className="w-5 h-5 rounded-full border-2 border-stone-300" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono bg-white/60 px-1.5 py-0.5 rounded">
                              {p.id === "hero" ? "HERO" : `#${p.id}`}
                            </span>
                            <span className="text-sm text-stone-700 truncate">
                              {p.section}
                            </span>
                          </div>
                          {result?.status === "error" && (
                            <p className="text-xs text-red-500 mt-0.5">
                              {result.error}
                            </p>
                          )}
                        </div>

                        {/* Preview thumbnail */}
                        {result?.status === "done" && result.url && (
                          <img
                            src={result.url}
                            alt={p.section}
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                          />
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-100 shrink-0">
          {/* Left button */}
          <div>
            {step === "form" && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-xl transition"
              >
                Отказ
              </button>
            )}
            {step === "preview" && (
              <button
                onClick={() => setStep("form")}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-xl transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Назад
              </button>
            )}
            {step === "images" && !isGeneratingImages && (
              <button
                onClick={() => setStep("preview")}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-xl transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Назад
              </button>
            )}
          </div>

          {/* Right button */}
          <div>
            {step === "form" && (
              <button
                onClick={handleGenerateText}
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
                    Генерирай текст
                  </>
                )}
              </button>
            )}
            {step === "preview" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={finishWithoutImages}
                  className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-xl transition"
                >
                  Пропусни снимки
                </button>
                <button
                  onClick={handleGenerateImages}
                  disabled={selectedImages.size === 0}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition"
                >
                  <ImageIcon className="w-4 h-4" />
                  Генерирай {selectedImages.size} снимки
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
            {step === "images" && !isGeneratingImages && (
              <button
                onClick={finishWithImages}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition"
              >
                <Check className="w-4 h-4" />
                Използвай резултата
              </button>
            )}
          </div>
        </div>

        {/* Loading overlay for text generation */}
        {isGenerating && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-3" />
            <p className="text-sm font-medium text-purple-700">
              AI генерира статията...
            </p>
            <p className="text-xs text-stone-500 mt-1">
              Това може да отнеме до 60 секунди
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
