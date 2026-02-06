"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/stores/cart-store";
import { useCheckoutStore } from "@/stores/checkout-store";
import { formatPrice } from "@/lib/utils";
import { CheckCircle, Shield, Truck, Package } from "lucide-react";

export function OrderSummary() {
  const [mounted, setMounted] = useState(false);
  const { items, getSubtotal, isFreeShipping } = useCartStore();
  const { shipping, discount } = useCheckoutStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = getSubtotal();
  const hasFreeShipping = isFreeShipping();
  const shippingPrice = hasFreeShipping ? 0 : shipping.price;
  const discountAmount = discount?.amount ?? 0;
  const total = subtotal + shippingPrice - discountAmount;

  if (!mounted || items.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
        <p className="text-stone-500 text-center">Количката е празна</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 sticky top-24">
      <h2 className="text-lg font-semibold text-[#2D4A3E] mb-6">
        Твоята Поръчка
      </h2>

      {/* Items */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="w-16 h-16 bg-stone-100 rounded-lg flex-shrink-0 overflow-hidden">
              <Image
                src={item.image}
                alt={item.title}
                width={64}
                height={64}
                className="w-full h-full object-contain p-1"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-stone-800 leading-tight">
                {item.title}
              </p>
              <p className="text-xs text-stone-500">Кол: {item.quantity}</p>
            </div>
            <p className="text-sm font-bold text-stone-800">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Shipping Method Info */}
      {shipping.method && (
        <div className="py-3 border-t border-stone-100">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Truck className="w-4 h-4 text-[#2D4A3E]" />
            <span>
              {shipping.method === "econt_office"
                ? "До офис на Еконт"
                : "До адрес"}
            </span>
          </div>
          {shipping.selectedOffice && (
            <p className="text-xs text-stone-500 mt-1 ml-6">
              {shipping.selectedOffice.name}
            </p>
          )}
          {shipping.method === "econt_address" && shipping.city && (
            <p className="text-xs text-stone-500 mt-1 ml-6">
              {[shipping.street, shipping.city].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      )}

      {/* Totals */}
      <div className="border-t border-stone-100 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-stone-500">Междинна сума</span>
          <span className="text-stone-800">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-stone-500">Доставка</span>
          <span
            className={
              hasFreeShipping ? "text-[#2D4A3E] font-medium" : "text-stone-800"
            }
          >
            {hasFreeShipping ? "БЕЗПЛАТНА" : formatPrice(shippingPrice)}
          </span>
        </div>
        {discount && discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">
              Отстъпка ({discount.code})
            </span>
            <span className="text-green-600 font-medium">
              -{formatPrice(discountAmount)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold pt-2 border-t border-stone-100">
          <span className="text-[#2D4A3E]">Общо</span>
          <span className="text-[#2D4A3E]">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="mt-4 p-3 bg-[#B2D8C6]/20 rounded-xl">
        <div className="flex items-center gap-2 text-sm text-[#2D4A3E]">
          <Package className="w-4 h-4" />
          <span className="font-medium">
            Очаквана доставка: {shipping.estimatedDays || 1}-
            {(shipping.estimatedDays || 1) + 1} работни дни
          </span>
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-6 pt-6 border-t border-stone-100 space-y-3">
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <CheckCircle className="w-4 h-4 text-[#B2D8C6]" />
          14-дневна гаранция за връщане
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Shield className="w-4 h-4 text-[#B2D8C6]" />
          Сигурно плащане
        </div>
      </div>
    </div>
  );
}
