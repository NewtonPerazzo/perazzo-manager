"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";

import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Modal } from "@/components/atoms/modal";
import { ConfirmDeleteModal } from "@/components/molecules/common/confirm-delete-modal";
import { ListSkeleton } from "@/components/molecules/common/list-skeleton";
import { WhatsappPhoneModal } from "@/components/molecules/common/whatsapp-phone-modal";
import { CashRegisterEntryForm } from "@/components/molecules/cash-register/cash-register-entry-form";
import { useUiFeedback } from "@/hooks/use-ui-feedback";
import { useI18n } from "@/i18n/provider";
import { hasValidWhatsapp, normalizePhone } from "@/lib/phone";
import { cashRegisterService } from "@/services/resources/cash-register-service";
import { storeService } from "@/services/resources/store-service";
import { useAuthStore } from "@/store/auth-store";
import { useUiFeedbackStore } from "@/store/ui-feedback-store";
import type {
  CashEntryType,
  CashPeriodView,
  CashRegisterEntryPayload,
  CashRegisterEntryResponse,
  CashRegisterSummaryResponse
} from "@/types/api/cash-register";

function formatMoney(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function todayDateInput(): string {
  return new Date().toISOString().slice(0, 10);
}

export function CashRegisterTemplate() {
  const { t } = useI18n();
  const token = useAuthStore((state) => state.token);
  const { runWithFeedback } = useUiFeedback();
  const isDeleting = useUiFeedbackStore((state) => Boolean(state.loadingByKey["cash-register:delete"]));

  const [targetDate, setTargetDate] = useState(todayDateInput());
  const [periodView, setPeriodView] = useState<CashPeriodView>("day");
  const [summary, setSummary] = useState<CashRegisterSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [entryType, setEntryType] = useState<CashEntryType>("entry");
  const [isProfit, setIsProfit] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CashRegisterEntryResponse | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<CashRegisterEntryResponse | null>(null);
  const [storeWhatsapp, setStoreWhatsapp] = useState("");
  const [openWhatsappModal, setOpenWhatsappModal] = useState(false);
  const [isSavingWhatsapp, setIsSavingWhatsapp] = useState(false);
  const isDayView = periodView === "day";

  const loadSummary = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await cashRegisterService.getSummary(token, targetDate, periodView);
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.unexpectedError"));
    } finally {
      setIsLoading(false);
    }
  }, [periodView, targetDate, t, token]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    async function loadStoreWhatsapp() {
      if (!token) return;
      try {
        const store = await storeService.getMyStore(token);
        setStoreWhatsapp(store.whatsapp ?? "");
      } catch {
        // Keep cash flow available even when store load fails.
      }
    }

    void loadStoreWhatsapp();
  }, [token]);

  const manualItems = useMemo(() => {
    if (!summary) return [];
    return [...summary.manual_entries, ...summary.manual_expenses, ...summary.profit_entries].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [summary]);

  async function handleSubmit(payload: CashRegisterEntryPayload) {
    if (!token) return;

    const result = await runWithFeedback(
      "cash-register:save",
      async () => {
        if (editingEntry) {
          await cashRegisterService.updateEntry(token, editingEntry.id, payload);
        } else {
          await cashRegisterService.createEntry(token, payload);
        }
      },
      {
        successMessage: editingEntry ? t("common.updatedSuccess") : t("common.createdSuccess")
      }
    );

    if (!result.ok) return;

    setOpen(false);
    setEditingEntry(null);
    await loadSummary();
  }

  function openCreate(type: CashEntryType, profit = false) {
    setEntryType(type);
    setIsProfit(profit);
    setEditingEntry(null);
    setOpen(true);
  }

  function openEdit(entry: CashRegisterEntryResponse) {
    setEntryType(entry.entry_type);
    setIsProfit(Boolean(entry.is_profit));
    setEditingEntry(entry);
    setOpen(true);
  }

  async function handleDelete(entry: CashRegisterEntryResponse) {
    if (!token) return;

    const result = await runWithFeedback(
      "cash-register:delete",
      async () => {
        await cashRegisterService.deleteEntry(token, entry.id);
      },
      {
        successMessage: t("common.deletedSuccess")
      }
    );

    if (!result.ok) return;
    setDeletingEntry(null);
    await loadSummary();
  }

  function buildSummaryMessage(): string {
    if (!summary) return "";

    const periodText = summary.period_view === "day"
      ? summary.target_date
      : `${summary.period_start} - ${summary.period_end}`;

    return [
      `Resumo de caixa (${periodText})`,
      "------------------------------",
      `Pedidos do dia: ${formatMoney(summary.totals.auto_entries)}`,
      `Total com entrega: ${formatMoney(summary.totals.auto_entries_with_delivery)}`,
      `Entradas: ${formatMoney(summary.totals.manual_entries)}`,
      `Total entradas: ${formatMoney(summary.totals.entries_total)}`,
      `Total saídas: ${formatMoney(summary.totals.expenses_total)}`,
      `Lucro retirado: ${formatMoney(summary.totals.profits_total)}`,
      `Saldo: ${formatMoney(summary.totals.balance)}`
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
      setOpenWhatsappModal(true);
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
      setOpenWhatsappModal(false);
      openWhatsappSummary();
    } finally {
      setIsSavingWhatsapp(false);
    }
  }

  return (
    <>
      <Card className="overflow-x-hidden">
        <div className="mb-4 flex flex-col gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white">{t("cashRegister.title")}</h1>
            <p className="text-sm text-slate-300">{t("cashRegister.subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <select
              value={periodView}
              onChange={(event) => setPeriodView(event.target.value as CashPeriodView)}
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
              className="w-full"
            />
            <Button type="button" variant="ghost" className="w-full" onClick={() => openCreate("entry")}>
              {t("cashRegister.addEntry")}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => openCreate("expense")}>
              {t("cashRegister.addExpense")}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => openCreate("expense", true)}>
              {t("cashRegister.addProfit")}
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
          <ListSkeleton items={5} className="space-y-2" itemClassName="h-20 w-full rounded-xl" />
        ) : null}

        {!isLoading && summary ? (
          <div className="space-y-4">
            {isDayView ? (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-7">
                <div className="rounded-xl border border-surface-700 p-3">
                  <p className="text-xs text-slate-400">{t("cashRegister.autoEntries")}</p>
                  <p className="text-base font-semibold text-white">{formatMoney(summary.totals.auto_entries)}</p>
                </div>
                <div className="rounded-xl border border-surface-700 p-3">
                  <p className="text-xs text-slate-400">{t("cashRegister.totalWithDelivery")}</p>
                  <p className="text-base font-semibold text-white">
                    {formatMoney(summary.totals.auto_entries_with_delivery)}
                  </p>
                </div>
                <div className="rounded-xl border border-surface-700 p-3">
                  <p className="text-xs text-slate-400">{t("cashRegister.manualEntries")}</p>
                  <p className="text-base font-semibold text-white">{formatMoney(summary.totals.manual_entries)}</p>
                </div>
                <div className="rounded-xl border border-surface-700 p-3">
                  <p className="text-xs text-slate-400">{t("cashRegister.entriesTotal")}</p>
                  <p className="text-base font-semibold text-emerald-300">{formatMoney(summary.totals.entries_total)}</p>
                </div>
                <div className="rounded-xl border border-surface-700 p-3">
                  <p className="text-xs text-slate-400">{t("cashRegister.expensesTotal")}</p>
                  <p className="text-base font-semibold text-red-300">{formatMoney(summary.totals.expenses_total)}</p>
                </div>
                <div className="rounded-xl border border-surface-700 p-3">
                  <p className="text-xs text-slate-400">{t("cashRegister.profitsTotal")}</p>
                  <p className="text-base font-semibold text-amber-300">{formatMoney(summary.totals.profits_total)}</p>
                </div>
                <div className="rounded-xl border border-surface-700 p-3">
                  <p className="text-xs text-slate-400">{t("cashRegister.balance")}</p>
                  <p className="text-base font-semibold text-accent-400">{formatMoney(summary.totals.balance)}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <div className="rounded-xl border border-surface-700 p-3">
                  <p className="text-xs text-slate-400">{t("cashRegister.entriesTotal")}</p>
                  <p className="text-base font-semibold text-emerald-300">{formatMoney(summary.totals.entries_total)}</p>
                </div>
                <div className="rounded-xl border border-surface-700 p-3">
                  <p className="text-xs text-slate-400">{t("cashRegister.expensesTotal")}</p>
                  <p className="text-base font-semibold text-red-300">{formatMoney(summary.totals.expenses_total)}</p>
                </div>
                <div className="rounded-xl border border-surface-700 p-3">
                  <p className="text-xs text-slate-400">{t("cashRegister.profitsTotal")}</p>
                  <p className="text-base font-semibold text-amber-300">{formatMoney(summary.totals.profits_total)}</p>
                </div>
              </div>
            )}

            {isDayView ? (
              <>
                <div className="rounded-xl border border-surface-700 p-3">
                  <h2 className="mb-2 text-sm font-semibold text-white">{t("cashRegister.ordersOfDay")}</h2>
                  {summary.auto_entries.length === 0 ? (
                    <p className="text-sm text-slate-400">{t("common.empty")}</p>
                  ) : (
                    <div className="space-y-2">
                      {summary.auto_entries.map((item, index) => (
                        <div key={`${item.name}-${index}`} className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-surface-700 px-3 py-2">
                          <p className="min-w-0 break-words text-sm text-slate-100">{item.name}</p>
                          <p className="text-sm font-semibold text-emerald-300">{formatMoney(item.amount)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-surface-700 p-3">
                  <h2 className="mb-2 text-sm font-semibold text-white">{t("cashRegister.byPaymentMethod")}</h2>
                  {summary.by_payment_method.length === 0 ? (
                    <p className="text-sm text-slate-400">{t("common.empty")}</p>
                  ) : (
                    <div className="space-y-2">
                      {summary.by_payment_method.map((item) => (
                        <div
                          key={item.payment_method}
                          className="grid grid-cols-1 gap-2 rounded-lg border border-surface-700 px-3 py-2 text-sm md:grid-cols-4"
                        >
                          <p className="break-words font-medium text-slate-100">{item.payment_method}</p>
                          <p className="text-emerald-300">{`${t("cashRegister.in")}: ${formatMoney(item.entries)}`}</p>
                          <p className="text-red-300">{`${t("cashRegister.out")}: ${formatMoney(item.expenses)}`}</p>
                          <p className="text-accent-400">{`${t("cashRegister.net")}: ${formatMoney(item.net)}`}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-surface-700 p-3">
                  <h2 className="mb-2 text-sm font-semibold text-white">{t("cashRegister.manualLaunches")}</h2>
                  {manualItems.length === 0 ? (
                    <p className="text-sm text-slate-400">{t("common.empty")}</p>
                  ) : (
                    <div className="space-y-2">
                      {manualItems.map((entry) => (
                        <div key={entry.id} className="rounded-lg border border-surface-700 p-3">
                          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                            <div>
                              <p className="text-sm font-semibold text-slate-100">{entry.name}</p>
                              <p className="text-xs text-slate-400">
                                {entry.is_profit
                                  ? t("cashRegister.profit")
                                  : (entry.entry_type === "entry" ? t("cashRegister.entry") : t("cashRegister.expense"))}
                                {entry.payment_method ? ` • ${entry.payment_method}` : ""}
                              </p>
                              {entry.note ? <p className="text-xs text-slate-400">{entry.note}</p> : null}
                            </div>
                            <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-between">
                              <p className={`text-sm font-semibold ${entry.entry_type === "entry" ? "text-emerald-300" : (entry.is_profit ? "text-amber-300" : "text-red-300")}`}>
                                {formatMoney(entry.amount)}
                              </p>
                              <Button type="button" variant="ghost" onClick={() => openEdit(entry)}>
                                {t("common.edit")}
                              </Button>
                              <Button type="button" variant="danger" onClick={() => setDeletingEntry(entry)}>
                                {t("common.delete")}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </Card>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditingEntry(null);
        }}
        title={
          editingEntry
            ? t("cashRegister.editLaunch")
            : isProfit
              ? t("cashRegister.addProfit")
              : entryType === "entry"
                ? t("cashRegister.addEntry")
                : t("cashRegister.addExpense")
        }
      >
        <CashRegisterEntryForm
          type={entryType}
          initialData={editingEntry}
          fixedDate={targetDate}
          isProfit={isProfit}
          onSubmit={handleSubmit}
          submitLabel={editingEntry ? t("common.save") : t("common.create")}
        />
      </Modal>

      <ConfirmDeleteModal
        open={Boolean(deletingEntry)}
        onClose={() => setDeletingEntry(null)}
        onConfirm={async () => {
          if (!deletingEntry) return;
          await handleDelete(deletingEntry);
        }}
        isLoading={isDeleting}
      />

      <WhatsappPhoneModal
        open={openWhatsappModal}
        title={t("cashRegister.storeWhatsappModalTitle")}
        description={t("cashRegister.storeWhatsappModalDescription")}
        initialValue={storeWhatsapp}
        isLoading={isSavingWhatsapp}
        onCancel={() => setOpenWhatsappModal(false)}
        onConfirm={handleConfirmStoreWhatsapp}
      />
    </>
  );
}
