import { cookies } from "next/headers";

export const ACCESS_TOKEN_COOKIE = "pm_access_token";

export async function getServerAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}
