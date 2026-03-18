"use client";

import { useEffect } from "react";

import { useUiFeedbackStore } from "@/store/ui-feedback-store";

const TOAST_DURATION_MS = 3200;

export function ToastViewport() {
  const toasts = useUiFeedbackStore((state) => state.toasts);
  const removeToast = useUiFeedbackStore((state) => state.removeToast);

  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        removeToast(toast.id);
      }, TOAST_DURATION_MS)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [removeToast, toasts]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 bottom-4 z-[70] flex max-w-[min(92vw,360px)] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={[
            "rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur",
            toast.variant === "success" && "border-emerald-500/45 bg-emerald-950/90 text-emerald-100",
            toast.variant === "warning" && "border-amber-500/45 bg-amber-950/90 text-amber-100",
            toast.variant === "error" && "border-red-500/45 bg-red-950/90 text-red-100"
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
