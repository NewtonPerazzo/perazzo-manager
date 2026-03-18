import { createApiClient, normalizeApiError } from "@/services/http/client";
import type {
  PaymentMethodCreatePayload,
  PaymentMethodResponse,
  PaymentMethodUpdatePayload
} from "@/types/api/payment-method";

export const paymentMethodService = {
  async list(token: string): Promise<PaymentMethodResponse[]> {
    try {
      const { data } = await createApiClient(token).get<PaymentMethodResponse[]>("/payment-methods", {
        params: { skip: 0, limit: 20 }
      });
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async create(
    token: string,
    payload: PaymentMethodCreatePayload
  ): Promise<PaymentMethodResponse> {
    try {
      const { data } = await createApiClient(token).post<PaymentMethodResponse>(
        "/payment-methods",
        payload
      );
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async update(
    token: string,
    paymentMethodId: string,
    payload: PaymentMethodUpdatePayload
  ): Promise<PaymentMethodResponse> {
    try {
      const { data } = await createApiClient(token).patch<PaymentMethodResponse>(
        `/payment-methods/${paymentMethodId}`,
        payload
      );
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async remove(token: string, paymentMethodId: string): Promise<void> {
    try {
      await createApiClient(token).delete(`/payment-methods/${paymentMethodId}`);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
};
