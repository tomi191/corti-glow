"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  ArrowLeft,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

const ACCOUNT_EMAIL_KEY = "lura-account-email";

interface OrderItem {
  title: string;
  price: number;
  quantity: number;
}

interface Order {
  order_number: string;
  created_at: string;
  status: "new" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_status: string;
  payment_method: string;
  items: OrderItem[];
  total: number;
  econt_tracking_number: string | null;
}

const statusConfig = {
  new: { label: "Нова", icon: Clock, color: "text-blue-600 bg-blue-50" },
  processing: { label: "Обработва се", icon: Package, color: "text-amber-600 bg-amber-50" },
  shipped: { label: "Изпратена", icon: Truck, color: "text-purple-600 bg-purple-50" },
  delivered: { label: "Доставена", icon: CheckCircle2, color: "text-green-600 bg-green-50" },
  cancelled: { label: "Отказана", icon: XCircle, color: "text-red-600 bg-red-50" },
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(ACCOUNT_EMAIL_KEY);
    if (!stored) {
      router.push("/akount");
      return;
    }
    setEmail(stored);
    fetchOrders(stored);
  }, [router]);

  const fetchOrders = async (emailToCheck: string) => {
    try {
      const res = await fetch("/api/account/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToCheck }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      }
    } catch {
      // Error handling
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F2EF] to-white py-20 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#B2D8C6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F2EF] to-white py-20">
      <div className="max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/akount"
            className="inline-flex items-center gap-2 text-stone-600 hover:text-[#2D4A3E] transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Обратно
          </Link>

          <h1 className="text-3xl font-semibold text-[#2D4A3E] mb-2">
            Моите Поръчки
          </h1>
          <p className="text-stone-600">{email}</p>
        </motion.div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-12 shadow-lg border border-stone-100 text-center"
          >
            <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-[#2D4A3E] mb-2">
              Няма поръчки
            </h2>
            <p className="text-stone-500 mb-6">
              Все още нямаш направени поръчки с този имейл
            </p>
            <Link
              href="/magazin"
              className="inline-flex px-6 py-3 bg-[#2D4A3E] text-white rounded-full font-medium hover:bg-[#1f352c] transition"
            >
              Разгледай Продукти
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={order.order_number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-stone-100"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-semibold text-[#2D4A3E]">
                        {order.order_number}
                      </p>
                      <p className="text-sm text-stone-500">
                        {new Date(order.created_at).toLocaleDateString("bg-BG", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}
                    >
                      <StatusIcon className="w-4 h-4" />
                      {status.label}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-stone-600">
                          {item.title} x{item.quantity}
                        </span>
                        <span className="text-stone-800">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                    <div className="font-semibold text-[#2D4A3E]">
                      Общо: {formatPrice(order.total)}
                    </div>

                    <div className="flex items-center gap-3">
                      {order.econt_tracking_number && (
                        <a
                          href={`https://www.econt.com/services/track-shipment/${order.econt_tracking_number}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-[#2D4A3E] hover:underline"
                        >
                          Проследи <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <Link
                        href={`/prosledi-porachka?order=${order.order_number}`}
                        className="text-sm text-[#2D4A3E] hover:underline"
                      >
                        Детайли
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
