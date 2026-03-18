"use client";

import { Instagram, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";

import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Modal } from "@/components/atoms/modal";
import { ListSkeleton } from "@/components/molecules/common/list-skeleton";
import { StoreForm } from "@/components/molecules/store/store-form";
import { useUiFeedback } from "@/hooks/use-ui-feedback";
import { useI18n } from "@/i18n/provider";
import { storeService } from "@/services/resources/store-service";
import { useAuthStore } from "@/store/auth-store";
import { useUiFeedbackStore } from "@/store/ui-feedback-store";
import type { StoreCreatePayload, StoreResponse } from "@/types/api/store";

export function HomeTemplate({ initialStore }: { initialStore: StoreResponse | null }) {
  const { t } = useI18n();
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const { runWithFeedback } = useUiFeedback();
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
