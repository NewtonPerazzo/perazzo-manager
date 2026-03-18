"use client";

import { Button } from "@/components/atoms/button";
import { ImageDisplay } from "@/components/atoms/image-display";
import { useI18n } from "@/i18n/provider";
import type { ProductResponse } from "@/types/api/product";

interface ProductCardProps {
  product: ProductResponse;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const { t } = useI18n();

  return (
    <div className="rounded-xl border border-surface-700 p-3">
      <div className="flex flex-col items-center">
        <ImageDisplay
          src={product.image_url}
          alt={product.name}
          width={96}
          height={96}
          className="h-24 w-24 min-h-24 min-w-24 shrink-0 rounded-lg border border-surface-700 object-cover"
        />
        <p className="mt-3 text-center font-medium">{product.name}</p>
        <div className="mt-2 flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Button className="w-full sm:w-auto" variant="ghost" onClick={onEdit}>
            {t("common.edit")}
          </Button>
          <Button className="w-full sm:w-auto" variant="danger" onClick={onDelete}>
            {t("common.delete")}
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        {product.description ? <p className="text-sm text-slate-400">{product.description}</p> : null}
        <p className="font-semibold">R$ {product.price.toFixed(2)}</p>
        {product.stock !== null && product.stock !== undefined ? (
          <p className="text-sm text-slate-300">{`${t("products.stock")}: ${product.stock}`}</p>
        ) : null}
      </div>
    </div>
  );
}
