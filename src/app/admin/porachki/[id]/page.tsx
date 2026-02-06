"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  User,
  Truck,
  CreditCard,
  Package,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Printer,
  RefreshCw,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/supabase/types";

interface ShippingAddress {
  type: string;
  officeCode?: string;
  officeName?: string;
  officeAddress?: string;
  cityName?: string;
  city?: string;
  postCode?: string;
  street?: string;
  building?: string;
  apartment?: string;
  fullAddress?: string;
}

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: "new", label: "Нова" },
  { value: "processing", label: "В обработка" },
  { value: "shipped", label: "Изпратена" },
  { value: "delivered", label: "Доставена" },
  { value: "cancelled", label: "Отказана" },
];

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  processing: "bg-yellow-100 text-yellow-700 border-yellow-200",
  shipped: "bg-purple-100 text-purple-700 border-purple-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

const paymentStatusLabels: Record<string, string> = {
  pending: "Чака плащане",
  paid: "Платена",
  failed: "Неуспешна",
  refunded: "Възстановена",
};

const paymentMethodLabels: Record<string, string> = {
  card: "Карта",
  cod: "Наложен платеж",
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreatingShipment, setIsCreatingShipment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderId = params.id as string;

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      } else {
        setError("Поръчката не е намерена");
      }
    } catch (error) {
      setError("Грешка при зареждане на поръчката");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;

    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, status: newStatus }),
      });

      if (res.ok) {
        setOrder({ ...order, status: newStatus });
      } else {
        setError("Грешка при обновяване на статуса");
      }
    } catch (error) {
      setError("Грешка при обновяване");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateShipment = async () => {
    if (!order) return;

    setIsCreatingShipment(true);
    setError(null);

    try {
      const shippingAddress = order.shipping_address as unknown as ShippingAddress;
      const isOffice = shippingAddress.type === "office";

      const res = await fetch("/api/econt/shipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverName: `${order.customer_first_name} ${order.customer_last_name}`,
          receiverPhone: order.customer_phone,
          receiverEmail: order.customer_email,
          deliveryMethod: isOffice ? "office" : "address",
          officeCode: isOffice ? shippingAddress.officeCode : undefined,
          address: !isOffice
            ? {
                city: shippingAddress.city,
                postCode: shippingAddress.postCode,
                fullAddress: shippingAddress.fullAddress,
              }
            : undefined,
          orderNumber: order.order_number,
          codAmount: order.payment_method === "cod" ? order.total : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.shipmentNumber) {
        // Update local state
        setOrder({
          ...order,
          econt_shipment_id: data.shipmentNumber,
          econt_tracking_number: data.shipmentNumber,
          status: "shipped",
        });

        // Update database
        await fetch("/api/admin/orders", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id, status: "shipped" }),
        });

        if (data.pdfURL) {
          window.open(data.pdfURL, "_blank");
        }
      } else {
        setError(data.error || "Грешка при създаване на товарителница");
      }
    } catch (error) {
      setError("Грешка при създаване на товарителница");
    } finally {
      setIsCreatingShipment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("bg-BG", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-[#2D4A3E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-stone-600">{error}</p>
        <Link
          href="/admin/porachki"
          className="inline-flex items-center gap-2 mt-4 text-[#2D4A3E] hover:underline"
        >
          <ChevronLeft className="w-4 h-4" />
          Обратно към поръчките
        </Link>
      </div>
    );
  }

  if (!order) return null;

  const shippingAddress = order.shipping_address as unknown as ShippingAddress;
  const items = order.items as Array<{
    id: string;
    title: string;
    price: number;
    quantity: number;
    image?: string;
  }>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/porachki"
            className="p-2 hover:bg-stone-100 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5 text-stone-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#2D4A3E]">
              {order.order_number}
            </h1>
            <p className="text-stone-500 text-sm">
              {formatDate(order.created_at)}
            </p>
          </div>
        </div>

        {/* Status Selector */}
        <div className="flex items-center gap-3">
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
            disabled={isUpdating}
            className={`px-4 py-2 rounded-xl border-2 font-medium text-sm ${
              statusColors[order.status]
            } focus:outline-none cursor-pointer`}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {isUpdating && (
            <div className="w-5 h-5 border-2 border-[#2D4A3E] border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold text-[#2D4A3E] flex items-center gap-2">
                <Package className="w-5 h-5" />
                Продукти
              </h2>
            </div>
            <div className="divide-y divide-stone-100">
              {items.map((item, index) => (
                <div key={index} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-stone-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={64}
                        height={64}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-stone-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-stone-800">{item.title}</p>
                    <p className="text-sm text-stone-500">
                      Количество: {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-stone-800">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-stone-50 border-t border-stone-100">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-stone-500">Междинна сума</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-stone-500">Доставка</span>
                <span>
                  {order.shipping_price === 0
                    ? "Безплатна"
                    : formatPrice(order.shipping_price)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-stone-200">
                <span className="text-[#2D4A3E]">Общо</span>
                <span className="text-[#2D4A3E]">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <h2 className="font-semibold text-[#2D4A3E] flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Доставка
              </h2>
              {!order.econt_tracking_number && order.status !== "cancelled" && (
                <button
                  onClick={handleCreateShipment}
                  disabled={isCreatingShipment}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2D4A3E] text-white rounded-xl text-sm font-medium hover:bg-[#1f352c] transition disabled:opacity-50"
                >
                  {isCreatingShipment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Създаване...
                    </>
                  ) : (
                    <>
                      <Printer className="w-4 h-4" />
                      Създай Товарителница
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#2D4A3E] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-stone-800">
                    {shippingAddress.type === "office"
                      ? `Офис: ${shippingAddress.officeName}`
                      : "До адрес"}
                  </p>
                  <p className="text-sm text-stone-500 mt-1">
                    {shippingAddress.type === "office"
                      ? shippingAddress.officeAddress
                      : shippingAddress.fullAddress}
                  </p>
                </div>
              </div>

              {order.econt_tracking_number && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Товарителница създадена</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Номер: {order.econt_tracking_number}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold text-[#2D4A3E] flex items-center gap-2">
                <User className="w-5 h-5" />
                Клиент
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="font-medium text-stone-800">
                  {order.customer_first_name} {order.customer_last_name}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-600">
                <Mail className="w-4 h-4 text-stone-400" />
                <a
                  href={`mailto:${order.customer_email}`}
                  className="hover:text-[#2D4A3E]"
                >
                  {order.customer_email}
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-600">
                <Phone className="w-4 h-4 text-stone-400" />
                <a
                  href={`tel:${order.customer_phone}`}
                  className="hover:text-[#2D4A3E]"
                >
                  {order.customer_phone}
                </a>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold text-[#2D4A3E] flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Плащане
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Метод</span>
                <span className="font-medium">
                  {paymentMethodLabels[order.payment_method] ||
                    order.payment_method}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Статус</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    order.payment_status === "paid"
                      ? "bg-green-100 text-green-700"
                      : order.payment_status === "failed"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {paymentStatusLabels[order.payment_status] ||
                    order.payment_status}
                </span>
              </div>
              {order.stripe_payment_intent_id && (
                <div className="pt-2 border-t border-stone-100">
                  <p className="text-xs text-stone-400">Stripe ID</p>
                  <p className="text-xs text-stone-600 font-mono truncate">
                    {order.stripe_payment_intent_id}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold text-[#2D4A3E] flex items-center gap-2">
                <Clock className="w-5 h-5" />
                История
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#2D4A3E] mt-2" />
                  <div>
                    <p className="text-sm font-medium text-stone-800">
                      Поръчка създадена
                    </p>
                    <p className="text-xs text-stone-500">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>
                {order.updated_at !== order.created_at && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-stone-300 mt-2" />
                    <div>
                      <p className="text-sm font-medium text-stone-800">
                        Последна промяна
                      </p>
                      <p className="text-xs text-stone-500">
                        {formatDate(order.updated_at)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
