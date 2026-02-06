"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Truck, CreditCard, ChevronRight, AlertCircle } from "lucide-react";
import { useCheckoutStore } from "@/stores/checkout-store";
import { useCartStore } from "@/stores/cart-store";
import { ShippingMethodSelector } from "./ShippingMethodSelector";
import { EcontOfficeSelector } from "./EcontOfficeSelector";
import { AddressForm } from "./AddressForm";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { StripePaymentForm } from "./StripePaymentForm";
import { DiscountCodeInput } from "./DiscountCodeInput";
import { SuccessCheckmark } from "@/components/ui/SuccessCheckmark";
import { trackBeginCheckout } from "@/components/analytics/GoogleAnalytics";

export function CheckoutForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [codSuccess, setCodSuccess] = useState(false);

  const {
    currentStep,
    setStep,
    customer,
    setCustomer,
    shipping,
    payment,
    discount,
    canProceedToShipping,
    canProceedToPayment,
    canSubmitOrder,
    setOrder,
    setLoading,
    setError: setStoreError,
    reset: resetCheckout,
  } = useCheckoutStore();

  const { items, getSubtotal, isFreeShipping, clearCart } = useCartStore();
  const subtotal = getSubtotal();
  const shippingPrice = isFreeShipping() ? 0 : shipping.price;
  const discountAmount = discount?.amount ?? 0;
  const total = subtotal + shippingPrice - discountAmount;

  // Track begin_checkout on mount
  useEffect(() => {
    if (items.length > 0) {
      trackBeginCheckout(
        items.map((item) => ({
          id: item.id,
          name: item.title,
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create payment intent when proceeding to card payment
  const handleCreateOrder = async () => {
    if (!canSubmitOrder()) {
      setError("Моля, попълнете всички задължителни полета.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare shipping address
      const shippingAddress =
        shipping.method === "econt_office"
          ? {
              type: "office",
              officeCode: shipping.selectedOffice?.code,
              officeName: shipping.selectedOffice?.name,
              officeAddress: shipping.selectedOffice?.address,
              cityName: shipping.selectedOffice?.cityName,
            }
          : {
              type: "address",
              city: shipping.city,
              postCode: shipping.postCode,
              street: shipping.street,
              building: shipping.building,
              apartment: shipping.apartment,
              fullAddress: [
                shipping.street,
                shipping.building,
                shipping.apartment,
                shipping.city,
                shipping.postCode,
              ]
                .filter(Boolean)
                .join(", "),
            };

      // Prepare cart items (must include productId and variantId for server validation)
      const orderItems = items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        title: item.title,
      }));

      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerFirstName: customer.firstName,
          customerLastName: customer.lastName,
          customerEmail: customer.email,
          customerPhone: customer.phone.replace(/\s/g, ""),
          shippingMethod: shipping.method,
          shippingAddress,
          shippingPrice,
          items: orderItems,
          subtotal,
          total,
          currency: "EUR",
          paymentMethod: payment.method,
          ...(discount && { discountCode: discount.code }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      setOrder(data.orderId, data.orderNumber);

      // For COD orders, show success animation then redirect
      if (payment.method === "cod") {
        setCodSuccess(true);
        setTimeout(() => {
          clearCart();
          resetCheckout();
          router.push(`/uspeh?orderNumber=${data.orderNumber}`);
        }, 1500);
        return;
      }

      // For card payments, show Stripe form
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      }
    } catch (err) {
      console.error("Order creation failed:", err);
      setError(
        err instanceof Error && err.message !== "Failed to fetch"
          ? err.message
          : "Няма връзка със сървъра. Проверете интернет връзката си и опитайте отново."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    resetCheckout();
    const { orderNumber } = useCheckoutStore.getState();
    router.push(`/uspeh?orderNumber=${orderNumber}`);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // Validate phone format
  const isValidPhone = (phone: string) => {
    const cleaned = phone.replace(/\s/g, "");
    return /^(\+359|0)[0-9]{9}$/.test(cleaned);
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {[
            { num: 1, label: "Данни", icon: User },
            { num: 2, label: "Доставка", icon: Truck },
            { num: 3, label: "Плащане", icon: CreditCard },
          ].map((step, index) => (
            <div key={step.num} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    step.num === 1
                      ? "bg-[#2D4A3E] text-white"
                      : canProceedToShipping() && step.num === 2
                        ? "bg-[#2D4A3E] text-white"
                        : canProceedToPayment() && step.num === 3
                          ? "bg-[#2D4A3E] text-white"
                          : "bg-stone-100 text-stone-400"
                  }`}
                >
                  {step.num}
                </div>
                <span className="text-xs text-stone-500 hidden sm:block">{step.label}</span>
              </div>
              {index < 2 && (
                <div
                  className={`w-12 sm:w-20 h-0.5 mx-2 transition-colors ${
                    (index === 0 && canProceedToShipping()) ||
                    (index === 1 && canProceedToPayment())
                      ? "bg-[#2D4A3E]"
                      : "bg-stone-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Customer Info Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
        <h2 className="text-lg font-semibold text-[#2D4A3E] mb-6 flex items-center gap-2">
          <User className="w-5 h-5" />
          Информация за Контакт
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">
              Име
            </label>
            <input
              type="text"
              value={customer.firstName}
              onChange={(e) => setCustomer({ firstName: e.target.value })}
              className="w-full bg-white border border-stone-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
              placeholder="Мария"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">
              Фамилия
            </label>
            <input
              type="text"
              value={customer.lastName}
              onChange={(e) => setCustomer({ lastName: e.target.value })}
              className="w-full bg-white border border-stone-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
              placeholder="Иванова"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">
              Телефон
            </label>
            <input
              type="tel"
              value={customer.phone}
              onChange={(e) => setCustomer({ phone: e.target.value })}
              className={`w-full bg-white border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E] ${
                customer.phone && !isValidPhone(customer.phone)
                  ? "border-red-300"
                  : "border-stone-200"
              }`}
              placeholder="0888 123 456"
            />
            {customer.phone && !isValidPhone(customer.phone) && (
              <p className="text-red-500 text-xs mt-1">
                Невалиден формат (пр. 0888123456 или +359888123456)
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">
              Имейл
            </label>
            <input
              type="email"
              value={customer.email}
              onChange={(e) => setCustomer({ email: e.target.value })}
              className="w-full bg-white border border-stone-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2D4A3E] focus:ring-1 focus:ring-[#2D4A3E]"
              placeholder="maria@example.com"
            />
          </div>
        </div>
      </div>

      {/* Shipping Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
        <h2 className="text-lg font-semibold text-[#2D4A3E] mb-6 flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Доставка
        </h2>

        <div className="space-y-6">
          <ShippingMethodSelector />
          <EcontOfficeSelector />
          <AddressForm />
        </div>
      </div>

      {/* Discount Code */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
        <DiscountCodeInput />
      </div>

      {/* Payment Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
        <h2 className="text-lg font-semibold text-[#2D4A3E] mb-6 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Плащане
        </h2>

        <PaymentMethodSelector />

        {/* Stripe Payment Form */}
        {payment.method === "card" && clientSecret && (
          <div className="mt-6 pt-6 border-t border-stone-100">
            <StripePaymentForm
              clientSecret={clientSecret}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        )}
      </div>

      {/* COD Success Animation */}
      {codSuccess && (
        <div className="flex justify-center py-6">
          <SuccessCheckmark message="Поръчката е приета!" />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Submit Button */}
      {(!clientSecret || payment.method === "cod") && (
        <button
          type="button"
          onClick={handleCreateOrder}
          disabled={isSubmitting || !canSubmitOrder()}
          className="w-full py-4 bg-[#2D4A3E] text-white rounded-xl font-semibold text-lg shadow-xl shadow-[#2D4A3E]/20 hover:bg-[#1f352c] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Обработка...
            </>
          ) : payment.method === "card" ? (
            <>
              Продължи към Плащане
              <ChevronRight className="w-5 h-5" />
            </>
          ) : (
            <>
              Завърши Поръчката
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      )}

      <p className="text-center text-xs text-stone-400">
        Натискайки бутона, се съгласявате с нашите{" "}
        <a href="/obshti-usloviya" className="underline hover:text-stone-600">
          Общи условия
        </a>{" "}
        и{" "}
        <a href="/poveritelnost" className="underline hover:text-stone-600">
          Политика за поверителност
        </a>
        .
      </p>
    </div>
  );
}
