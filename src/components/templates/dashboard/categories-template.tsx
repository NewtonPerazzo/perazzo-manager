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
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  const [categories, setCategories] = useState<CategoryResponse[]>(initialData);
  const [deletingCategory, setDeletingCategory] = useState<CategoryResponse | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(initialData.length === 0);

  useEffect(() => {
    async function loadCategories() {
      if (!token) return;

      setIsLoadingList(true);
      try {
        const items = await categoryService.list(token);
        setCategories(items);
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
          setCategories((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        } else {
          const created = await categoryService.create(token, payload);
          setCategories((prev) => [created, ...prev]);
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
