"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Modal } from "@/components/atoms/modal";
import { CategoryForm } from "@/components/molecules/category/category-form";
import { ConfirmDeleteModal } from "@/components/molecules/common/confirm-delete-modal";
import { ListSkeleton } from "@/components/molecules/common/list-skeleton";
import { useUiFeedback } from "@/hooks/use-ui-feedback";
import { useI18n } from "@/i18n/provider";
import { categoryService } from "@/services/resources/category-service";
import { useAuthStore } from "@/store/auth-store";
import { useUiFeedbackStore } from "@/store/ui-feedback-store";
import type { CategoryCreatePayload, CategoryResponse } from "@/types/api/category";

export function CategoriesTemplate({ initialData }: { initialData: CategoryResponse[] }) {
  const { t } = useI18n();
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const { runWithFeedback } = useUiFeedback();
  const isSubmitting = useUiFeedbackStore((state) => Boolean(state.loadingByKey["categories:submit"]));
  const isDeleting = useUiFeedbackStore((state) => Boolean(state.loadingByKey["categories:delete"]));
  const isReordering = useUiFeedbackStore((state) => Boolean(state.loadingByKey["categories:reorder"]));
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  const [categories, setCategories] = useState<CategoryResponse[]>(initialData);
  const [deletingCategory, setDeletingCategory] = useState<CategoryResponse | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(initialData.length === 0);
  const [draggingCategoryId, setDraggingCategoryId] = useState<string | null>(null);
  const [touchDraggingCategoryId, setTouchDraggingCategoryId] = useState<string | null>(null);
  const [isOrderDirty, setIsOrderDirty] = useState(false);

  function sortByOrder(items: CategoryResponse[]): CategoryResponse[] {
    return [...items].sort((a, b) => {
      const aOrder = a.sort_order ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.sort_order ?? Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.name.localeCompare(b.name);
    });
  }

  useEffect(() => {
    async function loadCategories() {
      if (!token) return;

      setIsLoadingList(true);
      try {
        const items = await categoryService.list(token);
        setCategories(sortByOrder(items));
        setIsOrderDirty(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("common.unexpectedError"));
      } finally {
        setIsLoadingList(false);
      }
    }

    void loadCategories();
  }, [t, token]);

  async function handleSubmit(payload: CategoryCreatePayload) {
    if (!token) return;

    const result = await runWithFeedback(
      "categories:submit",
      async () => {
        setError(null);
        if (editingCategory) {
          const updated = await categoryService.update(token, editingCategory.id, payload);
          setCategories((prev) => sortByOrder(prev.map((item) => (item.id === updated.id ? updated : item))));
        } else {
          const created = await categoryService.create(token, payload);
          setCategories((prev) => sortByOrder([...prev, created]));
        }
      },
      {
        successMessage: editingCategory ? t("common.updatedSuccess") : t("common.createdSuccess")
      }
    );

    if (!result.ok) {
      return;
    }
    setOpen(false);
    setEditingCategory(null);
    setIsOrderDirty(false);
    router.refresh();
  }

  function openCreateModal() {
    setEditingCategory(null);
    setError(null);
    setOpen(true);
  }

  function openEditModal(category: CategoryResponse) {
    setEditingCategory(category);
    setError(null);
    setOpen(true);
  }

  async function handleDelete(category: CategoryResponse) {
    if (!token) return;

    const result = await runWithFeedback(
      "categories:delete",
      async () => {
        setError(null);
        await categoryService.remove(token, category.id);
      },
      {
        successMessage: t("common.deletedSuccess")
      }
    );

    if (!result.ok) {
      return;
    }
    setCategories((prev) => prev.filter((item) => item.id !== category.id));
    setDeletingCategory(null);
    setIsOrderDirty(false);
    router.refresh();
  }

  function handleDropOn(targetId: string) {
    if (!draggingCategoryId || draggingCategoryId === targetId) return;

    setCategories((prev) => {
      const sourceIndex = prev.findIndex((item) => item.id === draggingCategoryId);
      const targetIndex = prev.findIndex((item) => item.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) return prev;

      const next = [...prev];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setIsOrderDirty(true);
  }

  function handleTouchMove(event: React.TouchEvent<HTMLDivElement>) {
    if (!touchDraggingCategoryId) return;
    event.preventDefault();

    const touch = event.touches[0];
    if (!touch) return;

    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const item = element?.closest("[data-category-id]") as HTMLElement | null;
    const targetId = item?.dataset.categoryId;
    if (!targetId || targetId === touchDraggingCategoryId) return;

    setCategories((prev) => {
      const sourceIndex = prev.findIndex((category) => category.id === touchDraggingCategoryId);
      const targetIndex = prev.findIndex((category) => category.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) return prev;

      const next = [...prev];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setTouchDraggingCategoryId(targetId);
    setIsOrderDirty(true);
  }

  async function handleSaveOrder() {
    if (!token || !isOrderDirty) return;

    const result = await runWithFeedback(
      "categories:reorder",
      async () => {
        const reordered = await categoryService.reorder(token, categories.map((category) => category.id));
        setCategories(sortByOrder(reordered));
        setIsOrderDirty(false);
      },
      {
        successMessage: t("categories.orderSaved")
      }
    );

    if (!result.ok) return;
    router.refresh();
  }

  return (
    <>
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white">{`${t("categories.title")} - ${categories.length}`}</h1>
            <p className="text-sm text-slate-300">{t("categories.subtitle")}</p>
          </div>
          <Button onClick={openCreateModal} disabled={isSubmitting || isDeleting}>
            {t("common.addNew")}
          </Button>
        </div>

        <div className="mb-4 rounded-xl border border-surface-700 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-100">{t("categories.reorderTitle")}</p>
            <Button
              type="button"
              variant="ghost"
              onClick={() => void handleSaveOrder()}
              disabled={!isOrderDirty || isReordering || isSubmitting || isDeleting}
            >
              {isReordering ? t("common.loading") : t("categories.saveOrder")}
            </Button>
          </div>
          <p className="mb-3 text-xs text-slate-400">{t("categories.reorderDescription")}</p>
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={`order-${category.id}`}
                data-category-id={category.id}
                draggable
                onDragStart={() => setDraggingCategoryId(category.id)}
                onDragOver={(event) => {
                  event.preventDefault();
                }}
                onDrop={() => handleDropOn(category.id)}
                onDragEnd={() => setDraggingCategoryId(null)}
                onTouchStart={() => setTouchDraggingCategoryId(category.id)}
                onTouchMove={handleTouchMove}
                onTouchEnd={() => setTouchDraggingCategoryId(null)}
                className="touch-none cursor-grab rounded-lg border border-surface-700 bg-surface-900/70 px-3 py-2 text-sm text-slate-100 active:cursor-grabbing"
              >
                {category.name}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {isLoadingList ? (
            <ListSkeleton items={3} className="space-y-2" itemClassName="h-20 w-full rounded-xl" />
          ) : null}
          {!isLoadingList && categories.length === 0 ? (
            <p className="text-sm text-slate-300">{t("common.empty")}</p>
          ) : (
            !isLoadingList && categories.map((category) => (
              <div key={category.id} className="rounded-xl border border-surface-700 p-3">
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-slate-300">{category.description ?? "-"}</p>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <Button className="w-full sm:w-auto" variant="ghost" onClick={() => openEditModal(category)}>
                      {t("common.edit")}
                    </Button>
                    <Button className="w-full sm:w-auto" variant="danger" onClick={() => setDeletingCategory(category)}>
                      {t("common.delete")}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditingCategory(null);
        }}
        title={editingCategory ? t("categories.editTitle") : t("categories.title")}
      >
        {error ? <p className="mb-2 text-sm text-red-300 whitespace-pre-line">{error}</p> : null}
        <CategoryForm
          initialData={editingCategory}
          onSubmit={handleSubmit}
          submitLabel={editingCategory ? t("common.save") : t("common.create")}
        />
      </Modal>

      <ConfirmDeleteModal
        open={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        onConfirm={async () => {
          if (!deletingCategory) return;
          await handleDelete(deletingCategory);
        }}
        isLoading={isDeleting}
      />
    </>
  );
}
