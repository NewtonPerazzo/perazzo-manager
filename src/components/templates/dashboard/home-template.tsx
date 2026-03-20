"use client";

import { Copy, Instagram, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";

import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Modal } from "@/components/atoms/modal";
import { ListSkeleton } from "@/components/molecules/common/list-skeleton";
import { StoreForm } from "@/components/molecules/store/store-form";
import { Switch } from "@/components/atoms/switch";
import { useUiFeedback } from "@/hooks/use-ui-feedback";
import { useI18n } from "@/i18n/provider";
import { buildBusinessHoursSummary, getTodayKey, normalizeBusinessHours } from "@/lib/store-hours";
import { storeService } from "@/services/resources/store-service";
import { useAuthStore } from "@/store/auth-store";
import { useUiFeedbackStore } from "@/store/ui-feedback-store";
import type { StoreCreatePayload, StoreResponse } from "@/types/api/store";

export function HomeTemplate({ initialStore }: { initialStore: StoreResponse | null }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const { runWithFeedback, toast } = useUiFeedback();
  const isSubmitting = useUiFeedbackStore((state) => Boolean(state.loadingByKey["store:submit"]));
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [store, setStore] = useState<StoreResponse | null>(initialStore);
  const [isLoadingStore, setIsLoadingStore] = useState(initialStore === null);

  useEffect(() => {
    async function loadStore() {
      if (!token) return;

      setIsLoadingStore(true);
      try {
        const response = await storeService.getMyStore(token);
        setStore(response);
      } catch {
        setStore(null);
      } finally {
        setIsLoadingStore(false);
      }
    }

    void loadStore();
  }, [token]);

  async function handleSubmit(payload: StoreCreatePayload) {
    if (!token) return;

    const result = await runWithFeedback(
      "store:submit",
      async () => {
        setError(null);
        if (store) {
          const updated = await storeService.updateStore(token, payload);
          setStore(updated);
        } else {
          const created = await storeService.createStore(token, payload);
          setStore(created);
        }
      },
      {
        successMessage: store ? t("common.updatedSuccess") : t("common.createdSuccess")
      }
    );

    if (!result.ok) {
      return;
    }
    setOpen(false);
    router.refresh();
  }

  function getCatalogUrl(slug?: string): string {
    if (!slug) return "";
    const envBase =
      process.env.NEXT_PUBLIC_CATALOG_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");
    return `${envBase.replace(/\/$/, "")}/catalog/${slug}`;
  }

  async function copyCatalogUrl(url: string) {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast(t("home.catalogLinkCopied"), "success");
    } catch {
      toast(t("common.unexpectedError"), "error");
    }
  }

  async function toggleTodayStoreOpen(nextOpen: boolean) {
    if (!token || !store) return;
    const result = await runWithFeedback(
      "store:submit",
      async () => {
        const hours = normalizeBusinessHours(store.business_hours);
        const today = getTodayKey();
        const day = hours[today];
        const payloadHours = {
          ...hours,
          [today]: {
            ...day,
            enabled: nextOpen
          }
        };
        const updated = await storeService.updateStorePartial(token, { business_hours: payloadHours });
        setStore(updated);
      },
      {
        successMessage: nextOpen ? t("store.openedSuccess") : t("store.closedSuccess")
      }
    );

    if (!result.ok) return;
    router.refresh();
  }

  return (
    <>
      <Card>
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white">{t("home.title")}</h1>
            <p className="text-sm text-slate-300">{t("home.subtitle")}</p>
          </div>
          <Button onClick={() => setOpen(true)} disabled={isSubmitting}>
            {store ? t("common.edit") : t("common.addNew")}
          </Button>
        </div>

        {isLoadingStore ? (
          <ListSkeleton items={4} className="space-y-2" itemClassName="h-12 w-full rounded-xl" />
        ) : store ? (
          <div className="space-y-1 text-sm text-slate-200 flex flex-col gap-2">
            <div className="mb-5 flex flex-col items-center justify-center gap-3">
              {store.logo ? (
                <Image
                  src={store.logo}
                  alt={store.name}
                  width={84}
                  height={84}
                  unoptimized
                  className="h-20 w-20 rounded-full border border-surface-700 object-cover"
                />
              ) : null}
              <p className="text-base font-semibold">{store.name}</p>
              {store.description && <p>{store.description}</p>}
              {store.has_catalog_active && store.slug ? (
                <div className="flex w-full flex-col items-start gap-2 rounded-lg border border-surface-700 px-3 py-2">
                  <a
                    href={getCatalogUrl(store.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full break-all text-sm text-accent-300 underline"
                    title={getCatalogUrl(store.slug)}
                  >
                    {getCatalogUrl(store.slug)}
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    className="self-center px-2 py-1"
                    onClick={() => void copyCatalogUrl(getCatalogUrl(store.slug))}
                  >
                    <span className="inline-flex items-center gap-1 text-xs">
                      <Copy size={14} />
                      {t("home.copy")}
                    </span>
                  </Button>
                  <label className="flex w-full items-center justify-center gap-2 text-xs text-slate-200">
                    <Switch checked={store.is_open_now} onChange={(value) => void toggleTodayStoreOpen(value)} />
                    {store.is_open_now ? t("store.closeStore") : t("store.openStore")}
                  </label>
                </div>
              ) : null}
            </div>
            {store.email && <p>{store.email}</p>}
            {store.phone && <p>{store.phone}</p>}
            {store.address && <p>{store.address}</p>}
            {store.instagram && (
              <p className="flex items-center gap-1">
                <span>{store.instagram}</span>
                <Instagram size={16} className="text-pink-400" />
              </p>
            )}
            {store.whatsapp && (
              <p className="flex items-center gap-1">
                <span>{store.whatsapp}</span>
                <MessageCircle size={16} className="text-emerald-400" />
              </p>
            )}
            {buildBusinessHoursSummary(store.business_hours, locale) ? (
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-sm text-slate-300">{buildBusinessHoursSummary(store.business_hours, locale)}</p>
                <p className="inline-flex items-center gap-2 text-sm">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${store.is_open_now ? "bg-emerald-400" : "bg-red-400"}`}
                  />
                  <span>{store.is_open_now ? t("store.openNow") : t("store.closedNow")}</span>
                </p>
              </div>
            ) : null}
            {store.color ? (
              <div className="mt-6 rounded-xl border border-surface-700 p-4">
                <p className="mb-2 text-sm font-medium text-slate-200">Tema:</p>
                <div className="pointer-events-none px-2 py-1 flex items-center justify-center">
                  <HexColorPicker color={store.color} onChange={() => {}} />
                </div>
              </div>
            ) : null}
            <p className="text-xs text-slate-400">
              {`${t("store.acceptSendOrderToWhatsapp")}: ${store.is_accepted_send_order_to_whatsapp ? "ON" : "OFF"}`}
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-300">{t("common.empty")}</p>
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={t("home.title")}>
        {error ? <p className="mb-2 text-sm text-red-300">{error}</p> : null}
        <StoreForm
          initialData={store}
          onSubmit={handleSubmit}
          submitLabel={store ? t("common.save") : t("common.create")}
        />
      </Modal>
    </>
  );
}
