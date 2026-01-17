export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          slug: string;
          sku: string | null;
          barcode: string | null;
          name: string;
          tagline: string | null;
          description: string;
          flavor: string | null;
          servings: number | null;
          price: number;
          compare_at_price: number | null;
          cost_price: number | null;
          image: string;
          images: string[];
          stock: number;
          low_stock_threshold: number;
          track_inventory: boolean;
          status: "active" | "draft" | "archived";
          badge: string | null;
          features: Json;
          ingredients: Json;
          variants: Json;
          how_to_use: Json | null;
          meta_title: string | null;
          meta_description: string | null;
          weight: number;
          dimensions: Json | null;
          created_at: string;
          updated_at: string;
          published: boolean;
        };
        Insert: {
          id?: string;
          slug: string;
          sku?: string | null;
          barcode?: string | null;
          name: string;
          tagline?: string | null;
          description: string;
          flavor?: string | null;
          servings?: number | null;
          price: number;
          compare_at_price?: number | null;
          cost_price?: number | null;
          image: string;
          images?: string[];
          stock?: number;
          low_stock_threshold?: number;
          track_inventory?: boolean;
          status?: "active" | "draft" | "archived";
          badge?: string | null;
          features?: Json;
          ingredients?: Json;
          variants?: Json;
          how_to_use?: Json | null;
          meta_title?: string | null;
          meta_description?: string | null;
          weight?: number;
          dimensions?: Json | null;
          created_at?: string;
          updated_at?: string;
          published?: boolean;
        };
        Update: {
          id?: string;
          slug?: string;
          sku?: string | null;
          barcode?: string | null;
          name?: string;
          tagline?: string | null;
          description?: string;
          flavor?: string | null;
          servings?: number | null;
          price?: number;
          compare_at_price?: number | null;
          cost_price?: number | null;
          image?: string;
          images?: string[];
          stock?: number;
          low_stock_threshold?: number;
          track_inventory?: boolean;
          status?: "active" | "draft" | "archived";
          badge?: string | null;
          features?: Json;
          ingredients?: Json;
          variants?: Json;
          how_to_use?: Json | null;
          meta_title?: string | null;
          meta_description?: string | null;
          weight?: number;
          dimensions?: Json | null;
          created_at?: string;
          updated_at?: string;
          published?: boolean;
        };
        Relationships: [];
      };
      discounts: {
        Row: {
          id: string;
          code: string;
          type: "percentage" | "fixed";
          value: number;
          min_order_value: number | null;
          max_uses: number | null;
          used_count: number;
          start_date: string | null;
          end_date: string | null;
          active: boolean;
          applies_to: "all" | "specific_products" | "specific_variants";
          product_ids: string[] | null;
          variant_ids: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          type: "percentage" | "fixed";
          value: number;
          min_order_value?: number | null;
          max_uses?: number | null;
          used_count?: number;
          start_date?: string | null;
          end_date?: string | null;
          active?: boolean;
          applies_to?: "all" | "specific_products" | "specific_variants";
          product_ids?: string[] | null;
          variant_ids?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          type?: "percentage" | "fixed";
          value?: number;
          min_order_value?: number | null;
          max_uses?: number | null;
          used_count?: number;
          start_date?: string | null;
          end_date?: string | null;
          active?: boolean;
          applies_to?: "all" | "specific_products" | "specific_variants";
          product_ids?: string[] | null;
          variant_ids?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          created_at: string;
          updated_at: string;
          customer_first_name: string;
          customer_last_name: string;
          customer_email: string;
          customer_phone: string;
          shipping_method: "econt_office" | "econt_address" | "speedy";
          shipping_address: Json;
          shipping_price: number;
          shipping_weight: number | null;
          // Econt Waybill
          econt_shipment_id: string | null;
          econt_tracking_number: string | null;
          econt_label_url: string | null;
          econt_label_generated_at: string | null;
          // Shipping Timeline
          shipped_at: string | null;
          delivered_at: string | null;
          estimated_delivery_date: string | null;
          // Payment
          payment_method: "card" | "cod";
          payment_status: "pending" | "paid" | "failed" | "refunded";
          stripe_payment_intent_id: string | null;
          // Order details
          items: Json;
          subtotal: number;
          discount_code: string | null;
          discount_amount: number;
          total: number;
          currency: string;
          status: "new" | "processing" | "shipped" | "delivered" | "cancelled";
          notes: string | null;
        };
        Insert: {
          id?: string;
          order_number: string;
          created_at?: string;
          updated_at?: string;
          customer_first_name: string;
          customer_last_name: string;
          customer_email: string;
          customer_phone: string;
          shipping_method: "econt_office" | "econt_address" | "speedy";
          shipping_address: Json;
          shipping_price: number;
          shipping_weight?: number | null;
          econt_shipment_id?: string | null;
          econt_tracking_number?: string | null;
          econt_label_url?: string | null;
          econt_label_generated_at?: string | null;
          shipped_at?: string | null;
          delivered_at?: string | null;
          estimated_delivery_date?: string | null;
          payment_method: "card" | "cod";
          payment_status?: "pending" | "paid" | "failed" | "refunded";
          stripe_payment_intent_id?: string | null;
          items: Json;
          subtotal: number;
          discount_code?: string | null;
          discount_amount?: number;
          total: number;
          currency?: string;
          status?: "new" | "processing" | "shipped" | "delivered" | "cancelled";
          notes?: string | null;
        };
        Update: {
          id?: string;
          order_number?: string;
          created_at?: string;
          updated_at?: string;
          customer_first_name?: string;
          customer_last_name?: string;
          customer_email?: string;
          customer_phone?: string;
          shipping_method?: "econt_office" | "econt_address" | "speedy";
          shipping_address?: Json;
          shipping_price?: number;
          shipping_weight?: number | null;
          econt_shipment_id?: string | null;
          econt_tracking_number?: string | null;
          econt_label_url?: string | null;
          econt_label_generated_at?: string | null;
          shipped_at?: string | null;
          delivered_at?: string | null;
          estimated_delivery_date?: string | null;
          payment_method?: "card" | "cod";
          payment_status?: "pending" | "paid" | "failed" | "refunded";
          stripe_payment_intent_id?: string | null;
          items?: Json;
          subtotal?: number;
          discount_code?: string | null;
          discount_amount?: number;
          total?: number;
          currency?: string;
          status?: "new" | "processing" | "shipped" | "delivered" | "cancelled";
          notes?: string | null;
        };
        Relationships: [];
      };
      econt_offices: {
        Row: {
          id: string;
          city_id: number | null;
          city_name: string | null;
          name: string | null;
          address: string | null;
          phone: string | null;
          work_time: string | null;
          latitude: number | null;
          longitude: number | null;
          updated_at: string;
        };
        Insert: {
          id: string;
          city_id?: number | null;
          city_name?: string | null;
          name?: string | null;
          address?: string | null;
          phone?: string | null;
          work_time?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          city_id?: number | null;
          city_name?: string | null;
          name?: string | null;
          address?: string | null;
          phone?: string | null;
          work_time?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      econt_cities: {
        Row: {
          id: number;
          name: string;
          region: string | null;
          post_code: string | null;
          updated_at: string;
        };
        Insert: {
          id: number;
          name: string;
          region?: string | null;
          post_code?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          region?: string | null;
          post_code?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      customers: {
        Row: {
          email: string;
          first_name: string;
          last_name: string;
          phone: string;
          order_count: number;
          total_spent: number;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Helper types
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
export type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];
export type OrderStatus = Order["status"];
export type PaymentStatus = Order["payment_status"];
export type ShippingMethod = Order["shipping_method"];
export type PaymentMethod = Order["payment_method"];

export type EcontOffice = Database["public"]["Tables"]["econt_offices"]["Row"];
export type EcontCity = Database["public"]["Tables"]["econt_cities"]["Row"];
export type Customer = Database["public"]["Views"]["customers"]["Row"];

// Product types
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
export type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];
export type ProductStatus = Product["status"];

// Discount types
export type Discount = Database["public"]["Tables"]["discounts"]["Row"];
export type DiscountInsert = Database["public"]["Tables"]["discounts"]["Insert"];
export type DiscountUpdate = Database["public"]["Tables"]["discounts"]["Update"];
export type DiscountType = Discount["type"];
export type DiscountAppliesTo = Discount["applies_to"];

// JSON field types for products
export interface ProductVariantDB {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  quantity: number;
  is_best_seller?: boolean;
  savings?: number;
}

export interface ProductFeatureDB {
  icon: string;
  icon_color: string;
  title: string;
  description: string;
}

export interface ProductIngredientDB {
  symbol: string;
  name: string;
  dosage: string;
  description: string;
  color: string;
}

export interface ProductHowToUseDB {
  step: number;
  title: string;
  description: string;
}
