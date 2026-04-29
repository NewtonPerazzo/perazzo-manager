"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  userName: string | null;
  userEmail: string | null;
  userPhoto: string | null;
  setToken: (token: string) => void;
  setUser: (name: string, email?: string | null, photo?: string | null) => void;
  clearToken: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userName: null,
      userEmail: null,
      userPhoto: null,
      setToken: (token) => set({ token }),
      setUser: (userName, userEmail = null, userPhoto = null) => set({ userName, userEmail, userPhoto }),
      clearToken: () => set({ token: null, userName: null, userEmail: null, userPhoto: null })
    }),
    {
      name: "pm-auth-store",
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
