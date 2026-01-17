"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setStatus("success");
    setEmail("");

    // Reset after 3 seconds
    setTimeout(() => setStatus("idle"), 3000);
  };

  if (status === "success") {
    return (
      <p className="text-[#B2D8C6] text-sm">
        Благодарим! Проверете имейла си за отстъпката.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Имейл адрес"
        required
        className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm w-full placeholder-stone-400 focus:outline-none focus:border-[#B2D8C6]"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-[#B2D8C6] text-[#2D4A3E] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#a1c6b5] disabled:opacity-50"
      >
        {status === "loading" ? "..." : "Go"}
      </button>
    </form>
  );
}
