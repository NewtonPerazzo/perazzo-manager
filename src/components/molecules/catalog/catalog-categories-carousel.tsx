"use client";

import Link from "next/link";

import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";
import type { CatalogCategoryResponse } from "@/types/api/catalog";

export function CatalogCategoriesCarousel({
  storeSlug,
  categories,
  selectedCategorySlug,
  search
}: {
  storeSlug: string;
  categories: CatalogCategoryResponse[];
  selectedCategorySlug?: string;
  search: string;
}) {
  const { t } = useI18n();
  const searchQuery = search.trim();

  return (
    <div className="-mx-1 overflow-x-auto no-scrollbar px-1 pb-1">
      <div className="flex w-max min-w-full items-center gap-2">
        <Link
          href={searchQuery ? `/catalog/${storeSlug}?search=${encodeURIComponent(searchQuery)}` : `/catalog/${storeSlug}`}
          className={cn(
            "rounded-full border px-4 py-2 text-sm transition",
            !selectedCategorySlug
              ? "border-transparent text-black"
              : "border-surface-700 bg-surface-900 text-slate-100 hover:bg-surface-800"
          )}
          style={!selectedCategorySlug ? { backgroundColor: "var(--catalog-primary)" } : undefined}
        >
          {t("catalog.homeNav")}
        </Link>

        {categories.map((category) => {
          const active = selectedCategorySlug === category.slug;
          const href = searchQuery
            ? `/catalog/${storeSlug}/category/${category.slug}?search=${encodeURIComponent(searchQuery)}`
            : `/catalog/${storeSlug}/category/${category.slug}`;

          return (
            <Link
              key={category.id}
              href={href}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition",
                active
                  ? "border-transparent text-black"
                  : "border-surface-700 bg-surface-900 text-slate-100 hover:bg-surface-800"
              )}
              style={active ? { backgroundColor: "var(--catalog-primary)" } : undefined}
            >
              {category.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
