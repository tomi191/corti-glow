"use client";

import { useCallback, useRef } from "react";
import { useCheckoutStore } from "@/stores/checkout-store";
import { useCartStore } from "@/stores/cart-store";

export function useShippingCalculation() {
  const {
    shipping,
    setShippingPrice,
    setShippingCalculating,
    setShippingEstimated,
    setShippingError,
  } = useCheckoutStore();

  const { getSubtotal, isFreeShipping } = useCartStore();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const calculateShipping = useCallback(async () => {
    // If free shipping, no need to calculate
    if (isFreeShipping()) {
      setShippingPrice(0, shipping.method === "econt_office" ? 1 : 2);
      setShippingEstimated(false);
      return;
    }

    // For office delivery, need office selected
    if (shipping.method === "econt_office" && !shipping.selectedOffice?.code) {
      return;
    }

    // For address delivery, need city and street
    if (
      shipping.method === "econt_address" &&
      (!shipping.city || !shipping.street)
    ) {
      return;
    }

    // Abort previous request if any
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    setShippingCalculating(true);

    try {
      const response = await fetch("/api/econt/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: shipping.method === "econt_office" ? "office" : "address",
          cityName:
            shipping.method === "econt_office"
              ? shipping.selectedOffice?.cityName
              : shipping.city,
          officeCode: shipping.selectedOffice?.code,
          address:
            shipping.method === "econt_address" && shipping.street
              ? `${shipping.street} ${shipping.building || ""} ${shipping.apartment || ""}`.trim()
              : undefined,
          postCode: shipping.postCode,
          weight: 0.5, // Default weight - could be calculated from cart
          subtotal: getSubtotal(),
        }),
        signal: abortController.current.signal,
      });

      if (!response.ok) {
        throw new Error("Calculation failed");
      }

      const data = await response.json();

      if (data.price !== undefined) {
        setShippingPrice(data.price, data.deliveryDays || (shipping.method === "econt_office" ? 1 : 2));
        setShippingEstimated(data.estimated || false);
        setShippingError("");
      }
    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      console.error("Shipping calculation error:", error);
      // Keep estimated price on error
      setShippingEstimated(true);
      setShippingError("Не можахме да изчислим доставката. Цената е приблизителна.");
    } finally {
      setShippingCalculating(false);
    }
  }, [
    shipping,
    getSubtotal,
    isFreeShipping,
    setShippingPrice,
    setShippingCalculating,
    setShippingEstimated,
    setShippingError,
  ]);

  // Debounced calculation - waits 600ms after last call
  const debouncedCalculate = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      calculateShipping();
    }, 600);
  }, [calculateShipping]);

  // Immediate calculation (for method switches)
  const immediateCalculate = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    calculateShipping();
  }, [calculateShipping]);

  return {
    calculateShipping,
    debouncedCalculate,
    immediateCalculate,
  };
}
