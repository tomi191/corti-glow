"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { NAV_LINKS, SHIPPING_THRESHOLD } from "@/lib/constants";
import { CartBadge } from "@/components/cart/CartBadge";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      if (window.scrollY > 200) {
        setShowAnnouncement(false);
      } else {
        setShowAnnouncement(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Announcement Bar */}
      <AnimatePresence>
        {showAnnouncement && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-[#2D4A3E] text-white text-xs text-center py-2.5 overflow-hidden"
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3" />
              <span className="tracking-wide">
                БЕЗПЛАТНА ДОСТАВКА НАД {SHIPPING_THRESHOLD} €
                <span className="hidden sm:inline"> • 14-ДНЕВНА ГАРАНЦИЯ</span>
              </span>
              <Sparkles className="w-3 h-3" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-white shadow-sm border-b border-stone-100"
            : "bg-white border-b border-stone-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div
            className={`flex items-center justify-between transition-all duration-300 ${
              scrolled ? "h-16" : "h-20"
            }`}
          >
            {/* Left - Mobile Menu */}
            <div className="flex items-center gap-4 w-1/3">
              <MobileMenu />
            </div>

            {/* Center - Logo */}
            <div className="flex justify-center w-1/3">
              <Link href="/" className="group relative">
                <span
                  className={`block font-semibold tracking-[0.3em] text-[#2D4A3E] transition-all duration-300 ${
                    scrolled ? "text-xl" : "text-2xl"
                  }`}
                >
                  LURA
                </span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2D4A3E] group-hover:w-full transition-all duration-300" />
              </Link>
            </div>

            {/* Right - Nav Links & Cart */}
            <div className="flex items-center justify-end gap-8 w-1/3">
              {NAV_LINKS.map((link) => (
                <div key={link.href} className="hidden md:block">
                  <Link
                    href={link.href}
                    className="relative text-sm font-medium text-stone-600 hover:text-[#2D4A3E] transition-colors group"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2D4A3E] group-hover:w-full transition-all duration-300" />
                  </Link>
                </div>
              ))}
              <CartBadge />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
