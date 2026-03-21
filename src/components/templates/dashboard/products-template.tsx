"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Modal } from "@/components/atoms/modal";
import { ConfirmDeleteModal } from "@/components/molecules/common/confirm-delete-modal";
import { ListSkeleton } from "@/components/molecules/common/list-skeleton";
import { ProductCard } from "@/components/molecules/product/product-card";
import { ProductCardSkeleton } from "@/components/molecules/product/product-card-skeleton";
import { ProductForm } from "@/components/molecules/product/product-form";
import { useUiFeedback } from "@/hooks/use-ui-feedback";
import { useI18n } from "@/i18n/provider";
import { categoryService } from "@/services/resources/category-service";
import { productService } from "@/services/resources/product-service";
import { useAuthStore } from "@/store/auth-store";
import { useUiFeedbackStore } from "@/store/ui-feedback-store";
import type { CategoryResponse } from "@/types/api/category";
import type { ProductCreatePayload, ProductResponse } from "@/types/api/product";

const PAGE_SIZE = 10;

export function ProductsTemplate({
  initialData,
  initialTotal,
  categories
}: {
  initialData: ProductResponse[];
  initialTotal: number;
  categories: CategoryResponse[];
}) {
  const { t } = useI18n();
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const { runWithFeedback } = useUiFeedback();
  const isSubmitting = useUiFeedbackStore((state) => Boolean(state.loadingByKey["products:submit"]));
  const isDeleting = useUiFeedbackStore((state) => Boolean(state.loadingByKey["products:delete"]));
  const isToggling = useUiFeedbackStore((state) => Boolean(state.loadingByKey["products:toggle-active"]));

  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductResponse | null>(null);

  const [products, setProducts] = useState<ProductResponse[]>(initialData);
  const [categoriesList, setCategoriesList] = useState<CategoryResponse[]>(categories);
  const [totalProducts, setTotalProducts] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingList, setIsLoadingList] = useState(false);

  const hasPreviousPage = page > 1;
  const hasNextPage = page * PAGE_SIZE < totalProducts;

  const loadProducts = useCallback(async () => {
    if (!token) return;

    setIsLoadingList(true);
    setError(null);

    try {
      const response = await productService.list(token, {
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
        search: searchTerm,
        categoryId: selectedCategoryId,
        sortBy: "created_at",
        sortOrder: "desc"
      });
      setProducts(
        [...response.items].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );
      setTotalProducts(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.unexpectedError"));
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setIsLoadingList(false);
    }
  }, [page, searchTerm, selectedCategoryId, t, token]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadProducts();
    }, 500);

    return () => clearTimeout(timeout);
  }, [loadProducts]);

  useEffect(() => {
    async function loadCategories() {
      if (!token) return;
      try {
        const items = await categoryService.list(token);
        setCategoriesList(items);
      } catch {
        // Keep product list available even if categories fail to load.
      }
    }

    void loadCategories();
  }, [token]);

  async function handleSubmit(payload: ProductCreatePayload) {
    if (!token) return;

    const result = await runWithFeedback(
      "products:submit",
      async () => {
        setError(null);
        if (editingProduct) {
          await productService.update(token, editingProduct.id, payload);
        } else {
          await productService.create(token, payload);
        }
      },
      {
        successMessage: editingProduct ? t("common.updatedSuccess") : t("common.createdSuccess")
      }
    );

    if (!result.ok) {
      return;
    }
    setOpen(false);
    setEditingProduct(null);
    void loadProducts();
    router.refresh();
  }

  function openCreateModal() {
    setEditingProduct(null);
    setError(null);
    setOpen(true);
  }

  function openEditModal(product: ProductResponse) {
    setEditingProduct(product);
    setError(null);
    setOpen(true);
  }

  async function handleDelete(product: ProductResponse) {
    if (!token) return;

    const result = await runWithFeedback(
      "products:delete",
      async () => {
        setError(null);
        await productService.remove(token, product.id);
      },
      {
        successMessage: t("common.deletedSuccess")
      }
    );

    if (!result.ok) {
      return;
    }
    setDeletingProduct(null);
    void loadProducts();
    router.refresh();
  }

  async function handleToggleActive(product: ProductResponse, nextActive: boolean) {
    if (!token) return;

    const result = await runWithFeedback(
      "products:toggle-active",
      async () => {
        await productService.update(token, product.id, { is_active: nextActive });
      },
      {
        successMessage: t("common.updatedSuccess")
      }
    );

    if (!result.ok) return;
    void loadProducts();
  }

  return (
    <>
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white">{`${t("products.title")} - ${totalProducts}`}</h1>
            <p className="text-sm text-slate-300">{t("products.subtitle")}</p>
          </div>
          <Button onClick={openCreateModal} disabled={isSubmitting || isDeleting}>
            {t("common.addNew")}
          </Button>
        </div>

        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          <select
            value={selectedCategoryId}
            onChange={(event) => {
              setSelectedCategoryId(event.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-white outline-none focus:border-accent-500"
          >
            <option value="">{t("products.allCategories")}</option>
            {categoriesList.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <Input
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setPage(1);
            }}
            placeholder={t("products.searchPlaceholder")}
          />
        </div>

        <div className="space-y-2">
          {isLoadingList ? (
            <ListSkeleton
              items={3}
              className="space-y-2"
              renderItem={(index) => <ProductCardSkeleton key={index} />}
            />
          ) : null}
          {!isLoadingList && products.length === 0 ? (
            <p className="text-sm text-slate-300">{t("common.empty")}</p>
          ) : null}
          {!isLoadingList
            ? products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={() => openEditModal(product)}
                  onDelete={() => setDeletingProduct(product)}
                  onToggleActive={(next) => void handleToggleActive(product, next)}
                  isToggling={isToggling}
                />
              ))
            : null}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button variant="ghost" disabled={!hasPreviousPage} onClick={() => setPage((prev) => prev - 1)}>
            {t("common.previous")}
          </Button>
          <span className="text-sm text-slate-300">{`${t("common.page")} ${page}`}</span>
          <Button variant="ghost" disabled={!hasNextPage} onClick={() => setPage((prev) => prev + 1)}>
            {t("common.next")}
          </Button>
        </div>
      </Card>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? t("products.editTitle") : t("products.title")}
      >
        {error ? <p className="mb-2 text-sm text-red-300 whitespace-pre-line">{error}</p> : null}
        <ProductForm
          initialData={editingProduct}
          categories={categoriesList}
          onSubmit={handleSubmit}
          submitLabel={editingProduct ? t("common.save") : t("common.create")}
        />
      </Modal>

      <ConfirmDeleteModal
        open={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={async () => {
          if (!deletingProduct) return;
          await handleDelete(deletingProduct);
        }}
        isLoading={isDeleting}
      />
    </>
  );
}
