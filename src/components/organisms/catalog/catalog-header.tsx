"use client";

import { Instagram, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/cn";
import {
  selectCatalogCartProductsTotal,
  selectCatalogCartTotalItems,
  useCatalogCartStore
} from "@/store/catalog-cart-store";
import type { CatalogStoreResponse } from "@/types/api/catalog";

function formatMoney(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

export function CatalogHeader({
  store,
  storeSlug
}: {
  store: CatalogStoreResponse;
  storeSlug: string;
}) {
  const { t } = useI18n();
  const totalItems = useCatalogCartStore((state) => selectCatalogCartTotalItems(state.itemsByProductId));
  const productsTotal = useCatalogCartStore((state) =>
    selectCatalogCartProductsTotal(state.itemsByProductId, state.pricesByProductId)
  );
  const instagramText = store.instagram
    ? store.instagram.includes("instagram.com/")
      ? `@${store.instagram.split("instagram.com/")[1].replaceAll("/", "").replace("@", "")}`
      : store.instagram.startsWith("@")
        ? store.instagram
        : `@${store.instagram}`
    : "";

  return (
    <header className="sticky top-0 z-40 border-b border-surface-700 bg-black/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-3 py-3">
        <div className="flex items-center justify-end">
          <div className="flex flex-col items-end gap-1">
            <Link
              href={`/catalog/${storeSlug}/cart`}
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("catalog-cart-open"));
                }
              }}
              className={cn(
                "relative inline-flex h-10 w-10 items-center justify-center rounded-xl border",
                totalItems > 0 ? "border-transparent text-black" : "border-surface-700 bg-surface-900 text-slate-200"
              )}
              style={totalItems > 0 ? { backgroundColor: "var(--catalog-primary)" } : undefined}
              aria-label={t("catalog.cart")}
            >
              <ShoppingCart size={18} />
              {totalItems > 0 ? (
                <span className="absolute -right-1 -top-1 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-black">
                  {totalItems}
                </span>
              ) : null}
            </Link>
            {totalItems > 0 ? (
              <p className="text-[11px] font-medium text-slate-300">{formatMoney(productsTotal)}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-2 flex flex-col items-center justify-center gap-2 text-center">
          {store.logo ? (
            <Link href={`/catalog/${storeSlug}`}>
              <Image
                src={store.logo}
                alt={store.name}
                width={92}
                height={92}
                className="h-20 w-20 rounded-full border border-surface-700 object-cover"
                unoptimized
              />
            </Link>
          ) : null}
          <Link href={`/catalog/${storeSlug}`}>
            <h1 className="text-xl font-bold text-white">{store.name}</h1>
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {store.instagram ? (
              <a
                href={
                  store.instagram.startsWith("http")
                    ? store.instagram
                    : `https://instagram.com/${store.instagram.replace("@", "")}`
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-xl border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-slate-100"
              >
                <span>{instagramText}</span>
                <Instagram size={14} className="text-pink-400" />
              </a>
            ) : null}
          </div>

          {store.address ? <p className="text-sm text-slate-300">{store.address}</p> : null}
        </div>
      </div>
    </header>
  );
}
