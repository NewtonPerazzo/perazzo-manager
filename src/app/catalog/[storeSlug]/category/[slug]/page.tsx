import { CatalogProductsTemplate } from "@/components/templates/catalog/catalog-products-template";

export default async function CatalogCategoryPage({
  params,
  searchParams
}: {
  params: Promise<{ storeSlug: string; slug: string }>;
  searchParams: Promise<{ search?: string }>;
}) {
  const routeParams = await params;
  const queryParams = await searchParams;

  return (
    <CatalogProductsTemplate
      storeSlug={routeParams.storeSlug}
      mode="category"
      categorySlug={routeParams.slug}
      initialSearch={queryParams.search ?? ""}
    />
  );
}
