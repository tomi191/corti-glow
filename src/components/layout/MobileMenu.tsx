"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { NAV_LINKS, FOOTER_LINKS } from "@/lib/constants";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Menu Button */}
      <button className="md:hidden p-2.5 -ml-2.5" onClick={() => setIsOpen(true)} aria-label="Отвори менюто">
        <Menu className="w-5 h-5" />
      </button>

      {/* Portal: render overlay outside motion.nav to avoid stacking context issues */}
      {mounted && isOpen && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            onClick={() => setIsOpen(false)}
          />

          {/* Slide-over Panel */}
          <div
            className="fixed inset-y-0 left-0 w-full max-w-xs bg-white shadow-2xl z-[60] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Навигация"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <span className="text-xl font-semibold tracking-widest text-[#2D4A3E]">
                LURA
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2.5 text-stone-400 hover:text-stone-600"
                aria-label="Затвори менюто"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
                    Магазин
                  </h3>
                  <div className="space-y-3">
                    {NAV_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="block text-lg font-medium text-stone-800 hover:text-[#2D4A3E]"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
                    Помощ
                  </h3>
                  <div className="space-y-3">
                    {FOOTER_LINKS.help.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="block text-lg font-medium text-stone-800 hover:text-[#2D4A3E]"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
