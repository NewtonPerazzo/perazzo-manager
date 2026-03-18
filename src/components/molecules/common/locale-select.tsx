"use client";

import { useI18n } from "@/i18n/provider";

export function LocaleSelect({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  return (
    <select
      value={locale}
      onChange={(event) => setLocale(event.target.value as typeof locale)}
      className={className ?? "rounded-xl border border-surface-700 bg-surface-900 px-2 py-2 text-sm text-white"}
      aria-label="locale-select"
    >
      <option value="pt-br">PT-BR</option>
      <option value="en">EN</option>
      <option value="es">ES</option>
    </select>
  );
}

