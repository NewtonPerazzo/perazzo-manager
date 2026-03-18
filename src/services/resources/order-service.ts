import { createApiClient, normalizeApiError } from "@/services/http/client";
import type {
  OrderCreatePayload,
  OrderResponse,
  OrderStatus,
  OrderStatusUpdatePayload,
  OrderTotalPreviewPayload,
  OrderTotalPreviewResponse
} from "@/types/api/order";

interface OrderListParams {
  skip: number;
  limit: number;
  search?: string;
  orderDate?: string;
}

export interface OrderListResponse {
  items: OrderResponse[];
  total: number;
}

export const orderService = {
  async list(token: string, params: OrderListParams): Promise<OrderListResponse> {
    try {
      const endpoint = params.search ? "/orders/search" : "/orders";
      const response = await createApiClient(token).get<OrderResponse[]>(endpoint, {
        params: {
          skip: params.skip,
          limit: params.limit,
          ...(params.orderDate ? { order_date: params.orderDate } : {}),
          ...(params.search ? { q: params.search } : {})
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

  async create(token: string, payload: OrderCreatePayload): Promise<OrderResponse> {
    try {
      const { data } = await createApiClient(token).post<OrderResponse>("/orders", payload);
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async update(token: string, orderId: string, payload: OrderCreatePayload): Promise<OrderResponse> {
    try {
      const { data } = await createApiClient(token).patch<OrderResponse>(`/orders/${orderId}`, payload);
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async remove(token: string, orderId: string): Promise<void> {
    try {
      await createApiClient(token).delete(`/orders/${orderId}`);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async updateStatus(token: string, orderId: string, status: OrderStatus): Promise<OrderResponse> {
    try {
      const payload: OrderStatusUpdatePayload = { status };
      const { data } = await createApiClient(token).put<OrderResponse>(
        `/orders/${orderId}/status`,
        payload
      );
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async previewTotal(token: string, payload: OrderTotalPreviewPayload): Promise<number> {
    try {
      const { data } = await createApiClient(token).post<OrderTotalPreviewResponse>(
        "/orders/preview-total",
        payload
      );
      return data.total_price;
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
};
