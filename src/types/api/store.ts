import type { UUID } from "@/types/api/common";

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
}
