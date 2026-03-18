"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Modal } from "@/components/atoms/modal";
import { ConfirmDeleteModal } from "@/components/molecules/common/confirm-delete-modal";
import { ListSkeleton } from "@/components/molecules/common/list-skeleton";
import { PaymentMethodForm } from "@/components/molecules/payment-method/payment-method-form";
import { useUiFeedback } from "@/hooks/use-ui-feedback";
import { useI18n } from "@/i18n/provider";
import { paymentMethodService } from "@/services/resources/payment-method-service";
import { useAuthStore } from "@/store/auth-store";
import { useUiFeedbackStore } from "@/store/ui-feedback-store";
import type { PaymentMethodCreatePayload, PaymentMethodResponse } from "@/types/api/payment-method";

export function PaymentMethodsTemplate({
  initialData
}: {
  initialData: PaymentMethodResponse[];
}) {
  const { t } = useI18n();
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const { runWithFeedback } = useUiFeedback();
  const isSubmitting = useUiFeedbackStore((state) => Boolean(state.loadingByKey["payment-methods:submit"]));
  const isDeleting = useUiFeedbackStore((state) => Boolean(state.loadingByKey["payment-methods:delete"]));
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethodResponse | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodResponse[]>(initialData);
  const [deletingPaymentMethod, setDeletingPaymentMethod] = useState<PaymentMethodResponse | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(initialData.length === 0);

  useEffect(() => {
    async function loadPaymentMethods() {
      if (!token) return;

      setIsLoadingList(true);
      try {
        const items = await paymentMethodService.list(token);
        setPaymentMethods(items);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("common.unexpectedError"));
      } finally {
        setIsLoadingList(false);
      }
    }

    void loadPaymentMethods();
  }, [t, token]);

  async function handleSubmit(payload: PaymentMethodCreatePayload) {
    if (!token) return;

    const result = await runWithFeedback(
      "payment-methods:submit",
      async () => {
        setError(null);
        if (editingPaymentMethod) {
          const updated = await paymentMethodService.update(token, editingPaymentMethod.id, payload);
          setPaymentMethods((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        } else {
          const created = await paymentMethodService.create(token, payload);
          setPaymentMethods((prev) => [created, ...prev]);
        }
      },
      {
        successMessage: editingPaymentMethod ? t("common.updatedSuccess") : t("common.createdSuccess")
      }
    );

    if (!result.ok) {
      return;
    }
    setOpen(false);
    setEditingPaymentMethod(null);
    router.refresh();
  }

  function openCreateModal() {
    setEditingPaymentMethod(null);
    setError(null);
    setOpen(true);
  }

  function openEditModal(paymentMethod: PaymentMethodResponse) {
    setEditingPaymentMethod(paymentMethod);
    setError(null);
    setOpen(true);
  }

  async function handleDelete(paymentMethod: PaymentMethodResponse) {
    if (!token) return;

    const result = await runWithFeedback(
      "payment-methods:delete",
      async () => {
        setError(null);
        await paymentMethodService.remove(token, paymentMethod.id);
      },
      {
        successMessage: t("common.deletedSuccess")
      }
    );

    if (!result.ok) {
      return;
    }
    setPaymentMethods((prev) => prev.filter((item) => item.id !== paymentMethod.id));
    setDeletingPaymentMethod(null);
    router.refresh();
  }

  return (
    <>
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white">{t("paymentMethods.title")}</h1>
            <p className="text-sm text-slate-300">{t("paymentMethods.subtitle")}</p>
          </div>
          <Button onClick={openCreateModal} disabled={isSubmitting || isDeleting}>
            {t("common.addNew")}
          </Button>
        </div>

        <div className="space-y-2">
          {isLoadingList ? (
            <ListSkeleton items={3} className="space-y-2" itemClassName="h-20 w-full rounded-xl" />
          ) : null}
          {!isLoadingList && paymentMethods.length === 0 ? (
            <p className="text-sm text-slate-300">{t("common.empty")}</p>
          ) : (
            !isLoadingList && paymentMethods.map((method) => (
              <div key={method.id} className="rounded-xl border border-surface-700 p-3">
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                  <p className="font-medium">{method.name}</p>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <Button className="w-full sm:w-auto" variant="ghost" onClick={() => openEditModal(method)}>
                      {t("common.edit")}
                    </Button>
                    <Button className="w-full sm:w-auto" variant="danger" onClick={() => setDeletingPaymentMethod(method)}>
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
          setEditingPaymentMethod(null);
        }}
        title={t("paymentMethods.title")}
      >
        {error ? <p className="mb-2 text-sm text-red-300">{error}</p> : null}
        <PaymentMethodForm
          onSubmit={handleSubmit}
          initialData={editingPaymentMethod}
          submitLabel={editingPaymentMethod ? t("common.save") : t("common.create")}
        />
      </Modal>

      <ConfirmDeleteModal
        open={Boolean(deletingPaymentMethod)}
        onClose={() => setDeletingPaymentMethod(null)}
        onConfirm={async () => {
          if (!deletingPaymentMethod) return;
          await handleDelete(deletingPaymentMethod);
        }}
        isLoading={isDeleting}
      />
    </>
  );
}
