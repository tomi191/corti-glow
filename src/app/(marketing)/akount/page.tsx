"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Package, LogIn, ChevronRight, AlertCircle } from "lucide-react";
import Link from "next/link";

const ACCOUNT_EMAIL_KEY = "lura-account-email";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(ACCOUNT_EMAIL_KEY);
    if (stored) {
      setSavedEmail(stored);
      fetchOrderCount(stored);
    }
  }, []);

  const fetchOrderCount = async (emailToCheck: string) => {
    try {
      const res = await fetch("/api/account/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToCheck }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrderCount(data.orders?.length || 0);
      }
    } catch {
      setError("Не можахме да заредим поръчките. Проверете интернет връзката.");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Simple email-based "auth" - just save email
      localStorage.setItem(ACCOUNT_EMAIL_KEY, email.toLowerCase());
      setSavedEmail(email.toLowerCase());
      await fetchOrderCount(email.toLowerCase());
    } catch {
      setError("Грешка при зареждане. Опитайте отново.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ACCOUNT_EMAIL_KEY);
    setSavedEmail(null);
    setOrderCount(null);
    setEmail("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F2EF] to-white py-20">
      <div className="max-w-lg mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#B2D8C6]/20 mb-6">
            <User className="w-8 h-8 text-[#2D4A3E]" />
          </div>
          <h1 className="text-3xl font-semibold text-[#2D4A3E] mb-3">
            Моят Акаунт
          </h1>
          <p className="text-stone-600">
            {savedEmail
              ? "Преглед на поръчки и история"
              : "Влез с имейла, с който правиш поръчки"}
          </p>
        </motion.div>

        {!savedEmail ? (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleLogin}
            className="bg-white rounded-2xl p-8 shadow-lg border border-stone-100"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2D4A3E] mb-2">
                  Имейл адрес
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-[#B2D8C6] focus:ring-2 focus:ring-[#B2D8C6]/20 outline-none transition"
                  required
                />
                <p className="text-xs text-stone-500 mt-2">
                  Ще видиш поръчките, направени с този имейл
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#2D4A3E] text-white rounded-full font-medium hover:bg-[#1f352c] transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Влез
                  </>
                )}
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-stone-100">
              <p className="text-sm text-stone-500 mb-1">Вписан като</p>
              <p className="font-medium text-[#2D4A3E]">{savedEmail}</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <Link
              href="/akount/porachki"
              className="block bg-white rounded-2xl p-6 shadow-lg border border-stone-100 hover:border-[#B2D8C6] transition group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#B2D8C6]/20 flex items-center justify-center">
                    <Package className="w-6 h-6 text-[#2D4A3E]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#2D4A3E]">Моите Поръчки</p>
                    <p className="text-sm text-stone-500">
                      {orderCount !== null
                        ? `${orderCount} поръчки`
                        : "Зареждане..."}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-[#2D4A3E] transition" />
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full py-3 text-stone-500 hover:text-stone-700 transition text-sm"
            >
              Излез
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
