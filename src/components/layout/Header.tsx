"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
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
            className="bg-gradient-to-r from-[#2D4A3E] via-[#3d5f4f] to-[#2D4A3E] text-white text-xs text-center py-2.5 overflow-hidden"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3 h-3" />
              <span className="tracking-wide">
                БЕЗПЛАТНА ДОСТАВКА ЗА ПОРЪЧКИ НАД 80€ • 14-ДНЕВНА ГАРАНЦИЯ
              </span>
              <Sparkles className="w-3 h-3" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`sticky top-0 z-40 transition-all duration-500 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.08)] border-b border-stone-100"
            : "bg-white/70 backdrop-blur-md"
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
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className={`block font-semibold tracking-[0.3em] text-[#2D4A3E] transition-all duration-300 ${
                    scrolled ? "text-xl" : "text-2xl"
                  }`}
                >
                  LURA
                </motion.span>
                {/* Underline effect */}
                <motion.span
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#B2D8C6] to-[#FFC1CC] group-hover:w-full transition-all duration-300"
                />
              </Link>
            </div>

            {/* Right - Nav Links & Cart */}
            <div className="flex items-center justify-end gap-8 w-1/3">
              {NAV_LINKS.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="hidden md:block"
                >
                  <Link
                    href={link.href}
                    className="relative text-sm font-medium text-stone-600 hover:text-[#2D4A3E] transition-colors group"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#B2D8C6] group-hover:w-full transition-all duration-300" />
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring" as const }}
              >
                <CartBadge />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>
    </>
  );
}
