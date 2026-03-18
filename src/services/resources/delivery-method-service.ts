import { createApiClient, normalizeApiError } from "@/services/http/client";
import type {
  DeliveryMethodCreatePayload,
  DeliveryMethodResponse,
  DeliveryMethodUpdatePayload
} from "@/types/api/delivery-method";

interface DeliveryMethodListParams {
  skip: number;
  limit: number;
  search?: string;
}

export interface DeliveryMethodListResponse {
  items: DeliveryMethodResponse[];
  total: number;
}

export const deliveryMethodService = {
  async list(token: string, params: DeliveryMethodListParams): Promise<DeliveryMethodListResponse> {
    try {
      const response = await createApiClient(token).get<DeliveryMethodResponse[]>("/delivery-methods", {
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

  async create(token: string, payload: DeliveryMethodCreatePayload): Promise<DeliveryMethodResponse> {
    try {
      const { data } = await createApiClient(token).post<DeliveryMethodResponse>("/delivery-methods", payload);
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async update(
    token: string,
    deliveryMethodId: string,
    payload: DeliveryMethodUpdatePayload
  ): Promise<DeliveryMethodResponse> {
    try {
      const { data } = await createApiClient(token).patch<DeliveryMethodResponse>(
        `/delivery-methods/${deliveryMethodId}`,
        payload
      );
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async remove(token: string, deliveryMethodId: string): Promise<void> {
    try {
      await createApiClient(token).delete(`/delivery-methods/${deliveryMethodId}`);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
};
