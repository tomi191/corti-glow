"use client";

import { useEffect, useRef } from "react";
import { useUserSafe } from "@/hooks/use-clerk-safe";
import { usePwaStore } from "@/stores/pwa-store";

/**
 * Triggers a one-time server sync when a Clerk user is signed in.
 * Place this hook in the PWA layout so it runs on every app load.
 *
 * - No-ops when Clerk is not configured or user is not signed in
 * - Uses a ref to prevent duplicate calls within the same session
 * - The store's isSyncing guard prevents concurrent requests
 */
export function usePwaSync() {
  const { isSignedIn, isLoaded } = useUserSafe();
  const syncWithServer = usePwaStore((s) => s.syncWithServer);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && !syncedRef.current) {
      syncedRef.current = true;
      syncWithServer();
    }
  }, [isLoaded, isSignedIn, syncWithServer]);
}
