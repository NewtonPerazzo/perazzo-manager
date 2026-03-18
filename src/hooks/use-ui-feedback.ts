"use client";

import { useCallback } from "react";

import { useUiFeedbackStore, type ToastVariant } from "@/store/ui-feedback-store";

interface RunWithFeedbackOptions {
  successMessage?: string;
  errorMessage?: string;
  errorVariant?: ToastVariant;
  mapErrorMessage?: (error: unknown) => string;
  mapErrorVariant?: (error: unknown) => ToastVariant;
}

interface ActionResult<T> {
  ok: boolean;
  data?: T;
}

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unexpected error";
}

export function useUiFeedback() {
  const setLoading = useUiFeedbackStore((state) => state.setLoading);
  const pushToast = useUiFeedbackStore((state) => state.pushToast);

  const toast = useCallback(
    (message: string, variant: ToastVariant) => {
      if (!message) return;
      pushToast({ message, variant });
    },
    [pushToast]
  );

  const runWithFeedback = useCallback(
    async <T>(
      key: string,
      action: () => Promise<T>,
      options?: RunWithFeedbackOptions
    ): Promise<ActionResult<T>> => {
      setLoading(key, true);
      try {
        const result = await action();
        if (options?.successMessage) {
          toast(options.successMessage, "success");
        }
        return { ok: true, data: result };
      } catch (error) {
        const errorMessage = options?.mapErrorMessage?.(error) ?? options?.errorMessage ?? normalizeErrorMessage(error);
        const errorVariant = options?.mapErrorVariant?.(error) ?? options?.errorVariant ?? "error";
        toast(errorMessage, errorVariant);
        return { ok: false };
      } finally {
        setLoading(key, false);
      }
    },
    [setLoading, toast]
  );

  return {
    toast,
    runWithFeedback
  };
}
