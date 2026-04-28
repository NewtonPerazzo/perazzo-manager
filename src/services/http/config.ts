const DEFAULT_API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://perazzo-api.onrender.com/api/v1"
    : "http://localhost:8001/api/v1";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_PERAZZO_API_URL ?? DEFAULT_API_BASE_URL;
