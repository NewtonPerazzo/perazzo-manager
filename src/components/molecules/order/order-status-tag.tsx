"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/provider";
import type { OrderStatus } from "@/types/api/order";

const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "confirmed",
  "canceled",
  "preparing",
  "in_transit",
  "deliveried"
];

function getStatusClasses(status: OrderStatus): string {
  if (status === "pending") return "border-black bg-white text-black";
  if (status === "confirmed") return "border-emerald-600 bg-emerald-100 text-emerald-800";
  if (status === "canceled") return "border-red-600 bg-red-100 text-red-800";
  if (status === "preparing") return "border-amber-600 bg-amber-100 text-amber-800";
  if (status === "in_transit") return "border-cyan-600 bg-cyan-100 text-cyan-800";
  return "border-purple-600 bg-purple-100 text-purple-800";
}

export function OrderStatusTag({
  status,
  disabled = false,
  onChange
}: {
  status: OrderStatus;
  disabled?: boolean;
  onChange: (status: OrderStatus) => Promise<void> | void;
}) {
  const { t } = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (isEditing && !disabled) {
    return (
      <div className="relative w-[112px] shrink-0 font-[inherit]">
        <button
          type="button"
          onBlur={() => window.setTimeout(() => setIsEditing(false), 120)}
          className={cn(
            "flex h-6 w-full items-center justify-between gap-1 rounded-full border px-2 text-left text-[10px] font-semibold leading-none outline-none focus:border-accent-500 focus:shadow-[0_0_0_2px_rgba(70,149,54,0.3)]",
            getStatusClasses(status)
          )}
          autoFocus
        >
          <span className="truncate">{t(`orders.status.${status}`)}</span>
          <ChevronDown className="h-3 w-3 shrink-0" aria-hidden="true" />
        </button>
        <div className="absolute left-0 z-[80] mt-1 w-36 overflow-hidden rounded-lg border border-surface-700 bg-surface-900 py-1 shadow-panel">
          {ORDER_STATUS_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              disabled={isSaving}
              onMouseDown={(event) => event.preventDefault()}
              onClick={async () => {
                if (isSaving) return;
                setIsSaving(true);
                try {
                  await onChange(option);
                  setIsEditing(false);
                } finally {
                  setIsSaving(false);
                }
              }}
              className="flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left font-[inherit] text-[11px] font-medium leading-none text-slate-100 hover:bg-surface-800 disabled:opacity-60"
            >
              <span>{t(`orders.status.${option}`)}</span>
              {option === status ? <Check className="h-3.5 w-3.5 shrink-0 text-accent-300" aria-hidden="true" /> : null}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setIsEditing(true)}
      className={cn(
        "h-6 w-[96px] max-w-[96px] shrink-0 rounded-full border px-2 text-center text-[10px] font-semibold",
        getStatusClasses(status),
        disabled ? "opacity-60" : ""
      )}
    >
      {t(`orders.status.${status}`)}
    </button>
  );
}
