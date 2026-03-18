import { createApiClient, normalizeApiError } from "@/services/http/client";
import type {
  CustomerCreatePayload,
  CustomerResponse,
  CustomerUpdatePayload
} from "@/types/api/customer";

interface CustomerListParams {
  skip: number;
  limit: number;
  search?: string;
}

export interface CustomerListResponse {
  items: CustomerResponse[];
  total: number;
}

export const customerService = {
  async list(token: string, params: CustomerListParams): Promise<CustomerListResponse> {
    try {
      const response = await createApiClient(token).get<CustomerResponse[]>("/customers", {
        params: {
          skip: params.skip,
          limit: params.limit,
          search: params.search || undefined
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

  async create(token: string, payload: CustomerCreatePayload): Promise<CustomerResponse> {
    try {
      const { data } = await createApiClient(token).post<CustomerResponse>("/customers", payload);
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async update(
    token: string,
    customerId: string,
    payload: CustomerUpdatePayload
  ): Promise<CustomerResponse> {
    try {
      const { data } = await createApiClient(token).patch<CustomerResponse>(
        `/customers/${customerId}`,
        payload
      );
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async remove(token: string, customerId: string): Promise<void> {
    try {
      await createApiClient(token).delete(`/customers/${customerId}`);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
};
