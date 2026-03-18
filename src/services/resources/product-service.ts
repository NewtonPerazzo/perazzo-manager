import { createApiClient, normalizeApiError } from "@/services/http/client";
import type { ProductCreatePayload, ProductResponse, ProductUpdatePayload } from "@/types/api/product";

interface ProductListParams {
  skip: number;
  limit: number;
  search?: string;
  categoryId?: string;
}

export interface ProductListResponse {
  items: ProductResponse[];
  total: number;
}

export const productService = {
  async list(token: string, params: ProductListParams): Promise<ProductListResponse> {
    try {
      const response = await createApiClient(token).get<ProductResponse[]>("/products", {
        params: {
          skip: params.skip,
          limit: params.limit,
          search: params.search || undefined,
          category_id: params.categoryId || undefined
        }
      });

      const totalHeader = response.headers["x-total-count"];
      const total = totalHeader ? Number(totalHeader) : response.data.length;

      return {
        items: response.data,
        total: Number.isFinite(total) ? total : response.data.length
      };
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async create(token: string, payload: ProductCreatePayload): Promise<ProductResponse> {
    try {
      const { data } = await createApiClient(token).post<ProductResponse>("/products", payload);
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async update(
    token: string,
    productId: string,
    payload: ProductUpdatePayload
  ): Promise<ProductResponse> {
    try {
      const { data } = await createApiClient(token).patch<ProductResponse>(
        `/products/${productId}`,
        payload
      );
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async remove(token: string, productId: string): Promise<void> {
    try {
      await createApiClient(token).delete(`/products/${productId}`);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
};
