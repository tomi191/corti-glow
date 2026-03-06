"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight, Package, Store, Mail, Home, MessageSquare, Sparkles, Beaker, Fingerprint } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { IS_PRELAUNCH } from "@/lib/constants";
import { useWaitlist } from "@/components/providers/WaitlistProvider";

export function MobileStickyBar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isHome = pathname === "/";
  const isGlowGuide = pathname.startsWith("/glow-guide");
  const isNauka = pathname.startsWith("/nauka");
  const isShop = pathname.startsWith("/produkt") || pathname.startsWith("/magazin");
  const isTrack = pathname.startsWith("/prosledi-porachka");

  const { openWaitlist } = useWaitlist();
  const items = useCartStore((state) => state.items);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getItemCount = useCartStore((state) => state.getItemCount);
  const isFreeShipping = useCartStore((state) => state.isFreeShipping);

  const hasItems = items.length > 0;
  const subtotal = getSubtotal();
  const itemCount = getItemCount();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Smart scroll behavior - hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden z-50 flex flex-col">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full"
          >
            {/* Gradient blur backdrop for CTA */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white to-white/90 backdrop-blur-xl -z-10" />

            <div className="relative px-4 py-3 border-t border-stone-100 bg-white/50 backdrop-blur-md shadow-[0_-10px_30px_rgba(0,0,0,0.05)] rounded-t-2xl">
              <AnimatePresence mode="wait">
                {IS_PRELAUNCH ? (
                  // Prelaunch mode - show waitlist CTA
                  <motion.div
                    key="waitlist-mode"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#FFC1CC]/30 to-[#B2D8C6]/30 flex items-center justify-center">
                        <Mail className="w-4 h-4 md:w-5 md:h-5 text-[#2D4A3E]" />
                      </div>
                      <div>
                        <p className="text-[10px] md:text-xs text-stone-500">VIP Списък</p>
                        <p className="text-sm font-semibold text-[#2D4A3E]">Ранен достъп + PDF</p>
                      </div>
                    </div>

                    <button
                      onClick={openWaitlist}
                      className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2D4A3E] to-[#3D5A4E] text-white rounded-xl text-xs font-semibold shadow-lg shadow-[#2D4A3E]/25 hover:shadow-xl hover:shadow-[#2D4A3E]/30 transition-all duration-300"
                    >
                      Запиши се
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </motion.div>
                ) : hasItems ? (
                  // Cart has items - show checkout prompt
                  <motion.div
                    key="cart-mode"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <motion.div
                          className="w-10 h-10 shadow-sm rounded-xl bg-gradient-to-br from-[#B2D8C6] to-[#2D4A3E] flex items-center justify-center"
                          whileHover={{ scale: 1.05 }}
                        >
                          <ShoppingBag className="w-4 h-4 text-white" />
                        </motion.div>
                        <motion.span
                          key={itemCount}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#FFC1CC] rounded-full flex items-center justify-center text-[9px] font-bold text-[#2D4A3E] border border-white"
                        >
                          {itemCount}
                        </motion.span>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[10px] text-stone-500">
                          {isFreeShipping() ? (
                            <span className="text-[#2D4A3E] font-medium flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> Безплатна доставка
                            </span>
                          ) : (
                            "В количката"
                          )}
                        </p>
                        <motion.p
                          key={subtotal}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-base font-bold text-[#2D4A3E] leading-tight"
                        >
                          {subtotal.toFixed(2)} €
                        </motion.p>
                      </div>
                    </div>

                    <Link
                      href="/checkout"
                      className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#2D4A3E] to-[#3D5A4E] text-white rounded-xl text-xs md:text-sm font-semibold shadow-lg shadow-[#2D4A3E]/25 hover:shadow-xl hover:shadow-[#2D4A3E]/30 transition-all duration-300"
                    >
                      Плащане
                      <motion.span
                        className="inline-block"
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </motion.span>
                    </Link>
                  </motion.div>
                ) : (
                  // Cart is empty - show bundle prompt
                  <motion.div
                    key="browse-mode"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFC1CC]/30 to-[#B2D8C6]/30 flex items-center justify-center">
                        <Package className="w-4 h-4 text-[#2D4A3E]" />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[10px] text-stone-500 font-medium tracking-wide">GLOW ПАКЕТ</p>
                        <div className="flex flex-col xs:flex-row xs:items-baseline xs:gap-2 leading-tight">
                          <p className="text-base font-bold text-[#2D4A3E]">85.99 €</p>
                          <span className="text-[10px] text-stone-400 line-through">119.99 €</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/produkt/corti-glow#bundles"
                      className="group flex p-2.5 bg-[#2D4A3E] text-white rounded-full font-semibold shadow-xl shadow-[#2D4A3E]/20 transition-all duration-300 border border-[#B2D8C6]/20"
                    >
                      <Package className="w-4 h-4" />
                      {/* Or text plus icon if it fits:
                       <span className="text-xs mr-2">Купи</span>
                       <ArrowRight className="w-4 h-4" />
                       */}
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Free shipping progress indicator */}
              {!IS_PRELAUNCH && hasItems && !isFreeShipping() && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2 pt-2 border-t border-stone-100"
                >
                  <div className="flex items-center justify-between text-[10px] text-stone-500 mb-1">
                    <span>Остават {(80 - subtotal).toFixed(0)} € за фрий шипинг</span>
                    <span className="text-[#B2D8C6] font-medium">80 €</span>
                  </div>
                  <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#B2D8C6] to-[#FFC1CC] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((subtotal / 80) * 100, 100)}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STATIC BOTTOM TAB BAR (PWA NATIVE FEEL - FAB LAYOUT) */}
      <div className="w-full bg-[#FAFAFA]/95 backdrop-blur-xl border-t border-[#EAE7E1] pb-[calc(env(safe-area-inset-bottom)+5px)] shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-[60]">
        <div className="grid grid-cols-5 items-end h-[75px] px-1 relative pb-3">

          {/* 1. Glow Guide */}
          <Link href="/glow-guide" className="flex flex-col items-center justify-end w-full h-full gap-1 active:scale-95 transition-transform group pt-2">
            <Sparkles className={`w-[24px] h-[24px] transition-colors ${isGlowGuide ? "text-[#2D4A3E]" : "text-[#2D4A3E]/40 group-hover:text-[#2D4A3E]"}`} />
            <span className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.05em] sm:tracking-[0.1em] transition-colors ${isGlowGuide ? "text-[#2D4A3E]" : "text-[#2D4A3E]/40"}`}>Glow</span>
          </Link>

          {/* 2. Наука */}
          <Link href="/nauka" className="flex flex-col items-center justify-end w-full h-full gap-1 active:scale-95 transition-transform group pt-2">
            <Beaker className={`w-[24px] h-[24px] transition-colors ${isNauka ? "text-[#2D4A3E]" : "text-[#2D4A3E]/40 group-hover:text-[#2D4A3E]"}`} />
            <span className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.05em] sm:tracking-[0.1em] transition-colors ${isNauka ? "text-[#2D4A3E]" : "text-[#2D4A3E]/40"}`}>Наука</span>
          </Link>

          {/* 3. CENTER FAB: Влез в приложението */}
          <div className="flex justify-center w-full relative h-full">
            <Link href="/app" className="absolute -top-[36px] flex items-center justify-center w-[78px] h-[78px] group z-10">
              {/* Pulsing ring indicator */}
              <span className="absolute inset-0 rounded-full bg-[#B2D8C6] opacity-40 animate-ping" style={{ animationDuration: '3s' }} />

              {/* Premium Button */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#1E332B] to-[#3a5e4f] shadow-[0_8px_25px_rgba(45,74,62,0.4)] active:scale-95 transition-transform border-[4px] border-[#FAFAFA] flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />

                {/* Fingerprint */}
                <Fingerprint className="w-[38px] h-[38px] text-[#B2D8C6] drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] relative z-10" />

                {/* Scanning Line Animation */}
                <motion.div
                  className="absolute left-[14px] right-[14px] h-[1.5px] bg-[#B2D8C6] shadow-[0_0_8px_2px_rgba(178,216,198,0.8)] z-20 rounded-full mix-blend-screen"
                  animate={{ top: ["20%", "80%", "20%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </Link>
          </div>

          {/* 4. Магазин */}
          <Link href="/magazin" className="flex flex-col items-center justify-end w-full h-full gap-1 active:scale-95 transition-transform group pt-2">
            <Store className={`w-[24px] h-[24px] transition-colors ${isShop ? "text-[#2D4A3E]" : "text-[#2D4A3E]/40 group-hover:text-[#2D4A3E]"}`} />
            <span className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.05em] sm:tracking-[0.1em] transition-colors ${isShop ? "text-[#2D4A3E]" : "text-[#2D4A3E]/40"}`}>Магазин</span>
          </Link>

          {/* 5. Проследи */}
          <Link href="/prosledi-porachka" className="flex flex-col items-center justify-end w-full h-full gap-1 active:scale-95 transition-transform group pt-2">
            <Package className={`w-[24px] h-[24px] transition-colors ${isTrack ? "text-[#2D4A3E]" : "text-[#2D4A3E]/40 group-hover:text-[#2D4A3E]"}`} />
            <span className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.05em] sm:tracking-[0.1em] transition-colors ${isTrack ? "text-[#2D4A3E]" : "text-[#2D4A3E]/40"}`}>Проследи</span>
          </Link>

        </div>
      </div>
    </div>
  );
}
