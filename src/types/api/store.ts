import type { UUID } from "@/types/api/common";

export type BusinessHoursDayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface BusinessHoursDay {
  enabled: boolean;
  start_time?: string | null;
  end_time?: string | null;
}

export type StoreBusinessHours = Record<BusinessHoursDayKey, BusinessHoursDay>;

export interface StoreCreatePayload {
  name: string;
  description?: string | null;
  does_delivery?: boolean;
  does_pick_up?: boolean;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  instagram?: string | null;
  email?: string | null;
  logo?: string | null;
  color?: string | null;
  has_catalog_active?: boolean;
  is_accepted_send_order_to_whatsapp?: boolean;
  business_hours?: StoreBusinessHours | null;
}

export interface StoreUpdatePayload {
  name?: string;
  description?: string | null;
  does_delivery?: boolean;
  does_pick_up?: boolean;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  instagram?: string | null;
  email?: string | null;
  logo?: string | null;
  color?: string | null;
  has_catalog_active?: boolean;
  is_accepted_send_order_to_whatsapp?: boolean;
  business_hours?: StoreBusinessHours | null;
}

export interface StoreResponse {
  id: UUID;
  name: string;
  slug: string;
  description?: string | null;
  does_delivery: boolean;
  does_pick_up: boolean;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  instagram?: string | null;
  email?: string | null;
  logo?: string | null;
  color?: string | null;
  has_catalog_active: boolean;
  is_accepted_send_order_to_whatsapp: boolean;
  business_hours: StoreBusinessHours;
  is_open_now: boolean;
}
