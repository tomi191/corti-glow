"use client";

import { useState, useEffect } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { useCheckoutStore } from "@/stores/checkout-store";
import { Lock, AlertCircle } from "lucide-react";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface PaymentFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

function PaymentForm({ onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { customer, shipping, orderNumber } = useCheckoutStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/uspeh?orderNumber=${orderNumber}`,
        receipt_email: customer.email,
        shipping: {
          name: `${customer.firstName} ${customer.lastName}`,
          phone: customer.phone,
          address: {
            line1: shipping.method === "econt_office"
              ? `Офис: ${shipping.selectedOffice?.name || ""}`
              : shipping.street || "",
            line2: shipping.method === "econt_office"
              ? shipping.selectedOffice?.address || ""
              : [shipping.building, shipping.apartment].filter(Boolean).join(", "),
            city: shipping.method === "econt_office"
              ? shipping.selectedOffice?.cityName || ""
              : shipping.city || "",
            postal_code: shipping.postCode || "",
            country: "BG",
          },
        },
      },
      redirect: "if_required",
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "Възникна грешка при плащането.");
      } else {
        setMessage("Възникна неочаквана грешка.");
      }
      onError(error.message || "Payment failed");
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {message && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full py-4 bg-[#2D4A3E] text-white rounded-xl font-semibold text-lg shadow-xl shadow-[#2D4A3E]/20 hover:bg-[#1f352c] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Обработка...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Плати Сега
          </>
        )}
      </button>

      <p className="text-center text-xs text-stone-400 flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" />
        Сигурно плащане чрез Stripe
      </p>
    </form>
  );
}

interface StripePaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function StripePaymentForm({
  clientSecret,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#2D4A3E",
        colorBackground: "#ffffff",
        colorText: "#1c1917",
        colorDanger: "#dc2626",
        fontFamily: "system-ui, sans-serif",
        borderRadius: "12px",
        spacingUnit: "4px",
      },
      rules: {
        ".Input": {
          border: "1px solid #e7e5e4",
          padding: "12px 16px",
        },
        ".Input:focus": {
          border: "1px solid #2D4A3E",
          boxShadow: "0 0 0 1px #2D4A3E",
        },
        ".Label": {
          fontWeight: "600",
          fontSize: "12px",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "#78716c",
          marginBottom: "4px",
        },
      },
    },
    locale: "bg",
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}
