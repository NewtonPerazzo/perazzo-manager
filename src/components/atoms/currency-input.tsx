"use client";

import { cn } from "@/lib/cn";

interface CurrencyInputProps {
  value?: number | null;
  onChange: (value: number) => void;
  className?: string;
  disabled?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(Number.isFinite(value) ? value : 0);
}

function parseCurrencyInput(value: string): number {
  const digits = value.replace(/\D/g, "");
  if (!digits) return 0;
  return Number(digits) / 100;
}

export function CurrencyInput({
  value = 0,
  onChange,
  className,
  disabled
}: CurrencyInputProps) {
  const numericValue = Number(value ?? 0);

  return (
    <input
      type="text"
      inputMode="numeric"
      value={formatCurrency(numericValue)}
      onChange={(event) => onChange(parseCurrencyInput(event.target.value))}
      disabled={disabled}
      className={cn(
        "w-full rounded-xl border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-400 focus:border-accent-500",
        className
      )}
    />
  );
}
