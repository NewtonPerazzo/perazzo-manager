"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";

export function CatalogBackToTop() {
  const { t } = useI18n();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsVisible(window.scrollY > 420);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed bottom-20 right-4 z-50 grid h-11 w-11 place-items-center rounded-full border border-surface-700 bg-surface-900 text-white shadow-panel transition duration-200 hover:bg-surface-800",
        isVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      )}
      aria-label={t("catalog.backToTop")}
    >
      <ArrowUp size={18} />
    </button>
  );
}
