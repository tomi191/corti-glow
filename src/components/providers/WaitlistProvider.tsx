"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { IS_PRELAUNCH } from "@/lib/constants";
import { WaitlistModal } from "@/components/ui/WaitlistModal";

interface WaitlistContextValue {
  openWaitlist: () => void;
}

const WaitlistContext = createContext<WaitlistContextValue>({
  openWaitlist: () => {},
});

export function useWaitlist() {
  return useContext(WaitlistContext);
}

export function WaitlistProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openWaitlist = useCallback(() => setIsOpen(true), []);
  const closeWaitlist = useCallback(() => setIsOpen(false), []);

  if (!IS_PRELAUNCH) {
    return <>{children}</>;
  }

  return (
    <WaitlistContext.Provider value={{ openWaitlist }}>
      {children}
      <WaitlistModal isOpen={isOpen} onClose={closeWaitlist} />
    </WaitlistContext.Provider>
  );
}
