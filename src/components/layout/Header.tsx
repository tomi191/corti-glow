"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_LINKS, SHIPPING_THRESHOLD, IS_PRELAUNCH } from "@/lib/constants";
import { CartBadge } from "@/components/cart/CartBadge";
import { MobileMenu } from "./MobileMenu";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  const isHome = pathname === "/";

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
    <header
      className={cn(
        "w-full flex flex-col transition-all duration-300 z-50",
        isHome ? "fixed top-0 left-0 right-0" : "sticky top-0"
      )}
    >
      <AnimatePresence>
        {showAnnouncement && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "text-[9px] md:text-[10px] font-semibold tracking-[0.25em] uppercase text-center py-2 md:py-2.5 overflow-hidden w-full transition-colors duration-300",
              scrolled || !isHome
                ? "bg-[#2D4A3E] text-[#F7F4F0]"
                : "bg-transparent text-[#F7F4F0] border-b border-[#F7F4F0]/10"
            )}
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="flex items-center justify-center gap-4 px-4"
            >
              <span>
                {IS_PRELAUNCH ? (
                  "ЗАПИШИ СЕ И ПОЛУЧИ БЕЗПЛАТЕН PDF ГАЙД"
                ) : (
                  <>
                    БЕЗПЛАТНА ДОСТАВКА НАД {SHIPPING_THRESHOLD} €
                    <span className="hidden sm:inline opacity-50 mx-2">|</span>
                    <span className="hidden sm:inline text-[#B2D8C6]">14-ДНЕВНА ГАРАНЦИЯ ЗА ВРЪЩАНЕ</span>
                  </>
                )}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "w-full transition-all duration-300",
          scrolled || !isHome
            ? "bg-[#F7F4F0]/90 backdrop-blur-xl border-b border-[#2D4A3E]/10 py-3 shadow-sm"
            : "bg-transparent py-5"
        )}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">

          {/* Left - Primary Nav (Desktop) / Mobile Menu (Mobile) */}
          <div className="flex items-center gap-8 md:gap-10 w-1/3">
            <div className="md:hidden">
              <MobileMenu />
            </div>

            <div className="hidden md:flex gap-8">
              {NAV_LINKS.slice(0, 2).map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-[11px] font-bold tracking-[0.15em] uppercase transition-colors duration-300",
                      isActive
                        ? (scrolled || !isHome ? "text-[#2D4A3E]" : "text-[#F7F4F0]")
                        : (scrolled || !isHome ? "text-[#2D4A3E]/50 hover:text-[#2D4A3E]" : "text-[#F7F4F0]/70 hover:text-[#F7F4F0]")
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Center - Brand Logo */}
          <div className="flex justify-center w-1/3">
            <Link
              href="/"
              className={cn(
                "text-2xl md:text-3xl font-serif font-light tracking-widest transition-colors duration-300",
                scrolled || !isHome ? "text-[#2D4A3E]" : "text-[#F7F4F0]"
              )}
            >
              LURA
            </Link>
          </div>

          {/* Right - Secondary Nav + Cart */}
          <div className="flex items-center justify-end gap-6 md:gap-8 w-1/3">
            <div className="hidden md:flex gap-8">
              {NAV_LINKS.slice(2).map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-[11px] font-bold tracking-[0.15em] uppercase transition-colors duration-300",
                      isActive
                        ? (scrolled || !isHome ? "text-[#2D4A3E]" : "text-[#F7F4F0]")
                        : (scrolled || !isHome ? "text-[#2D4A3E]/50 hover:text-[#2D4A3E]" : "text-[#F7F4F0]/70 hover:text-[#F7F4F0]")
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {!IS_PRELAUNCH && (
              <div className={cn(
                "flex items-center justify-center transition-colors duration-300",
                scrolled || !isHome ? "text-[#2D4A3E]" : "text-[#F7F4F0]"
              )}>
                <CartBadge />
              </div>
            )}
          </div>

        </div>
      </motion.nav>
    </header>
  );
}
