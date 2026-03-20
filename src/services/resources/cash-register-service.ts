import { createApiClient, normalizeApiError } from "@/services/http/client";
import type {
  CashPeriodView,
  CashRegisterEntryPayload,
  CashRegisterEntryResponse,
  CashRegisterEntryUpdatePayload,
  CashRegisterSummaryResponse
} from "@/types/api/cash-register";

export const cashRegisterService = {
  async getSummary(
    token: string,
    targetDate: string,
    periodView: CashPeriodView
  ): Promise<CashRegisterSummaryResponse> {
    try {
      const { data } = await createApiClient(token).get<CashRegisterSummaryResponse>("/cash-register/summary", {
        params: { target_date: targetDate, period_view: periodView }
      });
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async createEntry(token: string, payload: CashRegisterEntryPayload): Promise<CashRegisterEntryResponse> {
    try {
      const { data } = await createApiClient(token).post<CashRegisterEntryResponse>("/cash-register/entries", payload);
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async updateEntry(
    token: string,
    entryId: string,
    payload: CashRegisterEntryUpdatePayload
  ): Promise<CashRegisterEntryResponse> {
    try {
      const { data } = await createApiClient(token).patch<CashRegisterEntryResponse>(
        `/cash-register/entries/${entryId}`,
        payload
      );
      return data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async deleteEntry(token: string, entryId: string): Promise<void> {
    try {
      await createApiClient(token).delete(`/cash-register/entries/${entryId}`);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
};
