"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";

export function CatalogCartQuantityControl({
  quantity,
  onIncrease,
  onDecrease,
  onInputQuantity,
  hideInput = false,
  disabled = false
}: {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onInputQuantity: (value: number) => void;
  hideInput?: boolean;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState(quantity > 0 ? String(quantity) : "");
  const lastSentRef = useRef<number>(quantity);

  useEffect(() => {
    setDraft(quantity > 0 ? String(quantity) : "");
    lastSentRef.current = quantity;
  }, [quantity]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const parsed = Number.parseInt(draft || "0", 10);
      const nextValue = Number.isFinite(parsed) ? parsed : 0;
      if (nextValue === quantity || nextValue === lastSentRef.current) {
        return;
      }
      lastSentRef.current = nextValue;
      onInputQuantity(nextValue);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [draft, onInputQuantity, quantity]);

  return (
    <div className="flex items-center gap-2 rounded-xl border border-surface-700 bg-surface-900/95 p-2">
      <Button type="button" variant="ghost" className="h-8 w-8 p-0" onClick={onDecrease} disabled={disabled}>
        -
      </Button>
      {hideInput ? <span className="min-w-5 text-center text-sm font-semibold text-slate-100">{quantity}</span> : (
        <Input
          inputMode="numeric"
          pattern="[0-9]*"
          className="h-8 w-14 px-2 text-center"
          style={{ borderColor: "var(--catalog-primary-dark)" }}
          onFocus={(event) => {
            event.currentTarget.style.borderColor = "var(--catalog-primary)";
            event.currentTarget.style.boxShadow =
              "0 0 0 2px color-mix(in srgb, var(--catalog-primary) 30%, transparent)";
          }}
          onBlur={(event) => {
            event.currentTarget.style.borderColor = "var(--catalog-primary-dark)";
            event.currentTarget.style.boxShadow = "none";
          }}
          value={draft}
          onChange={(event) => {
            const value = event.target.value.replace(/\D/g, "");
            setDraft(value);
          }}
          disabled={disabled}
        />
      )}
      <Button type="button" variant="ghost" className="h-8 w-8 p-0" onClick={onIncrease} disabled={disabled}>
        +
      </Button>
    </div>
  );
}
