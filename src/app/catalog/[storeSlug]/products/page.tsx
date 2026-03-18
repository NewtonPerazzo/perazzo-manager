import { CatalogProductsTemplate } from "@/components/templates/catalog/catalog-products-template";

export default async function CatalogProductsPage({
  params,
  searchParams
}: {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ search?: string }>;
}) {
  const routeParams = await params;
  const queryParams = await searchParams;
  return (
    <CatalogProductsTemplate
      storeSlug={routeParams.storeSlug}
      mode="products"
      initialSearch={queryParams.search ?? ""}
    />
  );
}
