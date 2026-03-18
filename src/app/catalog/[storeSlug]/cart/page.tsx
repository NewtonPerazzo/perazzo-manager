import { CatalogCartTemplate } from "@/components/templates/catalog/catalog-cart-template";

export default async function CatalogCartPage({
  params
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const routeParams = await params;
  return <CatalogCartTemplate storeSlug={routeParams.storeSlug} />;
}
