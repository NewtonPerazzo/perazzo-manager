"use client";

import { MessageCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Modal } from "@/components/atoms/modal";
import { ConfirmDeleteModal } from "@/components/molecules/common/confirm-delete-modal";
import { ListSkeleton } from "@/components/molecules/common/list-skeleton";
import { WhatsappPhoneModal } from "@/components/molecules/common/whatsapp-phone-modal";
import { CourierAdjustmentForm } from "@/components/molecules/courier/courier-adjustment-form";
import { CourierForm } from "@/components/molecules/courier/courier-form";
import { useUiFeedback } from "@/hooks/use-ui-feedback";
import { useI18n } from "@/i18n/provider";
import { hasValidWhatsapp, normalizePhone } from "@/lib/phone";
import { courierService } from "@/services/resources/courier-service";
import { storeService } from "@/services/resources/store-service";
import { useAuthStore } from "@/store/auth-store";
import { useUiFeedbackStore } from "@/store/ui-feedback-store";
import type {
  CourierAdjustmentResponse,
  CourierAdjustmentType,
  CourierPayload,
  CourierPeriodView,
  CourierResponse,
  CourierSummaryResponse
} from "@/types/api/courier";

const PAGE_SIZE = 10;

function formatMoney(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function todayDateInput(): string {
  return new Date().toISOString().slice(0, 10);
}

export function CouriersTemplate() {
  const { t } = useI18n();
  const token = useAuthStore((state) => state.token);
  const { runWithFeedback } = useUiFeedback();
  const isSavingCourier = useUiFeedbackStore((state) => Boolean(state.loadingByKey["couriers:save"]));
  const isDeletingCourier = useUiFeedbackStore((state) => Boolean(state.loadingByKey["couriers:delete"]));
  const isSavingAdjustment = useUiFeedbackStore((state) => Boolean(state.loadingByKey["couriers:adjustment"]));
  const isDeletingAdjustment = useUiFeedbackStore((state) => Boolean(state.loadingByKey["couriers:adjustment-delete"]));

  const [targetDate, setTargetDate] = useState(todayDateInput());
  const [periodView, setPeriodView] = useState<CourierPeriodView>("day");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [couriers, setCouriers] = useState<CourierResponse[]>([]);
  const [summary, setSummary] = useState<CourierSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [storeWhatsapp, setStoreWhatsapp] = useState("");
  const [openStoreWhatsappModal, setOpenStoreWhatsappModal] = useState(false);
  const [isSavingWhatsapp, setIsSavingWhatsapp] = useState(false);

  const [openCourierModal, setOpenCourierModal] = useState(false);
  const [editingCourier, setEditingCourier] = useState<CourierResponse | null>(null);
  const [deletingCourier, setDeletingCourier] = useState<CourierResponse | null>(null);

  const [openAdjustmentModal, setOpenAdjustmentModal] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<CourierAdjustmentType>("add");
  const [deletingAdjustment, setDeletingAdjustment] = useState<CourierAdjustmentResponse | null>(null);

  const hasPreviousPage = page > 1;
  const hasNextPage = page * PAGE_SIZE < total;

  const loadData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const [couriersResponse, summaryResponse] = await Promise.all([
        courierService.list(token, {
          skip: (page - 1) * PAGE_SIZE,
          limit: PAGE_SIZE,
          search: searchTerm || undefined
        }),
        courierService.summary(token, targetDate, periodView)
      ]);
      setCouriers(couriersResponse.items);
      setTotal(couriersResponse.total);
      setSummary(summaryResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.unexpectedError"));
    } finally {
      setIsLoading(false);
    }
  }, [page, periodView, searchTerm, t, targetDate, token]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadData();
    }, 500);
    return () => clearTimeout(timeout);
  }, [loadData]);

  useEffect(() => {
    async function loadStoreWhatsapp() {
      if (!token) return;
      try {
        const store = await storeService.getMyStore(token);
        setStoreWhatsapp(store.whatsapp ?? "");
      } catch {
        // ignore
      }
    }
    void loadStoreWhatsapp();
  }, [token]);

  const allRidersForForm = useMemo(() => {
    if (!summary) return couriers;
    return summary.riders
      .map((item) => item.courier)
      .filter((item): item is CourierResponse => Boolean(item));
  }, [couriers, summary]);

  async function handleSubmitCourier(payload: CourierPayload) {
    if (!token) return;
    const result = await runWithFeedback(
      "couriers:save",
      async () => {
        if (editingCourier) {
          await courierService.update(token, editingCourier.id, payload);
        } else {
          await courierService.create(token, payload);
        }
      },
      {
        successMessage: editingCourier ? t("common.updatedSuccess") : t("common.createdSuccess")
      }
    );
    if (!result.ok) return;
    setOpenCourierModal(false);
    setEditingCourier(null);
    await loadData();
  }

  async function handleDeleteCourier() {
    if (!token || !deletingCourier) return;
    const result = await runWithFeedback(
      "couriers:delete",
      async () => {
        await courierService.remove(token, deletingCourier.id);
      },
      { successMessage: t("common.deletedSuccess") }
    );
    if (!result.ok) return;
    setDeletingCourier(null);
    await loadData();
  }

  async function handleCreateAdjustment(payload: {
    adjustment_type: CourierAdjustmentType;
    amount: number;
    courier_id?: string | null;
    payment_method?: string | null;
    note?: string | null;
    occurred_on?: string | null;
  }) {
    if (!token) return;
    const result = await runWithFeedback(
      "couriers:adjustment",
      async () => {
        await courierService.addAdjustment(token, payload);
      },
      {
        successMessage: t("common.createdSuccess")
      }
    );
    if (!result.ok) return;
    setOpenAdjustmentModal(false);
    await loadData();
  }

  async function handleDeleteAdjustment() {
    if (!token || !deletingAdjustment) return;
    const result = await runWithFeedback(
      "couriers:adjustment-delete",
      async () => {
        await courierService.deleteAdjustment(token, deletingAdjustment.id);
      },
      { successMessage: t("common.deletedSuccess") }
    );
    if (!result.ok) return;
    setDeletingAdjustment(null);
    await loadData();
  }

  function buildSummaryMessage(): string {
    if (!summary) return "";
    const periodText = summary.period_view === "day"
      ? summary.target_date
      : `${summary.period_start} - ${summary.period_end}`;
    return [
      `${t("couriers.title")} (${periodText})`,
      "------------------------------",
      `${t("couriers.totalDeliveries")}: ${summary.totals.deliveries_count}`,
      `${t("couriers.deliveryValue")}: ${formatMoney(summary.totals.deliveries_amount)}`,
      `${t("couriers.adjustments")}: ${formatMoney(summary.totals.adjustments_total)}`,
      `${t("couriers.totalEarnings")}: ${formatMoney(summary.totals.total_earnings)}`
    ].join("\n");
  }

  function openWhatsappSummary() {
    if (!summary) return;
    const to = normalizePhone(storeWhatsapp);
    if (!to) return;
    const message = buildSummaryMessage();
    const url = `https://wa.me/${to}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleSendSummaryWhatsapp() {
    if (!hasValidWhatsapp(storeWhatsapp)) {
      setOpenStoreWhatsappModal(true);
      return;
    }
    openWhatsappSummary();
  }

  async function handleConfirmStoreWhatsapp(phone: string) {
    if (!token) return;
    try {
      setIsSavingWhatsapp(true);
      const normalized = normalizePhone(phone);
      await storeService.updateStorePartial(token, { whatsapp: normalized });
      setStoreWhatsapp(normalized);
      setOpenStoreWhatsappModal(false);
      openWhatsappSummary();
    } finally {
      setIsSavingWhatsapp(false);
    }
  }

  return (
    <>
      <Card className="overflow-x-hidden">
        <div className="mb-4 grid gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white">{`${t("couriers.title")} - ${total}`}</h1>
            <p className="text-sm text-slate-300">{t("couriers.subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-6">
            <select
              value={periodView}
              onChange={(event) => setPeriodView(event.target.value as CourierPeriodView)}
              className="w-full rounded-xl border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-white outline-none focus:border-accent-500"
            >
              <option value="day">{t("cashRegister.viewDay")}</option>
              <option value="week">{t("cashRegister.viewWeek")}</option>
              <option value="month">{t("cashRegister.viewMonth")}</option>
              <option value="year">{t("cashRegister.viewYear")}</option>
            </select>
            <Input
              type="date"
              value={targetDate}
              onChange={(event) => setTargetDate(event.target.value || todayDateInput())}
            />
            <Input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
              placeholder={t("common.search")}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditingCourier(null);
                setOpenCourierModal(true);
              }}
            >
              {t("couriers.addRider")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setAdjustmentType("add");
                setOpenAdjustmentModal(true);
              }}
            >
              {t("couriers.addValue")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setAdjustmentType("remove");
                setOpenAdjustmentModal(true);
              }}
            >
              {t("couriers.removeValue")}
            </Button>
          </div>
          <div>
            <Button type="button" className="w-full sm:w-auto" onClick={handleSendSummaryWhatsapp}>
              <span className="inline-flex items-center gap-2">
                <MessageCircle size={16} />
                {t("orders.sendWhatsapp")}
              </span>
            </Button>
          </div>
        </div>

        {error ? <p className="mb-3 text-sm text-red-300">{error}</p> : null}
        {isLoading ? (
          <ListSkeleton items={6} className="space-y-2" itemClassName="h-20 w-full rounded-xl" />
        ) : null}

        {!isLoading && summary ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-surface-700 p-3">
                <p className="text-xs text-slate-400">{t("couriers.totalDeliveries")}</p>
                <p className="text-base font-semibold text-white">{summary.totals.deliveries_count}</p>
              </div>
              <div className="rounded-xl border border-surface-700 p-3">
                <p className="text-xs text-slate-400">{t("couriers.deliveryValue")}</p>
                <p className="text-base font-semibold text-white">{formatMoney(summary.totals.deliveries_amount)}</p>
              </div>
              <div className="rounded-xl border border-surface-700 p-3">
                <p className="text-xs text-slate-400">{t("couriers.adjustments")}</p>
                <p className="text-base font-semibold text-amber-300">{formatMoney(summary.totals.adjustments_total)}</p>
              </div>
              <div className="rounded-xl border border-surface-700 p-3">
                <p className="text-xs text-slate-400">{t("couriers.totalEarnings")}</p>
                <p className="text-base font-semibold text-accent-400">{formatMoney(summary.totals.total_earnings)}</p>
              </div>
            </div>

            <div className="rounded-xl border border-surface-700 p-3">
              <h2 className="mb-2 text-sm font-semibold text-white">{t("couriers.ridersBreakdown")}</h2>
              <div className="space-y-2">
                {summary.riders.map((item) => (
                  <div key={item.courier?.id ?? "none"} className="rounded-lg border border-surface-700 p-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{item.courier?.name}</p>
                        {item.courier?.address ? (
                          <p className="text-xs text-slate-400">{item.courier.address}</p>
                        ) : null}
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setEditingCourier(item.courier ?? null);
                            setOpenCourierModal(true);
                          }}
                        >
                          {t("common.edit")}
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          className="text-white"
                          onClick={() => setDeletingCourier(item.courier ?? null)}
                        >
                          {t("common.delete")}
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                      <p className="text-slate-200">{`${t("couriers.totalDeliveries")}: ${item.totals.deliveries_count}`}</p>
                      <p className="text-slate-200">{`${t("couriers.deliveryValue")}: ${formatMoney(item.totals.deliveries_amount)}`}</p>
                      <p className="text-slate-200">{`${t("couriers.adjustments")}: ${formatMoney(item.totals.adjustments_total)}`}</p>
                      <p className="text-accent-300">{`${t("couriers.totalEarnings")}: ${formatMoney(item.totals.total_earnings)}`}</p>
                    </div>
                  </div>
                ))}
                {summary.unassigned.totals.deliveries_count > 0 ? (
                  <div className="rounded-lg border border-surface-700 p-3">
                    <p className="text-sm font-semibold text-slate-100">{t("couriers.unassigned")}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                      <p className="text-slate-200">{`${t("couriers.totalDeliveries")}: ${summary.unassigned.totals.deliveries_count}`}</p>
                      <p className="text-slate-200">{`${t("couriers.deliveryValue")}: ${formatMoney(summary.unassigned.totals.deliveries_amount)}`}</p>
                      <p className="text-slate-200">{`${t("couriers.adjustments")}: ${formatMoney(summary.unassigned.totals.adjustments_total)}`}</p>
                      <p className="text-accent-300">{`${t("couriers.totalEarnings")}: ${formatMoney(summary.unassigned.totals.total_earnings)}`}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-xl border border-surface-700 p-3">
              <h2 className="mb-2 text-sm font-semibold text-white">{t("cashRegister.manualLaunches")}</h2>
              {summary.adjustments.length === 0 ? (
                <p className="text-sm text-slate-400">{t("common.empty")}</p>
              ) : (
                <div className="space-y-2">
                  {summary.adjustments.map((item) => (
                    <div key={item.id} className="rounded-lg border border-surface-700 p-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-100">
                            {item.adjustment_type === "add" ? t("couriers.addValue") : t("couriers.removeValue")}
                          </p>
                          <p className="text-xs text-slate-400">
                            {item.courier?.name ?? t("couriers.unassigned")}
                          </p>
                        </div>
                        <p className={item.adjustment_type === "add" ? "text-sm font-semibold text-emerald-300" : "text-sm font-semibold text-red-300"}>
                          {`${item.adjustment_type === "add" ? "+" : "-"} ${formatMoney(item.amount)}`}
                        </p>
                      </div>
                      <div className="mt-2 flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                        <p>{item.occurred_on}</p>
                        <Button
                          type="button"
                          variant="danger"
                          className="text-white sm:w-auto"
                          onClick={() => setDeletingAdjustment(item)}
                        >
                          {t("common.delete")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={!hasPreviousPage}
              >
                {t("common.previous")}
              </Button>
              <p className="text-sm text-slate-300">{`${t("common.page")} ${page}`}</p>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={!hasNextPage}
              >
                {t("common.next")}
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      <Modal
        open={openCourierModal}
        onClose={() => {
          if (isSavingCourier) return;
          setOpenCourierModal(false);
          setEditingCourier(null);
        }}
        title={editingCourier ? t("common.edit") : t("couriers.addRider")}
      >
        <CourierForm
          onSubmit={handleSubmitCourier}
          initialData={editingCourier}
          submitLabel={editingCourier ? t("common.save") : t("common.create")}
        />
      </Modal>

      <Modal
        open={openAdjustmentModal}
        onClose={() => {
          if (isSavingAdjustment) return;
          setOpenAdjustmentModal(false);
        }}
        title={adjustmentType === "add" ? t("couriers.addValue") : t("couriers.removeValue")}
      >
        <CourierAdjustmentForm
          onSubmit={handleCreateAdjustment}
          adjustmentType={adjustmentType}
          couriers={allRidersForForm}
          submitLabel={t("common.create")}
        />
      </Modal>

      <ConfirmDeleteModal
        open={Boolean(deletingCourier)}
        onClose={() => setDeletingCourier(null)}
        onConfirm={handleDeleteCourier}
        isLoading={isDeletingCourier}
      />

      <ConfirmDeleteModal
        open={Boolean(deletingAdjustment)}
        onClose={() => setDeletingAdjustment(null)}
        onConfirm={handleDeleteAdjustment}
        isLoading={isDeletingAdjustment}
      />

      <WhatsappPhoneModal
        open={openStoreWhatsappModal}
        title={t("orders.storeWhatsappModalTitle")}
        description={t("orders.storeWhatsappModalDescription")}
        initialValue={storeWhatsapp}
        isLoading={isSavingWhatsapp}
        onCancel={() => setOpenStoreWhatsappModal(false)}
        onConfirm={handleConfirmStoreWhatsapp}
      />
    </>
  );
}
