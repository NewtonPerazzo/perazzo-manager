import type { UUID } from "@/types/api/common";

export interface CategoryCreatePayload {
  name: string;
  description?: string | null;
}

export interface CategoryUpdatePayload {
  name?: string;
  description?: string | null;
}

export interface CategoryResponse {
  id: UUID;
  name: string;
  slug: string;
  description?: string | null;
}
