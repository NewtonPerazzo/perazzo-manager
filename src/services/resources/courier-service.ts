import { createApiClient, normalizeApiError } from "@/services/http/client";
import type {
  CourierAdjustmentPayload,
  CourierAdjustmentResponse,
  CourierPayload,
  CourierPeriodView,
  CourierResponse,
  CourierSummaryResponse
} from "@/types/api/courier";

interface CourierListParams {
  skip: number;
  limit: number;
  search?: string;
}

export interface CourierListResponse {
  items: CourierResponse[];
  total: number;
}

export const courierService = {
  async list(token: string, params: CourierListParams): Promise<CourierListResponse> {
    try {
      const response = await createApiClient(token).get<CourierResponse[]>("/couriers", {
        params: {
          skip: params.skip,
          limit: params.limit,
          ...(params.search ? { search: params.search } : {})
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

  async create(token: string, payload: CourierPayload): Promise<CourierResponse> {
    try {
      const { data } = await createApiClient(token).post<CourierResponse>("/couriers", payload);
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async update(token: string, courierId: string, payload: CourierPayload): Promise<CourierResponse> {
    try {
      const { data } = await createApiClient(token).patch<CourierResponse>(`/couriers/${courierId}`, payload);
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async remove(token: string, courierId: string): Promise<void> {
    try {
      await createApiClient(token).delete(`/couriers/${courierId}`);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async summary(
    token: string,
    targetDate: string,
    periodView: CourierPeriodView
  ): Promise<CourierSummaryResponse> {
    try {
      const { data } = await createApiClient(token).get<CourierSummaryResponse>("/couriers/summary", {
        params: {
          target_date: targetDate,
          period_view: periodView
        }
      });
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async addAdjustment(
    token: string,
    payload: CourierAdjustmentPayload
  ): Promise<CourierAdjustmentResponse> {
    try {
      const { data } = await createApiClient(token).post<CourierAdjustmentResponse>(
        "/couriers/adjustments",
        payload
      );
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async updateAdjustment(
    token: string,
    adjustmentId: string,
    payload: CourierAdjustmentPayload
  ): Promise<CourierAdjustmentResponse> {
    try {
      const { data } = await createApiClient(token).patch<CourierAdjustmentResponse>(
        `/couriers/adjustments/${adjustmentId}`,
        payload
      );
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async deleteAdjustment(token: string, adjustmentId: string): Promise<void> {
    try {
      await createApiClient(token).delete(`/couriers/adjustments/${adjustmentId}`);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
};

