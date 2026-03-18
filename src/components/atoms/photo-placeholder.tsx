import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/cn";

export function PhotoPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg border border-surface-700 bg-surface-800 text-slate-400",
        className
      )}
    >
      <ImageIcon size={18} />
    </div>
  );
}
