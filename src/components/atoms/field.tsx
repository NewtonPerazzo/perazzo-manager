import type { ReactNode } from "react";

export function Field({
  label,
  children,
  required
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
        {label}
        {required ? <span className="ml-1 text-red-400">*</span> : null}
      </span>
      {children}
    </label>
  );
}
