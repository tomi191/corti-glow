"use client";

import { useState, useEffect } from "react";
import { X, Share, PlusSquare } from "lucide-react";
import { isIOSInBrowser } from "@/lib/push-notifications";
import { usePwaStore } from "@/stores/pwa-store";

export default function IOSInstallBanner() {
  const [show, setShow] = useState(false);
  const { iosInstallDismissed, dismissIOSInstall } = usePwaStore();

  useEffect(() => {
    if (iosInstallDismissed || !isIOSInBrowser()) return;

    // Delay showing to avoid layout shift on load
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, [iosInstallDismissed]);

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <div className="glass rounded-2xl p-4 shadow-lg border border-stone-200/50">
        {/* Close button */}
        <button
          onClick={() => {
            setShow(false);
            dismissIOSInstall();
          }}
          className="absolute top-3 right-3 p-1 text-stone-400 hover:text-stone-600"
          aria-label="Затвори"
        >
          <X className="w-4 h-4" />
        </button>

        <p className="text-sm font-semibold text-brand-forest mb-3">
          Добави LURA на началния екран
        </p>

        {/* Step 1 */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-brand-sage/30 flex items-center justify-center shrink-0">
            <Share className="w-4 h-4 text-brand-forest" />
          </div>
          <p className="text-xs text-stone-600">
            Натисни <span className="font-semibold">Share</span> в Safari
          </p>
        </div>

        {/* Step 2 */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-sage/30 flex items-center justify-center shrink-0">
            <PlusSquare className="w-4 h-4 text-brand-forest" />
          </div>
          <p className="text-xs text-stone-600">
            Избери <span className="font-semibold">&quot;Добави към началния екран&quot;</span>
          </p>
        </div>
      </div>
    </div>
  );
}
