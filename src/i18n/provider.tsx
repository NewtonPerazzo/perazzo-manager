"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { defaultLocale, dictionaries, normalizeLocale } from "@/i18n";
import type { Locale } from "@/i18n/types";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("pm-locale");
    const nextLocale = normalizeLocale(savedLocale || window.navigator.language);
    setLocale(nextLocale);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("pm-locale", locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => {
    const dictionary = dictionaries[locale] ?? dictionaries[defaultLocale];

    return {
      locale,
      setLocale,
      t: (key: string) => dictionary[key] ?? key
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
}
