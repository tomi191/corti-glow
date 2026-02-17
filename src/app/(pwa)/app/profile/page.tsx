"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import Image from "next/image";
import { LogOut, Mail, ChevronRight, Shield, User } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();

  if (!isLoaded) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-stone-100">
          <div className="w-14 h-14 rounded-full bg-stone-200 animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 bg-stone-200 rounded animate-pulse" />
            <div className="h-3 w-48 bg-stone-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-28 bg-stone-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* User card */}
      <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-stone-100 shadow-sm">
        {user.imageUrl ? (
          <Image
            src={user.imageUrl}
            alt={user.fullName || "Аватар"}
            width={56}
            height={56}
            className="rounded-full"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-brand-sage/30 flex items-center justify-center">
            <User className="w-7 h-7 text-brand-forest" />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-stone-800 truncate">
            {user.fullName || "Потребител"}
          </p>
          <p className="text-sm text-stone-500 truncate">
            {user.primaryEmailAddress?.emailAddress}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-100">
        <button
          onClick={() => openUserProfile()}
          className="flex items-center gap-3 w-full px-5 py-4 text-left hover:bg-stone-50 transition-colors first:rounded-t-2xl"
        >
          <div className="w-9 h-9 rounded-lg bg-brand-sage/30 flex items-center justify-center">
            <Shield className="w-4.5 h-4.5 text-brand-forest" />
          </div>
          <span className="flex-1 text-sm font-medium text-stone-700">
            Управление на акаунта
          </span>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>

        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className="flex items-center gap-3 w-full px-5 py-4 text-left hover:bg-stone-50 transition-colors last:rounded-b-2xl"
        >
          <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
            <LogOut className="w-4.5 h-4.5 text-red-500" />
          </div>
          <span className="flex-1 text-sm font-medium text-red-600">
            Изход
          </span>
        </button>
      </div>

      {/* App info */}
      <p className="text-center text-xs text-stone-400">
        LURA App v1.0
      </p>
    </div>
  );
}
