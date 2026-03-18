"use client";

import { useEffect, useState } from "react";

import { CatalogSearchInput } from "@/components/molecules/catalog/catalog-search-input";
import { ListSkeleton } from "@/components/molecules/common/list-skeleton";
import { CatalogCategoriesCarousel } from "@/components/molecules/catalog/catalog-categories-carousel";
import { CatalogCategoryProductsSection } from "@/components/molecules/catalog/catalog-category-products-section";
import { CatalogShell } from "@/components/organisms/catalog/catalog-shell";
import { useI18n } from "@/i18n/provider";
import { catalogService } from "@/services/resources/catalog-service";
import type { CatalogHomeResponse } from "@/types/api/catalog";

export function CatalogHomeTemplate({
  storeSlug,
  initialSearch
}: {
  storeSlug: string;
  initialSearch: string;
}) {
  const { t } = useI18n();
  const [search, setSearch] = useState(initialSearch);
  const [data, setData] = useState<CatalogHomeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await catalogService.getHome(storeSlug, { search });
        setData(response);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("catalog.loadError"));
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, storeSlug, t]);

  if (loading && !data) {
    return (
      <div className="mx-auto max-w-6xl px-3 py-4">
        <ListSkeleton items={8} className="space-y-3" itemClassName="h-16 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return <p className="px-3 py-5 text-sm text-red-300">{error ?? t("catalog.unavailable")}</p>;
  }

  return (
    <CatalogShell store={data.store} storeSlug={storeSlug}>
      <div className="space-y-4">
        <CatalogCategoriesCarousel storeSlug={storeSlug} categories={data.categories} search={search} />

        <CatalogSearchInput value={search} onChange={setSearch} placeholder={t("catalog.searchPlaceholder")} />

        <div className="space-y-6">
          {data.sections.map((section) => (
            <CatalogCategoryProductsSection key={section.category.id} storeSlug={storeSlug} section={section} />
          ))}
        </div>
      </div>
    </CatalogShell>
  );
}
