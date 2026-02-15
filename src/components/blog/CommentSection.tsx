"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageCircle, Send, Loader2, CheckCircle2 } from "lucide-react";

interface Comment {
  id: string;
  author_name: string;
  content: string;
  parent_id: string | null;
  created_at: string;
}

interface CommentSectionProps {
  slug: string;
}

export function CommentSection({ slug }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error" | "rate-limit">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/blog/${slug}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch {
      // Silently fail — comments are not critical
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const res = await fetch(`/api/blog/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: name.trim(),
          author_email: email.trim(),
          content: content.trim(),
          website, // honeypot
        }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setSubmitStatus("rate-limit");
        setErrorMessage(data.error);
        return;
      }

      if (!res.ok) {
        setSubmitStatus("error");
        setErrorMessage(data.error || "Грешка при изпращане на коментара");
        return;
      }

      setSubmitStatus("success");
      setName("");
      setEmail("");
      setContent("");
    } catch {
      setSubmitStatus("error");
      setErrorMessage("Грешка при свързване със сървъра");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group top-level and replies
  const topLevel = comments.filter((c) => !c.parent_id);

  return (
    <section className="px-6 pb-12">
      <div className="max-w-3xl mx-auto">
        <h3 className="text-xl font-semibold text-[#2D4A3E] mb-6 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Коментари {comments.length > 0 && `(${comments.length})`}
        </h3>

        {/* Existing comments */}
        {isLoading ? (
          <div className="flex items-center gap-2 text-stone-400 text-sm mb-8">
            <Loader2 className="w-4 h-4 animate-spin" />
            Зареждане...
          </div>
        ) : topLevel.length > 0 ? (
          <div className="space-y-6 mb-10">
            {topLevel.map((comment) => {
              const replies = comments.filter((c) => c.parent_id === comment.id);
              return (
                <div key={comment.id}>
                  <CommentCard comment={comment} />
                  {replies.length > 0 && (
                    <div className="ml-8 mt-3 space-y-3 border-l-2 border-stone-100 pl-4">
                      {replies.map((reply) => (
                        <CommentCard key={reply.id} comment={reply} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-stone-500 text-sm mb-8">
            Все още няма коментари. Бъдете първият!
          </p>
        )}

        {/* Comment form */}
        <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
          <h4 className="font-medium text-[#2D4A3E] mb-4">Оставете коментар</h4>

          {submitStatus === "success" ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700">
                Коментарът ви ще бъде прегледан от модератор и ще се покаже след одобрение.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="comment-name" className="block text-sm font-medium text-stone-700 mb-1">
                    Име *
                  </label>
                  <input
                    id="comment-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={100}
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
                    placeholder="Вашето име"
                  />
                </div>
                <div>
                  <label htmlFor="comment-email" className="block text-sm font-medium text-stone-700 mb-1">
                    Имейл *
                  </label>
                  <input
                    id="comment-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
                    placeholder="email@example.com"
                  />
                  <p className="text-xs text-stone-400 mt-1">Няма да бъде публикуван</p>
                </div>
              </div>

              {/* Honeypot — hidden from users, visible to bots */}
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <label htmlFor="comment-website">Website</label>
                <input
                  id="comment-website"
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="comment-content" className="block text-sm font-medium text-stone-700 mb-1">
                  Коментар *
                </label>
                <textarea
                  id="comment-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E] resize-y"
                  placeholder="Вашият коментар..."
                />
              </div>

              {(submitStatus === "error" || submitStatus === "rate-limit") && (
                <p className="text-sm text-red-600">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !name.trim() || !email.trim() || !content.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#2D4A3E] text-white rounded-xl text-sm font-medium hover:bg-[#1f352c] disabled:opacity-50 transition"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Изпращане...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Публикувай коментар
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function CommentCard({ comment }: { comment: Comment }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-stone-100">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B2D8C6] to-[#FFC1CC] flex items-center justify-center text-sm font-bold text-[#2D4A3E]">
          {comment.author_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <span className="text-sm font-medium text-[#2D4A3E]">{comment.author_name}</span>
          <span className="text-xs text-stone-400 ml-2">
            {new Date(comment.created_at).toLocaleDateString("bg-BG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
      <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">{comment.content}</p>
    </div>
  );
}
