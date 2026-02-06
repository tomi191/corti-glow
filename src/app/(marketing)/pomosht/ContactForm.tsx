"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle } from "lucide-react";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Грешка при изпращане.");
      }

      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Грешка при изпращане. Опитайте отново."
      );
    }
  };

  if (status === "success") {
    return (
      <div className="bg-white rounded-2xl p-8 border border-stone-100 text-center">
        <div className="w-16 h-16 bg-[#B2D8C6]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-[#2D4A3E]" />
        </div>
        <h3 className="text-lg font-semibold text-[#2D4A3E] mb-2">
          Съобщението е изпратено!
        </h3>
        <p className="text-stone-500 text-sm mb-4">
          Ще ви отговорим в рамките на 24 часа.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="text-sm text-[#2D4A3E] hover:underline"
        >
          Изпрати ново съобщение
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-stone-100 space-y-4">
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-stone-700 mb-1">
          Име
        </label>
        <input
          id="contact-name"
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
          placeholder="Вашето име"
          required
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-stone-700 mb-1">
          Имейл
        </label>
        <input
          id="contact-email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
          placeholder="your@email.com"
          required
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-stone-700 mb-1">
          Съобщение
        </label>
        <textarea
          id="contact-message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={4}
          className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E] resize-none"
          placeholder="Как можем да помогнем?"
          required
        />
      </div>

      {status === "error" && (
        <p className="text-red-500 text-sm">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3 bg-[#2D4A3E] text-white rounded-lg font-medium hover:bg-[#1f352c] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Изпращане...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Изпрати
          </>
        )}
      </button>
    </form>
  );
}
