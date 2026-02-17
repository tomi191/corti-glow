"use client";

import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div className="max-w-lg mx-auto">
      <UserProfile
        routing="hash"
        appearance={{
          elements: {
            rootBox: "w-full",
            cardBox: "shadow-none border border-stone-100 rounded-2xl",
          },
        }}
      />
    </div>
  );
}
