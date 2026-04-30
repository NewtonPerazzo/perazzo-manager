"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { useI18n } from "@/i18n/provider";
import type { Locale } from "@/i18n/types";
import { cn } from "@/lib/cn";

const LOCALE_OPTIONS: Array<{ value: Locale; label: string }> = [
  { value: "pt-br", label: "PT-BR" },
  { value: "en", label: "EN" },
  { value: "es", label: "ES" }
];

export function LocaleSelect({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const currentOption = LOCALE_OPTIONS.find((option) => option.value === locale) ?? LOCALE_OPTIONS[0];

  return (
    <div
      className={cn(
        "relative inline-block font-[inherit]",
        className?.includes("hidden") ? "hidden md:block" : "",
        className?.includes("shrink-0") ? "shrink-0" : ""
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        className={cn(
          "inline-flex h-8 min-w-[74px] items-center justify-between gap-1 rounded-xl border border-surface-700 bg-surface-900 px-2 text-xs font-semibold leading-none text-white outline-none transition hover:bg-surface-800 focus:border-accent-500 focus:shadow-[0_0_0_2px_rgba(70,149,54,0.3)]"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("common.locale")}
      >
        <span>{currentOption.label}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute right-0 z-[90] mt-1 w-24 overflow-hidden rounded-lg border border-surface-700 bg-surface-900 py-1 shadow-panel"
        >
          {LOCALE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === locale}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setLocale(option.value);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left font-[inherit] text-xs font-medium leading-none text-slate-100 hover:bg-surface-800"
            >
              <span>{option.label}</span>
              {option.value === locale ? <Check className="h-3.5 w-3.5 text-accent-300" aria-hidden="true" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

