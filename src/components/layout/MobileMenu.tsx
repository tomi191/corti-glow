"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { NAV_LINKS, FOOTER_LINKS } from "@/lib/constants";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Menu Button */}
      <button className="md:hidden p-2 -ml-2" onClick={() => setIsOpen(true)}>
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <span className="text-xl font-semibold tracking-widest text-[#2D4A3E]">
                LURA
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-600"
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
        </>
      )}
    </>
  );
}
