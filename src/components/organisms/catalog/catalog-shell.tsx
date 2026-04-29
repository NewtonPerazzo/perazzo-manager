"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect } from "react";

import { CatalogHeader } from "@/components/organisms/catalog/catalog-header";
import { CatalogBackToTop } from "@/components/organisms/catalog/catalog-back-to-top";
import { ToastViewport } from "@/components/molecules/common/toast-viewport";
import { buildCatalogTheme } from "@/lib/color";
import { useCatalogCartStore } from "@/store/catalog-cart-store";
import type { CatalogStoreResponse } from "@/types/api/catalog";

export function CatalogShell({
  storeSlug,
  store,
  children
}: {
  storeSlug: string;
  store: CatalogStoreResponse;
  children: ReactNode;
}) {
  const setStoreSlug = useCatalogCartStore((state) => state.setStoreSlug);
  const theme = buildCatalogTheme(store.color);

  useEffect(() => {
    setStoreSlug(storeSlug);
  }, [setStoreSlug, storeSlug]);

  const style = {
    "--catalog-primary": theme.primary,
    "--catalog-primary-soft": theme.primarySoft,
    "--catalog-primary-dark": theme.primaryDark,
    "--focus-color": theme.primary,
    background: `radial-gradient(circle at top, ${theme.pageTo} 0%, ${theme.pageFrom} 55%, #030507 100%)`
  } as CSSProperties;

  return (
    <div className="min-h-screen text-white" style={style}>
      <CatalogHeader store={store} storeSlug={storeSlug} />
      <main className="mx-auto max-w-6xl px-3 py-4">{children}</main>
      <CatalogBackToTop />
      <ToastViewport />
    </div>
  );
}
