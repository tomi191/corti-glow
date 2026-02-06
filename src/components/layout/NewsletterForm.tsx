"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SuccessCheckmark } from "@/components/ui/SuccessCheckmark";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Грешка при записване.");
      }

      setStatus("success");
      setEmail("");

      // Reset after 3 seconds
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Грешка при записване. Опитайте отново."
      );
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  if (status === "success") {
    return (
      <SuccessCheckmark
        message="Благодарим! Проверете имейла си."
        size="sm"
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Имейл адрес"
          required
          aria-label="Имейл адрес"
          className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm w-full placeholder-stone-300 focus:outline-none focus:border-[#B2D8C6]"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-[#B2D8C6] text-[#2D4A3E] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#a1c6b5] disabled:opacity-50"
        >
          {status === "loading" ? "..." : "Абонирай се"}
        </button>
      </div>
      {status === "error" && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-xs"
        >
          {errorMessage}
        </motion.p>
      )}
    </form>
  );
}
