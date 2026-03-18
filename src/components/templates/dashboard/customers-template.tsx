"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Modal } from "@/components/atoms/modal";
import { ConfirmDeleteModal } from "@/components/molecules/common/confirm-delete-modal";
import { ListSkeleton } from "@/components/molecules/common/list-skeleton";
import { CustomerForm } from "@/components/molecules/customer/customer-form";
import { useUiFeedback } from "@/hooks/use-ui-feedback";
import { useI18n } from "@/i18n/provider";
import { customerService } from "@/services/resources/customer-service";
import { useAuthStore } from "@/store/auth-store";
import { useUiFeedbackStore } from "@/store/ui-feedback-store";
import type { CustomerCreatePayload, CustomerResponse } from "@/types/api/customer";

const PAGE_SIZE = 10;

export function CustomersTemplate({
  initialData,
  initialTotal
}: {
  initialData: CustomerResponse[];
  initialTotal: number;
}) {
  const { t } = useI18n();
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const { runWithFeedback } = useUiFeedback();
  const isSubmitting = useUiFeedbackStore((state) => Boolean(state.loadingByKey["customers:submit"]));
  const isDeleting = useUiFeedbackStore((state) => Boolean(state.loadingByKey["customers:delete"]));
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerResponse | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<CustomerResponse | null>(null);
  const [customers, setCustomers] = useState<CustomerResponse[]>(initialData);
  const [totalCustomers, setTotalCustomers] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingList, setIsLoadingList] = useState(false);

  const hasPreviousPage = page > 1;
  const hasNextPage = page * PAGE_SIZE < totalCustomers;

  const loadCustomers = useCallback(async () => {
    if (!token) return;

    setIsLoadingList(true);
    setError(null);

    try {
      const response = await customerService.list(token, {
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
        search: searchTerm
      });
      setCustomers(response.items);
      setTotalCustomers(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.unexpectedError"));
      setCustomers([]);
      setTotalCustomers(0);
    } finally {
      setIsLoadingList(false);
    }
  }, [page, searchTerm, t, token]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadCustomers();
    }, 500);

    return () => clearTimeout(timeout);
  }, [loadCustomers]);

  async function handleSubmit(payload: CustomerCreatePayload) {
    if (!token) return;

    const result = await runWithFeedback(
      "customers:submit",
      async () => {
        setError(null);
        if (editingCustomer) {
          const updated = await customerService.update(token, editingCustomer.id, payload);
          setCustomers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        } else {
          await customerService.create(token, payload);
        }
      },
      {
        successMessage: editingCustomer ? t("common.updatedSuccess") : t("common.createdSuccess")
      }
    );

    if (!result.ok) {
      return;
    }
    setOpen(false);
    setEditingCustomer(null);
    void loadCustomers();
    router.refresh();
  }

  function openCreateModal() {
    setEditingCustomer(null);
    setError(null);
    setOpen(true);
  }

  function openEditModal(customer: CustomerResponse) {
    setEditingCustomer(customer);
    setError(null);
    setOpen(true);
  }

  async function handleDelete(customer: CustomerResponse) {
    if (!token) return;

    const result = await runWithFeedback(
      "customers:delete",
      async () => {
        setError(null);
        await customerService.remove(token, customer.id);
      },
      {
        successMessage: t("common.deletedSuccess")
      }
    );

    if (!result.ok) {
      return;
    }
    setDeletingCustomer(null);
    void loadCustomers();
    router.refresh();
  }

  return (
    <>
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white">{`${t("customers.title")} - ${totalCustomers}`}</h1>
            <p className="text-sm text-slate-300">{t("customers.subtitle")}</p>
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
            placeholder={t("customers.searchPlaceholder")}
          />
        </div>

        <div className="space-y-2">
          {isLoadingList ? (
            <ListSkeleton items={3} className="space-y-2" itemClassName="h-20 w-full rounded-xl" />
          ) : null}
          {!isLoadingList && customers.length === 0 ? (
            <p className="text-sm text-slate-300">{t("common.empty")}</p>
          ) : (
            !isLoadingList &&
            customers.map((customer) => (
              <div key={customer.id} className="rounded-xl border border-surface-700 p-3">
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row">
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-slate-300">{customer.phone}</p>
                    {customer.address ? <p className="text-sm text-slate-400">{customer.address}</p> : null}
                    {customer.neighborhood ? (
                      <p className="text-sm text-slate-400">{`${t("customers.neighborhood")}: ${customer.neighborhood}`}</p>
                    ) : null}
                    {customer.email ? <p className="text-sm text-slate-400">{customer.email}</p> : null}
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <Button className="w-full sm:w-auto" variant="ghost" onClick={() => openEditModal(customer)}>
                      {t("common.edit")}
                    </Button>
                    <Button className="w-full sm:w-auto" variant="danger" onClick={() => setDeletingCustomer(customer)}>
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
          setEditingCustomer(null);
        }}
        title={t("customers.title")}
      >
        {error ? <p className="mb-2 text-sm text-red-300">{error}</p> : null}
        <CustomerForm
          onSubmit={handleSubmit}
          initialData={editingCustomer}
          submitLabel={editingCustomer ? t("common.save") : t("common.create")}
        />
      </Modal>

      <ConfirmDeleteModal
        open={Boolean(deletingCustomer)}
        onClose={() => setDeletingCustomer(null)}
        onConfirm={async () => {
          if (!deletingCustomer) return;
          await handleDelete(deletingCustomer);
        }}
        isLoading={isDeleting}
      />
    </>
  );
}
