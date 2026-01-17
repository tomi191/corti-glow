"use client";

import { create } from "zustand";
import type { SimpleEcontOffice, SimpleEcontCity } from "@/lib/econt/types";

export type ShippingMethod = "econt_office" | "econt_address";
export type PaymentMethod = "card" | "cod";
export type CheckoutStep = "info" | "shipping" | "payment" | "review";

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface ShippingInfo {
  method: ShippingMethod;
  // For office delivery
  selectedOffice?: SimpleEcontOffice;
  // For address delivery
  city?: string;
  postCode?: string;
  street?: string;
  building?: string;
  apartment?: string;
  // Calculated
  price: number;
  estimatedDays: number;
}

interface PaymentInfo {
  method: PaymentMethod;
  clientSecret?: string;
  paymentIntentId?: string;
}

interface CheckoutState {
  currentStep: CheckoutStep;
  customer: CustomerInfo;
  shipping: ShippingInfo;
  payment: PaymentInfo;
  orderId?: string;
  orderNumber?: string;
  isLoading: boolean;
  error?: string;
  // Shipping calculation state
  shippingCalculating: boolean;
  shippingEstimated: boolean; // true = fallback price, false = real API price
}

interface CheckoutActions {
  setStep: (step: CheckoutStep) => void;
  setCustomer: (info: Partial<CustomerInfo>) => void;
  setShippingMethod: (method: ShippingMethod) => void;
  setSelectedOffice: (office: SimpleEcontOffice | undefined) => void;
  setShippingAddress: (address: Partial<ShippingInfo>) => void;
  setShippingPrice: (price: number, days?: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setPaymentIntent: (clientSecret: string, paymentIntentId: string) => void;
  setOrder: (orderId: string, orderNumber: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | undefined) => void;
  setShippingCalculating: (calculating: boolean) => void;
  setShippingEstimated: (estimated: boolean) => void;
  reset: () => void;
  canProceedToShipping: () => boolean;
  canProceedToPayment: () => boolean;
  canSubmitOrder: () => boolean;
}

type CheckoutStore = CheckoutState & CheckoutActions;

const initialState: CheckoutState = {
  currentStep: "info",
  customer: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  },
  shipping: {
    method: "econt_office",
    price: 4.99,
    estimatedDays: 1,
  },
  payment: {
    method: "cod",
  },
  isLoading: false,
  shippingCalculating: false,
  shippingEstimated: true, // Start with estimated prices
};

export const useCheckoutStore = create<CheckoutStore>()((set, get) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),

  setCustomer: (info) =>
    set((state) => ({
      customer: { ...state.customer, ...info },
    })),

  setShippingMethod: (method) =>
    set((state) => ({
      shipping: {
        ...state.shipping,
        method,
        price: method === "econt_office" ? 4.99 : 6.99,
        estimatedDays: method === "econt_office" ? 1 : 2,
        selectedOffice: undefined,
      },
    })),

  setSelectedOffice: (office) =>
    set((state) => ({
      shipping: { ...state.shipping, selectedOffice: office },
    })),

  setShippingAddress: (address) =>
    set((state) => ({
      shipping: { ...state.shipping, ...address },
    })),

  setShippingPrice: (price, days) =>
    set((state) => ({
      shipping: {
        ...state.shipping,
        price,
        ...(days && { estimatedDays: days }),
      },
    })),

  setPaymentMethod: (method) =>
    set((state) => ({
      payment: { ...state.payment, method },
    })),

  setPaymentIntent: (clientSecret, paymentIntentId) =>
    set((state) => ({
      payment: { ...state.payment, clientSecret, paymentIntentId },
    })),

  setOrder: (orderId, orderNumber) =>
    set({ orderId, orderNumber }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  setShippingCalculating: (calculating) => set({ shippingCalculating: calculating }),

  setShippingEstimated: (estimated) => set({ shippingEstimated: estimated }),

  reset: () => set(initialState),

  canProceedToShipping: () => {
    const { customer } = get();
    return (
      customer.firstName.length >= 2 &&
      customer.lastName.length >= 2 &&
      customer.email.includes("@") &&
      /^(\+359|0)[0-9]{9}$/.test(customer.phone.replace(/\s/g, ""))
    );
  },

  canProceedToPayment: () => {
    const { shipping } = get();
    if (shipping.method === "econt_office") {
      return !!shipping.selectedOffice;
    }
    return (
      !!shipping.city &&
      shipping.city.length >= 2 &&
      !!shipping.street &&
      shipping.street.length >= 3
    );
  },

  canSubmitOrder: () => {
    const state = get();
    return (
      state.canProceedToShipping() &&
      state.canProceedToPayment() &&
      !!state.payment.method
    );
  },
}));
