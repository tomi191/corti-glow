import type { Metadata } from "next";
import { CheckoutForm } from "./CheckoutForm";
import { OrderSummary } from "./OrderSummary";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Завърши поръчката си",
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-semibold text-[#2D4A3E] mb-8 text-center">
          Завърши Поръчката
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <CheckoutForm />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
