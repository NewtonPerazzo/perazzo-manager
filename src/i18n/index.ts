import { enDictionary } from "@/i18n/dictionaries/en";
import { esDictionary } from "@/i18n/dictionaries/es";
import { ptBrDictionary } from "@/i18n/dictionaries/pt-br";
import type { Dictionary, Locale } from "@/i18n/types";

export const dictionaries: Record<Locale, Dictionary> = {
  "pt-br": ptBrDictionary,
  en: enDictionary,
  es: esDictionary
};

export const defaultLocale: Locale = "pt-br";

export function normalizeLocale(input?: string | null): Locale {
  if (!input) return defaultLocale;

  const locale = input.toLowerCase();

  if (locale.startsWith("pt")) return "pt-br";
  if (locale.startsWith("es")) return "es";
  if (locale.startsWith("en")) return "en";

  return defaultLocale;
}
