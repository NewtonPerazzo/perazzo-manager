"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/atoms/button";
import { ImageDisplay } from "@/components/atoms/image-display";
import { ListSkeleton } from "@/components/molecules/common/list-skeleton";
import { CatalogCartQuantityControl } from "@/components/molecules/catalog/catalog-cart-quantity-control";
import { CatalogShell } from "@/components/organisms/catalog/catalog-shell";
import { useI18n } from "@/i18n/provider";
import { catalogService } from "@/services/resources/catalog-service";
import { useCatalogCartStore } from "@/store/catalog-cart-store";
import type { CatalogProductPageResponse } from "@/types/api/catalog";

function formatMoney(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

export function CatalogProductTemplate({
  storeSlug,
  productSlug
}: {
  storeSlug: string;
  productSlug: string;
}) {
  const { t } = useI18n();
  const [data, setData] = useState<CatalogProductPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const increment = useCatalogCartStore((state) => state.increment);
  const decrement = useCatalogCartStore((state) => state.decrement);
  const setQuantity = useCatalogCartStore((state) => state.setQuantity);
  const isSyncing = useCatalogCartStore((state) => state.isSyncing);

  const quantity = useCatalogCartStore((state) => {
    if (!data) return 0;
    return state.itemsByProductId[data.product.id] ?? 0;
  });

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const response = await catalogService.getProduct(storeSlug, productSlug);
        setData(response);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("catalog.productLoadError"));
      } finally {
        setLoading(false);
      }
    }

    void loadProduct();
  }, [productSlug, storeSlug, t]);

  const safeDescription = useMemo(() => data?.product.description?.trim() || "", [data?.product.description]);

  if (loading && !data) {
    return (
      <div className="mx-auto max-w-6xl px-3 py-4">
        <ListSkeleton items={8} className="space-y-3" itemClassName="h-16 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return <p className="px-3 py-5 text-sm text-red-300">{error ?? t("catalog.productUnavailable")}</p>;
  }

  return (
    <CatalogShell store={data.store} storeSlug={storeSlug}>
      <article className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl border border-surface-700 bg-surface-900">
          {quantity > 0 ? (
            <span
              className="absolute right-3 top-3 z-10 rounded-full px-2 py-1 text-xs font-bold text-black"
              style={{ backgroundColor: "var(--catalog-primary)" }}
            >
              {quantity}
            </span>
          ) : null}

          <div className="h-72 w-full bg-surface-800 sm:h-[360px]">
            <ImageDisplay
              src={data.product.image_url}
              alt={data.product.name}
              width={1024}
              height={720}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-surface-700 bg-surface-900/70 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-white">{data.product.name}</h1>
              {safeDescription ? <p className="mt-1 text-sm text-slate-300">{safeDescription}</p> : null}
            </div>
            <p className="shrink-0 text-base font-semibold" style={{ color: "var(--catalog-primary-soft)" }}>
              {formatMoney(data.product.price)}
            </p>
          </div>

          <div className="flex w-full justify-end">
            {quantity > 0 ? (
              <CatalogCartQuantityControl
                quantity={quantity}
                onIncrease={() => void increment(data.product)}
                onDecrease={() => void decrement(data.product)}
                onInputQuantity={(value) => {
                  void setQuantity(data.product, value);
                }}
              />
            ) : (
              <Button
                type="button"
                className="w-full"
                onClick={() => void increment(data.product)}
                disabled={isSyncing}
                style={{ backgroundColor: "var(--catalog-primary)", color: "#04110c" }}
              >
                {t("catalog.addToCart")}
              </Button>
            )}
          </div>
        </div>
      </article>
    </CatalogShell>
  );
}
