"use client";

import type { ButtonHTMLAttributes } from "react";
import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

export function Button({ variant = "primary", className, disabled, isLoading = false, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
        variant === "primary" &&
          "bg-accent-500 text-surface-950 hover:bg-accent-400 active:scale-[0.99]",
        variant === "ghost" &&
          "border border-surface-700 bg-surface-900 text-white hover:bg-surface-800",
        variant === "danger" &&
          "border border-red-500/70 bg-red-500/20 text-white hover:bg-red-500/35",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
