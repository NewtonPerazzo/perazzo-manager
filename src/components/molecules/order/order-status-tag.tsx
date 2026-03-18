"use client";

import { useState } from "react";

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

  if (isEditing && !disabled) {
    return (
      <select
        value={status}
        onChange={async (event) => {
          const nextStatus = event.target.value as OrderStatus;
          await onChange(nextStatus);
          setIsEditing(false);
        }}
        onBlur={() => setIsEditing(false)}
        autoFocus
        className="h-6 w-[96px] max-w-[96px] shrink-0 rounded-md border border-surface-700 bg-surface-900 px-1 text-[10px] text-white outline-none focus:border-accent-500"
      >
        {ORDER_STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {t(`orders.status.${option}`)}
          </option>
        ))}
      </select>
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
