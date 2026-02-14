"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        <div className="bg-white border-t border-stone-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="max-w-6xl mx-auto px-4 py-3">
            {/* Compact bar */}
            {!showDetails ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <p className="text-sm text-stone-600 flex-1">
                  Използваме бисквитки за подобряване на изживяването.{" "}
                  <button
                    onClick={() => setShowDetails(true)}
                    className="underline text-[#2D4A3E] font-medium"
                  >
                    Настройки
                  </button>
                </p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={rejectAll}
                    className="px-4 py-2 text-sm text-stone-500 hover:text-stone-700 transition"
                  >
                    Отказвам
                  </button>
                  <button
                    onClick={acceptAll}
                    className="px-5 py-2 bg-[#2D4A3E] text-white text-sm rounded-full font-medium hover:bg-[#1f352c] transition"
                  >
                    Приемам
                  </button>
                </div>
              </div>
            ) : (
              /* Expanded settings */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#2D4A3E]">
                    Настройки за бисквитки
                  </p>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-xs text-stone-400 hover:text-stone-600"
                  >
                    Скрий
                  </button>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <label className="flex items-center gap-2 text-stone-500">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="w-4 h-4 rounded accent-[#2D4A3E]"
                    />
                    Необходими
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-stone-600">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences(p => ({ ...p, analytics: e.target.checked }))}
                      className="w-4 h-4 rounded accent-[#2D4A3E]"
                    />
                    Аналитични
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-stone-600">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences(p => ({ ...p, marketing: e.target.checked }))}
                      className="w-4 h-4 rounded accent-[#2D4A3E]"
                    />
                    Маркетингови
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={rejectAll}
                    className="px-4 py-2 text-sm text-stone-500 hover:text-stone-700 transition"
                  >
                    Само необходими
                  </button>
                  <button
                    onClick={acceptSelected}
                    className="px-5 py-2 border border-[#2D4A3E] text-[#2D4A3E] text-sm rounded-full font-medium hover:bg-stone-50 transition"
                  >
                    Запази избора
                  </button>
                  <button
                    onClick={acceptAll}
                    className="px-5 py-2 bg-[#2D4A3E] text-white text-sm rounded-full font-medium hover:bg-[#1f352c] transition"
                  >
                    Приемам всички
                  </button>
                </div>
              </div>
            )}
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
