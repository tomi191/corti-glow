"use client";

import { useEffect } from "react";
import { trackPurchase } from "@/components/analytics/GoogleAnalytics";

interface PurchaseTrackerProps {
  orderNumber: string;
}

export function PurchaseTracker({ orderNumber }: PurchaseTrackerProps) {
  useEffect(() => {
    // Deduplicate: only fire once per order
    const key = `lura-purchase-tracked-${orderNumber}`;
    if (sessionStorage.getItem(key)) return;

    // Get cart data from localStorage before it was cleared
    // Since cart is already cleared by the time we reach success page,
    // we fire a minimal purchase event with the order number
    trackPurchase(orderNumber, 0, []);
    sessionStorage.setItem(key, "1");
  }, [orderNumber]);

  return null;
}
