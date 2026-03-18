"use client";

import { useEffect, useState } from "react";

import { ListSkeleton } from "@/components/molecules/common/list-skeleton";
import { CatalogCategoriesCarousel } from "@/components/molecules/catalog/catalog-categories-carousel";
import { CatalogProductCard } from "@/components/molecules/catalog/catalog-product-card";
import { CatalogSearchInput } from "@/components/molecules/catalog/catalog-search-input";
import { CatalogShell } from "@/components/organisms/catalog/catalog-shell";
import { useI18n } from "@/i18n/provider";
import { catalogService } from "@/services/resources/catalog-service";
import type { CatalogProductsPageResponse } from "@/types/api/catalog";

export function CatalogProductsTemplate({
  storeSlug,
  mode,
  categorySlug,
  initialSearch
}: {
  storeSlug: string;
  mode: "products" | "category";
  categorySlug?: string;
  initialSearch: string;
}) {
  const { t } = useI18n();
  const [search, setSearch] = useState(initialSearch);
  const [data, setData] = useState<CatalogProductsPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const response =
          mode === "category" && categorySlug
            ? await catalogService.getCategory(storeSlug, categorySlug, { search })
            : await catalogService.getProducts(storeSlug, { search });

        setData(response);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("catalog.productsLoadError"));
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [categorySlug, mode, search, storeSlug, t]);

  if (loading && !data) {
    return (
      <div className="mx-auto max-w-6xl px-3 py-4">
        <ListSkeleton items={8} className="space-y-3" itemClassName="h-16 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return <p className="px-3 py-5 text-sm text-red-300">{error ?? t("catalog.productsUnavailable")}</p>;
  }

  return (
    <CatalogShell store={data.store} storeSlug={storeSlug}>
      <div className="space-y-4">
        <CatalogCategoriesCarousel
          storeSlug={storeSlug}
          categories={data.categories}
          selectedCategorySlug={data.selected_category?.slug}
          search={search}
        />

        <CatalogSearchInput value={search} onChange={setSearch} placeholder={t("catalog.searchPlaceholder")} />

        {data.selected_category ? (
          <div className="flex items-end gap-2">
            <h2 className="text-lg font-semibold text-white">{data.selected_category.name}</h2>
            <span className="text-xs text-slate-400">{data.products.length}</span>
          </div>
        ) : (
          <h2 className="text-lg font-semibold text-white">{t("catalog.productsNav")}</h2>
        )}

        {loading ? <ListSkeleton items={4} className="space-y-2" itemClassName="h-40 w-full rounded-xl" /> : null}

        {!loading && data.products.length === 0 ? (
          <p className="text-sm text-slate-300">{t("catalog.emptyProducts")}</p>
        ) : null}

        {!loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {data.products.map((product) => (
              <CatalogProductCard key={product.id} storeSlug={storeSlug} product={product} className="w-full min-w-0" />
            ))}
          </div>
        ) : null}
      </div>
    </CatalogShell>
  );
}
