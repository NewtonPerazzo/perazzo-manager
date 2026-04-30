"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { PlanId } from "@/lib/plans";

interface AuthState {
  token: string | null;
  userName: string | null;
  userEmail: string | null;
  userPhoto: string | null;
  userPlan: PlanId;
  setToken: (token: string) => void;
  setUser: (name: string, email?: string | null, photo?: string | null, plan?: PlanId | null) => void;
  clearToken: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userName: null,
      userEmail: null,
      userPhoto: null,
      userPlan: "free",
      setToken: (token) => set({ token }),
      setUser: (userName, userEmail = null, userPhoto = null, userPlan = "free") =>
        set({ userName, userEmail, userPhoto, userPlan: userPlan ?? "free" }),
      clearToken: () => set({ token: null, userName: null, userEmail: null, userPhoto: null, userPlan: "free" })
    }),
    {
      name: "pm-auth-store",
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
