import type { UUID } from "@/types/api/common";
import type { CategoryResponse } from "@/types/api/category";

export interface ProductCreatePayload {
  name: string;
  price: number;
  description?: string | null;
  stock?: number | null;
  image_url?: string | null;
  category_ids?: UUID[];
  is_active?: boolean;
}

export interface ProductUpdatePayload {
  name?: string;
  price?: number;
  description?: string | null;
  stock?: number | null;
  image_url?: string | null;
  category_ids?: UUID[];
  is_active?: boolean;
}

export interface ProductResponse {
  id: UUID;
  slug: string;
  name: string;
  price: number;
  description?: string | null;
  stock?: number | null;
  image_url?: string | null;
  categories: CategoryResponse[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
