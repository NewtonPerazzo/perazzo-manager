import { CatalogProductCard } from "@/components/molecules/catalog/catalog-product-card";
import type { CatalogHomeSectionResponse } from "@/types/api/catalog";

export function CatalogCategoryProductsSection({
  storeSlug,
  section,
  isStoreOpen = true
}: {
  storeSlug: string;
  section: CatalogHomeSectionResponse;
  isStoreOpen?: boolean;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-end gap-2">
        <h2 className="text-lg font-semibold text-white">{section.category.name}</h2>
        <span className="text-xs text-slate-400">{section.category.products_count}</span>
      </div>

      <div className="-mx-1 overflow-x-auto no-scrollbar px-1 pb-1">
        <div className="flex w-max min-w-full gap-3">
          {section.products.map((product) => (
            <CatalogProductCard key={product.id} storeSlug={storeSlug} product={product} isStoreOpen={isStoreOpen} />
          ))}
        </div>
      </div>
    </section>
  );
}
