"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/app/profile");
  }, [router]);

  return (
    <div className="max-w-lg mx-auto flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 rounded-full border-4 border-brand-sage border-t-transparent animate-spin" />
    </div>
  );
}
