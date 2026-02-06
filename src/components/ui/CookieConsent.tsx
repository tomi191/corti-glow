"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_CONSENT_KEY = "lura-cookie-consent";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") rejectAll();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible]);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
    setIsVisible(false);

    // Trigger analytics if accepted
    if (prefs.analytics && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cookie-consent-analytics", { detail: true }));
    }
  };

  const acceptAll = () => {
    saveConsent({ necessary: true, analytics: true, marketing: true });
  };

  const acceptSelected = () => {
    saveConsent(preferences);
  };

  const rejectAll = () => {
    saveConsent({ necessary: true, analytics: false, marketing: false });
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      >
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-[#B2D8C6]/20">
                <Cookie className="w-6 h-6 text-[#2D4A3E]" />
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#2D4A3E] mb-2">
                  Използваме бисквитки 🍪
                </h3>
                <p className="text-stone-600 text-sm mb-4">
                  Използваме бисквитки, за да подобрим вашето изживяване на сайта.
                  Някои са необходими за работата на сайта, докато други ни помагат
                  да разберем как го използвате.
                </p>

                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mb-4 space-y-3"
                    >
                      <label className="flex items-center gap-3 p-3 rounded-lg bg-stone-50">
                        <input
                          type="checkbox"
                          checked={true}
                          disabled
                          className="w-4 h-4 rounded accent-[#2D4A3E]"
                        />
                        <div>
                          <span className="font-medium text-[#2D4A3E]">Необходими</span>
                          <p className="text-xs text-stone-500">Основни за работата на сайта</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 rounded-lg bg-stone-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.analytics}
                          onChange={(e) => setPreferences(p => ({ ...p, analytics: e.target.checked }))}
                          className="w-4 h-4 rounded accent-[#2D4A3E]"
                        />
                        <div>
                          <span className="font-medium text-[#2D4A3E]">Аналитични</span>
                          <p className="text-xs text-stone-500">Помагат ни да разберем как използвате сайта</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 rounded-lg bg-stone-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.marketing}
                          onChange={(e) => setPreferences(p => ({ ...p, marketing: e.target.checked }))}
                          className="w-4 h-4 rounded accent-[#2D4A3E]"
                        />
                        <div>
                          <span className="font-medium text-[#2D4A3E]">Маркетингови</span>
                          <p className="text-xs text-stone-500">За персонализирани реклами</p>
                        </div>
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={acceptAll}
                    className="px-6 py-2.5 bg-[#2D4A3E] text-white rounded-full font-medium hover:bg-[#1f352c] transition"
                  >
                    Приемам всички
                  </button>

                  {showDetails ? (
                    <button
                      onClick={acceptSelected}
                      className="px-6 py-2.5 border border-[#2D4A3E] text-[#2D4A3E] rounded-full font-medium hover:bg-stone-50 transition"
                    >
                      Запази избора
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowDetails(true)}
                      className="px-6 py-2.5 border border-stone-300 text-stone-600 rounded-full font-medium hover:bg-stone-50 transition"
                    >
                      Настройки
                    </button>
                  )}

                  <button
                    onClick={rejectAll}
                    className="px-6 py-2.5 text-stone-500 hover:text-stone-700 transition"
                  >
                    Само необходими
                  </button>
                </div>
              </div>

              <button
                onClick={rejectAll}
                className="p-2 text-stone-400 hover:text-stone-600 transition"
                aria-label="Затвори"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook to check cookie consent
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) {
      setConsent(JSON.parse(stored));
    }
  }, []);

  return consent;
}
