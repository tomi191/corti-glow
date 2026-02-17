"use client";

import { useState, useEffect } from "react";
import CycleCalendar from "@/components/pwa/CycleCalendar";

export default function CalendarPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="max-w-lg mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-brand-sage border-t-transparent animate-spin" />
      </div>
    );
  }

  return <CycleCalendar />;
}
