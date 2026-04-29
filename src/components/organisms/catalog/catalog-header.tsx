"use client";

import { Instagram, Menu, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useI18n } from "@/i18n/provider";
import { buildBusinessHoursSummary } from "@/lib/store-hours";
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
  const { t, locale } = useI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
  const businessHoursSummary = buildBusinessHoursSummary(store.business_hours, locale);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-surface-700 bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-2">
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-surface-700 bg-surface-900 text-slate-100 transition hover:border-surface-600"
            aria-label={t("catalog.storeMenu")}
          >
            <Menu size={20} />
          </button>

          <Link href={`/catalog/${storeSlug}`} className="flex min-w-0 flex-1 items-center justify-center gap-3">
            <span className="shrink-0">
              <StoreLogo store={store} size="sm" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold leading-tight text-white md:text-base">{store.name}</span>
              <StoreOpenStatus
                isOpen={store.is_open_now}
                openLabel={t("store.openNow")}
                closedLabel={t("store.closedNow")}
              />
            </span>
          </Link>

          <CartButton
            storeSlug={storeSlug}
            totalItems={totalItems}
            productsTotal={productsTotal}
            cartLabel={t("catalog.cart")}
          />
        </div>
      </header>

      {isMenuOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/65"
            aria-label={t("catalog.closeStoreMenu")}
            onClick={() => setIsMenuOpen(false)}
          />
          <aside className="relative flex h-full w-[min(86vw,360px)] flex-col overflow-y-auto border-r border-surface-700 bg-black px-5 py-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-200">{t("catalog.storeMenu")}</span>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-surface-700 bg-surface-900 text-slate-100"
                aria-label={t("catalog.closeStoreMenu")}
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center gap-3 text-center">
              <Link href={`/catalog/${storeSlug}`} onClick={() => setIsMenuOpen(false)}>
              <StoreLogo store={store} size="lg" />
            </Link>
              <Link href={`/catalog/${storeSlug}`} onClick={() => setIsMenuOpen(false)}>
                <h1 className="text-xl font-bold text-white">{store.name}</h1>
              </Link>
              <div className="text-center">
                {businessHoursSummary ? <p className="text-sm text-slate-300">{businessHoursSummary}</p> : null}
                <StoreOpenStatus
                  isOpen={store.is_open_now}
                  openLabel={t("store.openNow")}
                  closedLabel={t("store.closedNow")}
                />
              </div>

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
          </aside>
        </div>
      ) : null}
    </>
  );
}

function StoreLogo({ store, size }: { store: CatalogStoreResponse; size: "sm" | "lg" }) {
  const dimension = size === "sm" ? 44 : 92;
  const className =
    size === "sm"
      ? "h-11 w-11 rounded-full border border-surface-700 object-cover"
      : "h-20 w-20 rounded-full border border-surface-700 object-cover";

  if (store.logo) {
    return <Image src={store.logo} alt={store.name} width={dimension} height={dimension} className={className} unoptimized />;
  }

  return (
    <span
      className={cn(
        "grid place-items-center rounded-full border border-surface-700 bg-surface-900 font-semibold text-white",
        size === "sm" ? "h-11 w-11 text-sm" : "h-20 w-20 text-2xl"
      )}
    >
      {store.name.slice(0, 1).toUpperCase()}
    </span>
  );
}

function StoreOpenStatus({
  closedLabel,
  isOpen,
  openLabel
}: {
  closedLabel: string;
  isOpen: boolean;
  openLabel: string;
}) {
  return (
    <p className="inline-flex items-center gap-1.5 text-xs text-slate-200 sm:gap-2 sm:text-sm">
      <span className={cn("h-2.5 w-2.5 rounded-full", isOpen ? "bg-emerald-400" : "bg-red-400")} />
      <span>{isOpen ? openLabel : closedLabel}</span>
    </p>
  );
}

function CartButton({
  cartLabel,
  productsTotal,
  storeSlug,
  totalItems
}: {
  cartLabel: string;
  productsTotal: number;
  storeSlug: string;
  totalItems: number;
}) {
  return (
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
        aria-label={cartLabel}
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
  );
}
