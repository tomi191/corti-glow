"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  MapPin,
  CreditCard,
  Banknote,
  ExternalLink,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface OrderItem {
  title: string;
  price: number;
  quantity: number;
}

interface TrackingOrder {
  order_number: string;
  created_at: string;
  status: "new" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_status: string;
  payment_method: "card" | "cod";
  shipping_method: string;
  shipping_address: {
    city?: string;
    address?: string;
    office_name?: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping_price: number;
  discount_amount: number;
  total: number;
  econt_tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  estimated_delivery_date: string | null;
  customer_first_name: string;
  customer_last_name: string;
}

const statusSteps = [
  { key: "new", label: "Нова", icon: Clock },
  { key: "processing", label: "Обработва се", icon: Package },
  { key: "shipped", label: "Изпратена", icon: Truck },
  { key: "delivered", label: "Доставена", icon: CheckCircle2 },
];

const statusLabels: Record<string, string> = {
  new: "Нова поръчка",
  processing: "В обработка",
  shipped: "Изпратена",
  delivered: "Доставена",
  cancelled: "Отказана",
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showFoundBanner, setShowFoundBanner] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    setShowFoundBanner(false);
    setIsLoading(true);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Грешка при търсене");
        return;
      }

      setOrder(data.order);
      setShowFoundBanner(true);
      setTimeout(() => setShowFoundBanner(false), 3000);
    } catch {
      setError("Грешка при връзка със сървъра");
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentStepIndex = (status: string) => {
    const index = statusSteps.findIndex((s) => s.key === status);
    return index === -1 ? 0 : index;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F2EF] to-white py-20">
      <div className="max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#B2D8C6]/20 mb-6">
            <Package className="w-8 h-8 text-[#2D4A3E]" />
          </div>
          <h1 className="text-3xl font-semibold text-[#2D4A3E] mb-3">
            Проследи Поръчката
          </h1>
          <p className="text-stone-600">
            Въведи номера на поръчката и имейла, с който е направена
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-8 shadow-lg border border-stone-100 mb-8"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2D4A3E] mb-2">
                Номер на поръчка
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                placeholder="LU-XXXXXX"
                className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-[#B2D8C6] focus:ring-2 focus:ring-[#B2D8C6]/20 outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D4A3E] mb-2">
                Имейл адрес
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:border-[#B2D8C6] focus:ring-2 focus:ring-[#B2D8C6]/20 outline-none transition"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#2D4A3E] text-white rounded-full font-medium hover:bg-[#1f352c] transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Търси
                </>
              )}
            </button>
          </div>
        </motion.form>

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Success Banner */}
            {showFoundBanner && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 p-3 bg-[#B2D8C6]/20 border border-[#B2D8C6]/40 rounded-xl text-sm text-[#2D4A3E] font-medium"
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Поръчката е намерена!
              </motion.div>
            )}

            {/* Status Timeline */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-stone-100">
              <h2 className="text-lg font-semibold text-[#2D4A3E] mb-6">
                Статус: {statusLabels[order.status]}
              </h2>

              {order.status !== "cancelled" ? (
                <div className="relative">
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-stone-200" />
                  <div
                    className="absolute top-5 left-5 h-0.5 bg-[#B2D8C6] transition-all duration-500"
                    style={{
                      width: `${(getCurrentStepIndex(order.status) / (statusSteps.length - 1)) * 100}%`,
                    }}
                  />

                  <div className="relative flex justify-between">
                    {statusSteps.map((step, index) => {
                      const isCompleted = index <= getCurrentStepIndex(order.status);
                      const Icon = step.icon;

                      return (
                        <div key={step.key} className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                              isCompleted
                                ? "bg-[#B2D8C6] text-[#2D4A3E]"
                                : "bg-stone-100 text-stone-400"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <span
                            className={`mt-2 text-xs font-medium ${
                              isCompleted ? "text-[#2D4A3E]" : "text-stone-400"
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-red-500">
                  Тази поръчка е отказана
                </div>
              )}

              {order.econt_tracking_number && (
                <div className="mt-6 p-4 bg-[#B2D8C6]/10 rounded-lg">
                  <p className="text-sm text-[#2D4A3E]">
                    <strong>Еконт номер:</strong> {order.econt_tracking_number}
                  </p>
                  <a
                    href={`https://www.econt.com/services/track-shipment/${order.econt_tracking_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-[#2D4A3E] hover:underline mt-2"
                  >
                    Проследи в Еконт <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {order.estimated_delivery_date && !order.delivered_at && (
                <p className="mt-4 text-sm text-stone-600">
                  Очаквана доставка:{" "}
                  {new Date(order.estimated_delivery_date).toLocaleDateString("bg-BG")}
                </p>
              )}
            </div>

            {/* Order Details */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-stone-100">
              <h2 className="text-lg font-semibold text-[#2D4A3E] mb-4">
                Детайли на поръчката
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#B2D8C6] mt-0.5" />
                  <div>
                    <p className="font-medium text-[#2D4A3E]">Доставка</p>
                    <p className="text-sm text-stone-600">
                      {order.shipping_address.office_name ||
                        `${order.shipping_address.address}, ${order.shipping_address.city}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {order.payment_method === "card" ? (
                    <CreditCard className="w-5 h-5 text-[#B2D8C6] mt-0.5" />
                  ) : (
                    <Banknote className="w-5 h-5 text-[#B2D8C6] mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-[#2D4A3E]">Плащане</p>
                    <p className="text-sm text-stone-600">
                      {order.payment_method === "card" ? "Карта" : "Наложен платеж"}
                      {" - "}
                      {order.payment_status === "paid" ? "Платена" : "Очаква плащане"}
                    </p>
                  </div>
                </div>
              </div>

              <hr className="my-6 border-stone-100" />

              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-stone-600">
                      {item.title} x{item.quantity}
                    </span>
                    <span className="text-[#2D4A3E]">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}

                <hr className="border-stone-100" />

                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Междинна сума</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Доставка</span>
                  <span>
                    {order.shipping_price === 0
                      ? "Безплатна"
                      : formatPrice(order.shipping_price)}
                  </span>
                </div>

                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Отстъпка</span>
                    <span>-{formatPrice(order.discount_amount)}</span>
                  </div>
                )}

                <div className="flex justify-between font-semibold text-[#2D4A3E]">
                  <span>Общо</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
