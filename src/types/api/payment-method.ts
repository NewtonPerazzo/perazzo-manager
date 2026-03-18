import type { UUID } from "@/types/api/common";

export interface PaymentMethodCreatePayload {
  name: string;
}

export interface PaymentMethodUpdatePayload {
  name: string;
}

export interface PaymentMethodResponse {
  id: UUID;
  name: string;
  created_at: string;
  updated_at: string;
}
