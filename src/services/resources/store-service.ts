import { createApiClient, normalizeApiError } from "@/services/http/client";
import type { StoreCreatePayload, StoreResponse, StoreUpdatePayload } from "@/types/api/store";

export const storeService = {
  async getMyStore(token: string): Promise<StoreResponse> {
    try {
      const { data } = await createApiClient(token).get<StoreResponse>("/store/me");
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async createStore(token: string, payload: StoreCreatePayload): Promise<StoreResponse> {
    try {
      const { data } = await createApiClient(token).post<StoreResponse>("/store", payload);
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async updateStore(token: string, payload: StoreCreatePayload): Promise<StoreResponse> {
    try {
      const { data } = await createApiClient(token).patch<StoreResponse>("/store/me", payload);
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async updateStorePartial(token: string, payload: StoreUpdatePayload): Promise<StoreResponse> {
    try {
      const { data } = await createApiClient(token).patch<StoreResponse>("/store/me", payload);
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async toggleTodayOpen(token: string, shouldOpen: boolean): Promise<StoreResponse> {
    try {
      const { data } = await createApiClient(token).patch<StoreResponse>("/store/me/today-open", {
        should_open: shouldOpen
      });
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
};
