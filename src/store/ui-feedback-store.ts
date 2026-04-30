"use client";

import { create } from "zustand";

export type ToastVariant = "success" | "warning" | "error";

export interface UiToast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface UpgradeModalState {
  open: boolean;
  message?: string;
}

interface UiFeedbackState {
  loadingByKey: Record<string, boolean>;
  toasts: UiToast[];
  upgradeModal: UpgradeModalState;
  setLoading: (key: string, value: boolean) => void;
  pushToast: (toast: Omit<UiToast, "id">) => string;
  removeToast: (id: string) => void;
  openUpgradeModal: (message?: string) => void;
  closeUpgradeModal: () => void;
}

export const useUiFeedbackStore = create<UiFeedbackState>((set) => ({
  loadingByKey: {},
  toasts: [],
  upgradeModal: { open: false },
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
    })),
  openUpgradeModal: (message) =>
    set({
      upgradeModal: {
        open: true,
        message
      }
    }),
  closeUpgradeModal: () =>
    set({
      upgradeModal: {
        open: false
      }
    })
}));
