"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  userName: string | null;
  userEmail: string | null;
  setToken: (token: string) => void;
  setUser: (name: string, email?: string | null) => void;
  clearToken: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userName: null,
      userEmail: null,
      setToken: (token) => set({ token }),
      setUser: (userName, userEmail = null) => set({ userName, userEmail }),
      clearToken: () => set({ token: null, userName: null, userEmail: null })
    }),
    {
      name: "pm-auth-store"
    }
  )
);
