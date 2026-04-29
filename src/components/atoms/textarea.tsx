import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-20 w-full rounded-xl border border-surface-700 bg-surface-900 px-3 py-2 text-base text-white outline-none placeholder:text-slate-400 focus:border-accent-500 md:text-sm"
      )}
      {...props}
    />
  );
}
