"use client";

import { Input } from "@/components/atoms/input";

export function CatalogSearchInput({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <Input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="focus:ring-2 focus:ring-offset-0"
      style={{
        borderColor: "var(--catalog-primary-dark)",
        boxShadow: "none"
      }}
      onFocus={(event) => {
        event.currentTarget.style.borderColor = "var(--catalog-primary)";
        event.currentTarget.style.boxShadow = "0 0 0 2px color-mix(in srgb, var(--catalog-primary) 30%, transparent)";
      }}
      onBlur={(event) => {
        event.currentTarget.style.borderColor = "var(--catalog-primary-dark)";
        event.currentTarget.style.boxShadow = "none";
      }}
    />
  );
}
