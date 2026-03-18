import { CatalogHomeTemplate } from "@/components/templates/catalog/catalog-home-template";

export default async function CatalogHomePage({
  params,
  searchParams
}: {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ search?: string }>;
}) {
  const routeParams = await params;
  const queryParams = await searchParams;
  return <CatalogHomeTemplate storeSlug={routeParams.storeSlug} initialSearch={queryParams.search ?? ""} />;
}
