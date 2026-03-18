"use client";

import { create } from "zustand";

export type ToastVariant = "success" | "warning" | "error";

export interface UiToast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface UiFeedbackState {
  loadingByKey: Record<string, boolean>;
  toasts: UiToast[];
  setLoading: (key: string, value: boolean) => void;
  pushToast: (toast: Omit<UiToast, "id">) => string;
  removeToast: (id: string) => void;
}

export const useUiFeedbackStore = create<UiFeedbackState>((set) => ({
  loadingByKey: {},
  toasts: [],
  setLoading: (key, value) =>
    set((state) => ({
      loadingByKey: {
        ...state.loadingByKey,
        [key]: value
      }
    })),
  pushToast: (toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }]
    }));
    return id;
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    }))
}));
