"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";
import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  hideLabel?: string;
  showLabel?: string;
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ className, hideLabel = "Hide password", showLabel = "Show password", ...props }, ref) {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <div className="relative">
        <input
          ref={ref}
          type={isVisible ? "text" : "password"}
          className={cn(
            "w-full rounded-xl border border-surface-700 bg-surface-900 px-3 py-2 pr-11 text-base text-white outline-none placeholder:text-slate-400 focus:border-accent-500 md:text-sm",
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setIsVisible((prev) => !prev)}
          className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
          aria-label={isVisible ? hideLabel : showLabel}
        >
          {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    );
  }
);
