import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function Card({
  className,
  children
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl2 border border-surface-700 bg-surface-900/80 p-4 shadow-panel backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
