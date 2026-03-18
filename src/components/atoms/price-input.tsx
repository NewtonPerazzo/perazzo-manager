"use client";

import { CurrencyInput } from "@/components/atoms/currency-input";

interface PriceInputProps {
  value?: number | null;
  onChange: (value: number) => void;
  className?: string;
  disabled?: boolean;
}

export function PriceInput(props: PriceInputProps) {
  return <CurrencyInput {...props} />;
}
