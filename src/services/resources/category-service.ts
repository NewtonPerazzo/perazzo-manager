import { createApiClient, normalizeApiError } from "@/services/http/client";
import type {
  CategoryCreatePayload,
  CategoryResponse,
  CategoryUpdatePayload
} from "@/types/api/category";

export const categoryService = {
  async list(token: string): Promise<CategoryResponse[]> {
    try {
      const { data } = await createApiClient(token).get<CategoryResponse[]>("/categories", {
        params: { skip: 0, limit: 200 }
      });
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async create(token: string, payload: CategoryCreatePayload): Promise<CategoryResponse> {
    try {
      const { data } = await createApiClient(token).post<CategoryResponse>("/categories", payload);
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async update(
    token: string,
    categoryId: string,
    payload: CategoryUpdatePayload
  ): Promise<CategoryResponse> {
    try {
      const { data } = await createApiClient(token).patch<CategoryResponse>(
        `/categories/${categoryId}`,
        payload
      );
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async remove(token: string, categoryId: string): Promise<void> {
    try {
      await createApiClient(token).delete(`/categories/${categoryId}`);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async reorder(token: string, categoryIds: string[]): Promise<CategoryResponse[]> {
    try {
      const { data } = await createApiClient(token).post<CategoryResponse[]>("/categories/reorder", {
        category_ids: categoryIds
      });
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
};
