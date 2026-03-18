import { CatalogProductTemplate } from "@/components/templates/catalog/catalog-product-template";

export default async function CatalogProductPage({
  params
}: {
  params: Promise<{ storeSlug: string; productSlug: string }>;
}) {
  const routeParams = await params;

  return <CatalogProductTemplate storeSlug={routeParams.storeSlug} productSlug={routeParams.productSlug} />;
}
