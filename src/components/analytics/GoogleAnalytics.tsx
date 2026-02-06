"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Check initial consent
    const stored = localStorage.getItem("lura-cookie-consent");
    if (stored) {
      const consent = JSON.parse(stored);
      setHasConsent(consent.analytics === true);
    }

    // Listen for consent changes
    const handleConsent = (e: CustomEvent<boolean>) => {
      setHasConsent(e.detail);
    };

    window.addEventListener("cookie-consent-analytics", handleConsent as EventListener);
    return () => {
      window.removeEventListener("cookie-consent-analytics", handleConsent as EventListener);
    };
  }, []);

  // Don't render if no GA ID or no consent
  if (!GA_MEASUREMENT_ID || !hasConsent) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
            anonymize_ip: true
          });
        `}
      </Script>
    </>
  );
}

// Track page views
export function trackPageView(url: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
}

// Track events
export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// GA4 Ecommerce: Add to Cart
export function trackAddToCart(item: {
  id: string;
  name: string;
  price: number;
  quantity?: number;
}) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "add_to_cart", {
      currency: "BGN",
      value: item.price * (item.quantity ?? 1),
      items: [
        {
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity ?? 1,
        },
      ],
    });
  }
}

// GA4 Ecommerce: Begin Checkout
export function trackBeginCheckout(items: Array<{
  id: string;
  name: string;
  price: number;
  quantity: number;
}>, total: number) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "begin_checkout", {
      currency: "BGN",
      value: total,
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  }
}

// GA4 Ecommerce: Purchase
export function trackPurchase(orderNumber: string, total: number, items: Array<{
  id: string;
  name: string;
  price: number;
  quantity: number;
}>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "purchase", {
      transaction_id: orderNumber,
      currency: "BGN",
      value: total,
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });
  }
}

// Add gtag to window type
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
