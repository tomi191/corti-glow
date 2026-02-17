"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Download, Sparkles } from "lucide-react";
import { SuccessCheckmark } from "./SuccessCheckmark";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Грешка. Опитай отново.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMsg("Грешка при свързване. Опитай отново.");
      setStatus("error");
    }
  };

  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setEmail("");
      setStatus("idle");
      setErrorMsg("");
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Decorative top gradient */}
            <div className="h-2 bg-gradient-to-r from-[#B2D8C6] via-[#2D4A3E] to-[#FFC1CC]" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 transition z-10"
              aria-label="Затвори"
            >
              <X className="w-4 h-4 text-stone-600" />
            </button>

            <div className="p-8">
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-4 space-y-5"
                  >
                    <SuccessCheckmark message="Ти си в списъка!" />

                    <p className="text-stone-600 text-sm mt-4">
                      Ще получиш ранен достъп преди всички.
                    </p>

                    {/* PDF Download */}
                    <a
                      href="/pdf/3-sutreshni-navika.pdf"
                      download
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#2D4A3E] text-white rounded-full font-medium hover:bg-[#1f352c] transition shadow-lg shadow-[#2D4A3E]/20"
                    >
                      <Download className="w-4 h-4" />
                      Изтегли PDF Гайда
                    </a>

                    <p className="text-xs text-stone-400">
                      &ldquo;3 сутрешни навика, които свалят кортизола&rdquo;
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-5"
                  >
                    {/* Icon */}
                    <div className="flex justify-center">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#B2D8C6]/30 to-[#FFC1CC]/30 flex items-center justify-center">
                        <Sparkles className="w-7 h-7 text-[#2D4A3E]" />
                      </div>
                    </div>

                    {/* Copy */}
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-semibold text-[#2D4A3E]">
                        Спри Кортизола. Започни Промяната.
                      </h3>
                      <p className="text-sm text-stone-600 leading-relaxed">
                        Първата партида се изчерпва бързо. Влез в VIP списъка и
                        получи нашия безплатен PDF:{" "}
                        <span className="font-medium text-[#2D4A3E]">
                          &ldquo;3 сутрешни навика, които свалят кортизола&rdquo;
                        </span>{" "}
                        веднага.
                      </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                        <input
                          type="email"
                          placeholder="Твоят имейл"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full pl-11 pr-4 py-3.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B2D8C6] focus:border-transparent transition"
                        />
                      </div>

                      {status === "error" && (
                        <p className="text-sm text-red-500">{errorMsg}</p>
                      )}

                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full py-3.5 bg-[#2D4A3E] text-white rounded-xl font-medium hover:bg-[#1f352c] transition shadow-lg shadow-[#2D4A3E]/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {status === "loading" ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          />
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Искам Ранен Достъп
                          </>
                        )}
                      </button>
                    </form>

                    <p className="text-center text-xs text-stone-400">
                      Без спам. Само важни новини за Corti-Glow.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
