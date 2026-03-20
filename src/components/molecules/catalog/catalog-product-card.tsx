"use client";

import { useMemo } from "react";
import Link from "next/link";

import { Button } from "@/components/atoms/button";
import { ImageDisplay } from "@/components/atoms/image-display";
import { CatalogCartQuantityControl } from "@/components/molecules/catalog/catalog-cart-quantity-control";
import { useI18n } from "@/i18n/provider";
import { useCatalogCartStore } from "@/store/catalog-cart-store";
import type { CatalogProductResponse } from "@/types/api/catalog";

function formatMoney(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

export function CatalogProductCard({
  storeSlug,
  product,
  className,
  isStoreOpen = true
}: {
  storeSlug: string;
  product: CatalogProductResponse;
  className?: string;
  isStoreOpen?: boolean;
}) {
  const { t } = useI18n();
  const quantity = useCatalogCartStore((state) => state.itemsByProductId[product.id] ?? 0);
  const increment = useCatalogCartStore((state) => state.increment);
  const decrement = useCatalogCartStore((state) => state.decrement);
  const setQuantity = useCatalogCartStore((state) => state.setQuantity);
  const isSyncing = useCatalogCartStore((state) => state.isSyncing);

  const safeDescription = useMemo(() => product.description?.trim() || "", [product.description]);
  const hasDescription = safeDescription.length > 0;

  return (
    <article
      className={`relative flex h-[270px] w-[150px] shrink-0 flex-col gap-2 rounded-2xl border border-surface-700 bg-surface-900/80 p-3 ${className ?? ""}`}
    >
      {quantity > 0 ? (
        <span
          className="absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-bold text-black"
          style={{ backgroundColor: "var(--catalog-primary)" }}
        >
          {quantity}
        </span>
      ) : null}

      <Link
        href={`/catalog/${storeSlug}/product/${product.slug}`}
        className="mx-auto block h-28 w-28 overflow-hidden rounded-xl border border-surface-700 bg-surface-800"
      >
        <ImageDisplay src={product.image_url} alt={product.name} width={112} height={112} className="h-full w-full object-cover" />
      </Link>

      <div className="flex h-full flex-1 flex-col">
        <div className="min-h-[50px]">
          <Link href={`/catalog/${storeSlug}/product/${product.slug}`}>
            <h3 className={`text-center text-sm font-semibold text-white ${hasDescription ? "line-clamp-1" : "line-clamp-2"}`}>
              {product.name}
            </h3>
          </Link>
          <p className="mt-0.5 min-h-[30px] text-center text-xs text-slate-400">
            {hasDescription ? <span className="line-clamp-2">{safeDescription}</span> : null}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <p className="text-center text-sm font-semibold" style={{ color: "var(--catalog-primary-soft)" }}>
            {formatMoney(product.price)}
          </p>
          {quantity > 0 ? (
            <CatalogCartQuantityControl
              quantity={quantity}
              onIncrease={() => void increment(product)}
              onDecrease={() => void decrement(product)}
              hideInput
              onInputQuantity={(value) => {
                void setQuantity(product, value);
              }}
              disabled={!isStoreOpen}
            />
          ) : (
            <Button
              type="button"
              className="w-full"
              onClick={async () => {
                await increment(product);
              }}
              disabled={isSyncing || !isStoreOpen}
              style={{ backgroundColor: "var(--catalog-primary)", color: "#04110c" }}
            >
              {t("catalog.addToCart")}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
