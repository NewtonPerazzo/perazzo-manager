import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-400 focus:border-accent-500",
        className
      )}
      {...props}
    />
  );
}
