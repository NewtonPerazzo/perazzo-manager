import axios, { AxiosError } from "axios";

import { API_BASE_URL } from "@/services/http/config";
import { fallbackHttpMessage, translateDetail, translateValidationArray } from "@/services/http/error-translator";

interface ApiValidationItem {
  loc?: Array<string | number>;
  msg?: string;
}

interface ApiErrorData {
  detail?: string | ApiValidationItem[];
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

    if (detail) {
      if (typeof detail === "string") {
        return new Error(translateDetail(detail));
      }

      if (Array.isArray(detail)) {
        return new Error(translateValidationArray(detail));
      }
    }

    return new Error(fallbackHttpMessage(axiosError.response?.status));
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error(fallbackHttpMessage());
}
