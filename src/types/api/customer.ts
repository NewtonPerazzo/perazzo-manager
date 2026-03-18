import type { UUID } from "@/types/api/common";

export interface CustomerCreatePayload {
  name: string;
  phone: string;
  address?: string | null;
  neighborhood?: string | null;
  email?: string | null;
}

export interface CustomerUpdatePayload {
  name?: string;
  phone?: string;
  address?: string | null;
  neighborhood?: string | null;
  email?: string | null;
}

export interface CustomerResponse {
  id: UUID;
  name: string;
  phone: string;
  address?: string | null;
  neighborhood?: string | null;
  email?: string | null;
  created_at: string;
}
