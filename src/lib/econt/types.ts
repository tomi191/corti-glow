// Econt API Types

export interface EcontCity {
  id: number;
  name: string;
  nameEn: string;
  regionName: string;
  regionNameEn: string;
  postCode: string;
  countryCode: string;
  expressCityDeliveries: boolean;
}

export interface EcontOffice {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  address: EcontAddress;
  phone: string;
  email: string;
  workTime: string;
  workTimeSchedule: EcontWorkTimeSchedule[];
  hubCode: string;
  hubName: string;
  isAPS: boolean;
  isMPS: boolean;
  partnerCode: string;
  currency: string;
  language: string;
}

export interface EcontAddress {
  id?: number;
  city: EcontCity;
  fullAddress: string;
  fullAddressEn: string;
  quarter?: string;
  street?: string;
  num?: string;
  building?: string;
  entrance?: string;
  floor?: string;
  apartment?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface EcontWorkTimeSchedule {
  date: string;
  workingTimeFrom: string;
  workingTimeTo: string;
}

export interface EcontShippingLabel {
  shipmentNumber: string;
  pdfURL: string;
}

export interface EcontShipmentRequest {
  label: {
    senderClient: EcontClient;
    senderAddress?: EcontAddress;
    senderOfficeCode?: string;
    receiverClient: EcontClient;
    receiverAddress?: EcontAddress;
    receiverOfficeCode?: string;
    packCount: number;
    shipmentType: "PACK" | "DOCUMENT" | "PALLET";
    weight: number;
    shipmentDescription: string;
    orderNumber?: string;
    // COD
    services?: {
      cdAmount?: number;
      cdType?: "GET" | "GIVE";
      cdCurrency?: string;
      cdPayOptionsToReceiver?: "CASH" | "CARD";
      declaredValueAmount?: number;
      declaredValueCurrency?: string;
      smsNotification?: boolean;
    };
    paymentReceiverMethod?: "CASH" | "CARD" | "CONTRACT";
    paymentSenderMethod?: "CASH" | "CARD" | "CONTRACT";
    payAfterAccept?: boolean;
    payAfterTest?: boolean;
  };
  mode?: "validate" | "create" | "calculate";
}

export interface EcontClient {
  name: string;
  phones: string[];
  email?: string;
}

export interface EcontCalculateRequest {
  label: {
    senderOfficeCode?: string;
    senderAddress?: {
      city: {
        country: {
          code3: string;
        };
        name: string;
        postCode?: string;
      };
    };
    receiverOfficeCode?: string;
    receiverAddress?: {
      city: {
        country: {
          code3: string;
        };
        name: string;
        postCode?: string;
      };
    };
    packCount: number;
    shipmentType: "PACK" | "DOCUMENT" | "PALLET";
    weight: number;
    services?: {
      cdAmount?: number;
      cdType?: "GET";
      cdCurrency?: string;
      declaredValueAmount?: number;
      declaredValueCurrency?: string;
    };
  };
  mode: "calculate";
}

export interface EcontCalculateResponse {
  label: {
    receiverDueAmount: number;
    senderDueAmount: number;
    totalPrice: number;
    currency: string;
  };
}

export interface EcontTrackingEvent {
  time: string;
  event: string;
  details: string;
  office?: string;
}

export interface EcontTrackingResponse {
  shipmentNumber: string;
  status: string;
  events: EcontTrackingEvent[];
  deliveredDate?: string;
  expectedDeliveryDate?: string;
}

// Simplified types for frontend
export interface SimpleEcontOffice {
  id: string;
  code: string;
  name: string;
  cityId: number;
  cityName: string;
  address: string;
  phone: string;
  workTime: string;
  latitude?: number;
  longitude?: number;
}

export interface SimpleEcontCity {
  id: number;
  name: string;
  region: string;
  postCode: string;
}

export interface ShippingCalculation {
  price: number;
  currency: string;
  deliveryDays: number;
  method: "econt_office" | "econt_address";
}
