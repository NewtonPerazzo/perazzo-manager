import type { UUID } from "@/types/api/common";

export interface DeliveryMethodCreatePayload {
  name: string;
  price: number;
  description?: string | null;
}

export interface DeliveryMethodUpdatePayload {
  name: string;
  price: number;
  description?: string | null;
}

export interface DeliveryMethodResponse {
  id: UUID;
  name: string;
  price: number;
  description?: string | null;
  created_at: string;
  updated_at: string;
}
