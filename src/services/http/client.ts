import axios, { AxiosError } from "axios";

import { API_BASE_URL } from "@/services/http/config";
import { fallbackHttpMessage, translateDetail, translateValidationArray } from "@/services/http/error-translator";
import { useUiFeedbackStore } from "@/store/ui-feedback-store";

interface ApiValidationItem {
  loc?: Array<string | number>;
  msg?: string;
}

interface ApiErrorData {
  detail?: string | ApiValidationItem[];
}

export class ApiRequestError extends Error {
  status?: number;
  suppressToast: boolean;

  constructor(message: string, options?: { status?: number; suppressToast?: boolean }) {
    super(message);
    this.name = "ApiRequestError";
    this.status = options?.status;
    this.suppressToast = options?.suppressToast ?? false;
  }
}

let handlingUnauthorized = false;

async function handleUnauthorizedClientSide() {
  if (typeof window === "undefined" || handlingUnauthorized) return;

  handlingUnauthorized = true;
  try {
    window.localStorage.removeItem("pm-auth-store");
    window.localStorage.removeItem("pm-catalog-cart-store");
    await fetch("/api/session", { method: "DELETE" });
  } finally {
    window.location.href = "/login";
  }
}

function notifyUpgradeRequired(message: string): boolean {
  if (typeof window === "undefined") return false;

  if (!window.location.pathname.startsWith("/dashboard")) return false;

  useUiFeedbackStore.getState().openUpgradeModal(message);
  return true;
}

export function createApiClient(token?: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const client = axios.create({
    baseURL: API_BASE_URL,
    headers
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await handleUnauthorizedClientSide();
      }
      return Promise.reject(error);
    }
  );

  return client;
}

export function normalizeApiError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorData>;
    const detail = axiosError.response?.data?.detail;
    const status = axiosError.response?.status;

    if (detail) {
      if (typeof detail === "string") {
        const message = translateDetail(detail);
        const suppressToast = status === 402 ? notifyUpgradeRequired(message) : false;
        return new ApiRequestError(message, { status, suppressToast });
      }

      if (Array.isArray(detail)) {
        const message = translateValidationArray(detail);
        const suppressToast = status === 402 ? notifyUpgradeRequired(message) : false;
        return new ApiRequestError(message, { status, suppressToast });
      }
    }

    const message = fallbackHttpMessage(status);
    const suppressToast = status === 402 ? notifyUpgradeRequired(message) : false;
    return new ApiRequestError(message, { status, suppressToast });
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error(fallbackHttpMessage());
}
