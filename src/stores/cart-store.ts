"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SHIPPING_THRESHOLD } from "@/lib/constants";

export const MAX_CART_QUANTITY = 10;

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  isSubscription?: boolean;
  subscriptionPrice?: number;
  originalPrice?: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

interface CartActions {
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

interface CartGetters {
  getItemCount: () => number;
  getSubtotal: () => number;
  getShippingProgress: () => number;
  isFreeShipping: () => boolean;
  getRemainingForFreeShipping: () => number;
  hasSubscriptionItem: () => boolean;
}

type CartStore = CartState & CartActions & CartGetters;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // State
      items: [],
      isOpen: false,

      // Actions
      addItem: (item) => {
        set((state) => {
          // Mixed-cart prevention: subscription and one-time can't mix
          const isAddingSub = !!item.isSubscription;
          const hasExistingSub = state.items.some((i) => i.isSubscription);
          const hasExistingOneTime = state.items.some((i) => !i.isSubscription);

          if (isAddingSub && hasExistingOneTime) {
            // Clear one-time items, replace with subscription
            return {
              items: [{ ...item, quantity: 1 }],
              isOpen: true,
            };
          }
          if (!isAddingSub && hasExistingSub) {
            // Clear subscription items, replace with one-time
            return {
              items: [{ ...item, quantity: 1 }],
              isOpen: true,
            };
          }

          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            if (existing.quantity >= MAX_CART_QUANTITY) return { isOpen: true };
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
              isOpen: true,
            };
          }
          return {
            items: [...state.items, { ...item, quantity: 1 }],
            isOpen: true,
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      updateQuantity: (id, delta) => {
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (!item) return state;

          const newQuantity = item.quantity + delta;
          if (newQuantity <= 0) {
            return { items: state.items.filter((i) => i.id !== id) };
          }
          if (newQuantity > MAX_CART_QUANTITY) return state;
          return {
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity: newQuantity } : i
            ),
          };
        });
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      // Getters
      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      getShippingProgress: () =>
        Math.min((get().getSubtotal() / SHIPPING_THRESHOLD) * 100, 100),

      isFreeShipping: () => get().getSubtotal() >= SHIPPING_THRESHOLD,

      getRemainingForFreeShipping: () =>
        Math.max(SHIPPING_THRESHOLD - get().getSubtotal(), 0),

      hasSubscriptionItem: () =>
        get().items.some((i) => i.isSubscription),
    }),
    {
      name: "lura-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
