import axios, { AxiosError } from "axios";

import { API_BASE_URL } from "@/services/http/config";

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
        return new Error(detail);
      }

      if (Array.isArray(detail)) {
        const message = detail
          .map((item) => {
            const field =
              item.loc && item.loc.length > 1 ? String(item.loc[item.loc.length - 1]) : "field";
            return `${field}: ${item.msg ?? "Invalid value"}`;
          })
          .join("\n");

        return new Error(message || "Validation error");
      }
    }

    if (axiosError.response?.status) {
      return new Error(`HTTP ${axiosError.response.status}`);
    }

    return new Error(axiosError.message);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error("Unknown API error");
}
