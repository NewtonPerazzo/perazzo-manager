"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Modal } from "@/components/atoms/modal";
import { ConfirmDeleteModal } from "@/components/molecules/common/confirm-delete-modal";
import { DeliveryMethodForm } from "@/components/molecules/delivery-method/delivery-method-form";
import { ListSkeleton } from "@/components/molecules/common/list-skeleton";
import { useUiFeedback } from "@/hooks/use-ui-feedback";
import { useI18n } from "@/i18n/provider";
import { deliveryMethodService } from "@/services/resources/delivery-method-service";
import { useAuthStore } from "@/store/auth-store";
import { useUiFeedbackStore } from "@/store/ui-feedback-store";
import type { DeliveryMethodCreatePayload, DeliveryMethodResponse } from "@/types/api/delivery-method";

const PAGE_SIZE = 10;

export function DeliveryMethodsTemplate({
  initialData,
  initialTotal
}: {
  initialData: DeliveryMethodResponse[];
  initialTotal: number;
}) {
  const { t } = useI18n();
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const { runWithFeedback } = useUiFeedback();
  const isSubmitting = useUiFeedbackStore((state) => Boolean(state.loadingByKey["delivery-methods:submit"]));
  const isDeleting = useUiFeedbackStore((state) => Boolean(state.loadingByKey["delivery-methods:delete"]));
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<DeliveryMethodResponse | null>(null);
  const [deletingMethod, setDeletingMethod] = useState<DeliveryMethodResponse | null>(null);
  const [methods, setMethods] = useState<DeliveryMethodResponse[]>(initialData);
  const [totalMethods, setTotalMethods] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingList, setIsLoadingList] = useState(false);

  const hasPreviousPage = page > 1;
  const hasNextPage = page * PAGE_SIZE < totalMethods;

  const loadMethods = useCallback(async () => {
    if (!token) return;

    setIsLoadingList(true);
    setError(null);

    try {
      const response = await deliveryMethodService.list(token, {
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
        search: searchTerm
      });
      setMethods(response.items);
      setTotalMethods(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.unexpectedError"));
      setMethods([]);
      setTotalMethods(0);
    } finally {
      setIsLoadingList(false);
    }
  }, [page, searchTerm, t, token]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadMethods();
    }, 500);

    return () => clearTimeout(timeout);
  }, [loadMethods]);

  async function handleSubmit(payload: DeliveryMethodCreatePayload) {
    if (!token) return;

    const result = await runWithFeedback(
      "delivery-methods:submit",
      async () => {
        setError(null);
        if (editingMethod) {
          const updated = await deliveryMethodService.update(token, editingMethod.id, payload);
          setMethods((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        } else {
          await deliveryMethodService.create(token, payload);
        }
      },
      {
        successMessage: editingMethod ? t("common.updatedSuccess") : t("common.createdSuccess")
      }
    );

    if (!result.ok) {
      return;
    }
    setOpen(false);
    setEditingMethod(null);
    void loadMethods();
    router.refresh();
  }

  function openCreateModal() {
    setEditingMethod(null);
    setError(null);
    setOpen(true);
  }

  function openEditModal(method: DeliveryMethodResponse) {
    setEditingMethod(method);
    setError(null);
    setOpen(true);
  }

  async function handleDelete(method: DeliveryMethodResponse) {
    if (!token) return;

    const result = await runWithFeedback(
      "delivery-methods:delete",
      async () => {
        setError(null);
        await deliveryMethodService.remove(token, method.id);
      },
      {
        successMessage: t("common.deletedSuccess")
      }
    );

    if (!result.ok) {
      return;
    }
    setDeletingMethod(null);
    void loadMethods();
    router.refresh();
  }

  return (
    <>
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white">{`${t("deliveryMethods.title")} - ${totalMethods}`}</h1>
            <p className="text-sm text-slate-300">{t("deliveryMethods.subtitle")}</p>
          </div>
          <Button onClick={openCreateModal} disabled={isSubmitting || isDeleting}>
            {t("common.addNew")}
          </Button>
        </div>

        <div className="mb-4">
          <Input
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setPage(1);
            }}
            placeholder={t("deliveryMethods.searchPlaceholder")}
          />
        </div>

        <div className="space-y-2">
          {isLoadingList ? (
            <ListSkeleton items={3} className="space-y-2" itemClassName="h-20 w-full rounded-xl" />
          ) : null}
          {!isLoadingList && methods.length === 0 ? (
            <p className="text-sm text-slate-300">{t("common.empty")}</p>
          ) : (
            !isLoadingList &&
            methods.map((method) => (
              <div key={method.id} className="rounded-xl border border-surface-700 p-3">
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                  <div>
                    <p className="font-medium">{method.name}</p>
                    <p className="text-sm text-slate-300">{`R$ ${method.price.toFixed(2)}`}</p>
                    {method.description ? <p className="text-sm text-slate-400">{method.description}</p> : null}
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <Button className="w-full sm:w-auto" variant="ghost" onClick={() => openEditModal(method)}>
                      {t("common.edit")}
                    </Button>
                    <Button className="w-full sm:w-auto" variant="danger" onClick={() => setDeletingMethod(method)}>
                      {t("common.delete")}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
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
          setEditingMethod(null);
        }}
        title={t("deliveryMethods.title")}
      >
        {error ? <p className="mb-2 text-sm text-red-300">{error}</p> : null}
        <DeliveryMethodForm
          onSubmit={handleSubmit}
          initialData={editingMethod}
          submitLabel={editingMethod ? t("common.save") : t("common.create")}
        />
      </Modal>

      <ConfirmDeleteModal
        open={Boolean(deletingMethod)}
        onClose={() => setDeletingMethod(null)}
        onConfirm={async () => {
          if (!deletingMethod) return;
          await handleDelete(deletingMethod);
        }}
        isLoading={isDeleting}
      />
    </>
  );
}
