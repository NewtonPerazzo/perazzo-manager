import type { UUID } from "@/types/api/common";

export interface CatalogStoreResponse {
  id: UUID;
  name: string;
  slug: string;
  description?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  instagram?: string | null;
  email?: string | null;
  logo?: string | null;
  color?: string | null;
  is_accepted_send_order_to_whatsapp?: boolean;
}

export interface CatalogCategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  products_count: number;
}

export interface CatalogProductResponse {
  id: UUID;
  name: string;
  slug: string;
  price: number;
  description?: string | null;
  stock?: number | null;
  image_url?: string | null;
}

export interface CatalogHomeSectionResponse {
  category: CatalogCategoryResponse;
  products: CatalogProductResponse[];
}

export interface CatalogHomeResponse {
  store: CatalogStoreResponse;
  categories: CatalogCategoryResponse[];
  sections: CatalogHomeSectionResponse[];
}

export interface CatalogProductsPageResponse {
  store: CatalogStoreResponse;
  categories: CatalogCategoryResponse[];
  selected_category?: CatalogCategoryResponse | null;
  products: CatalogProductResponse[];
}

export interface CatalogProductPageResponse {
  store: CatalogStoreResponse;
  product: CatalogProductResponse;
}

export interface CatalogProductOrderResponse {
  product: CatalogProductResponse;
  amount: number;
  price: number;
}

export interface CatalogCartResponse {
  id: UUID;
  products: CatalogProductOrderResponse[];
  customer?: {
    first_name: string;
    last_name: string;
    whatsapp: string;
    neighborhood?: string | null;
    address?: string | null;
  } | null;
  is_to_deliver?: boolean | null;
  delivery_method_id?: UUID | null;
  payment_method_id?: UUID | null;
  observation?: string | null;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface CatalogCartProductPayload {
  product_id: UUID;
  amount: number;
}

export interface CatalogCartPreviewPayload {
  is_to_deliver: boolean;
  delivery_method_id?: UUID | null;
}

export interface CatalogCheckoutPayload {
  payment_method_id: UUID;
  is_to_deliver: boolean;
  delivery_method_id?: UUID | null;
  customer: {
    first_name: string;
    last_name: string;
    whatsapp: string;
    neighborhood?: string | null;
    address?: string | null;
  };
  observation?: string | null;
}
