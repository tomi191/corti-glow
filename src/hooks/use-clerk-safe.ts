"use client";

import { useUser as _useUser, useClerk as _useClerk } from "@clerk/nextjs";

// Build-time constant — NEXT_PUBLIC_* vars are inlined by Next.js at compile time,
// so the conditional hook call always takes the same branch at runtime.
const HAS_CLERK = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

/**
 * Safe wrapper around Clerk's useUser hook.
 * Returns { user: null, isLoaded: true } when Clerk is not configured.
 */
export function useUserSafe() {
  if (!HAS_CLERK) {
    return { user: null, isLoaded: true, isSignedIn: false as const };
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return _useUser();
}

/**
 * Safe wrapper around Clerk's useClerk hook.
 * Returns no-op functions when Clerk is not configured.
 */
export function useClerkSafe() {
  if (!HAS_CLERK) {
    return { signOut: async () => {}, openUserProfile: () => {} } as ReturnType<typeof _useClerk>;
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return _useClerk();
}
