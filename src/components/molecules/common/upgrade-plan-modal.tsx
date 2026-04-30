"use client";

import { CheckCircle2, Crown, Sparkles } from "lucide-react";

import { Button } from "@/components/atoms/button";
import { Modal } from "@/components/atoms/modal";
import { useI18n } from "@/i18n/provider";
import type { Locale } from "@/i18n/types";
import { planCatalog, type PlanDefinition } from "@/lib/plans";
import { useUiFeedbackStore } from "@/store/ui-feedback-store";

const localeMap: Record<Locale, string> = {
  "pt-br": "pt-BR",
  en: "en-US",
  es: "es-ES"
};

function formatPrice(priceCents: number, locale: Locale) {
  return new Intl.NumberFormat(localeMap[locale], {
    currency: "BRL",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(priceCents / 100);
}

function PlanOptionCard({
  benefits,
  limit,
  plan,
  tone
}: {
  benefits: string[];
  limit?: string;
  plan: PlanDefinition;
  tone: "essential" | "pro";
}) {
  const { locale, t } = useI18n();
  const Icon = tone === "pro" ? Crown : Sparkles;

  return (
    <article className="flex h-full flex-col rounded-xl2 border border-surface-700 bg-surface-950/60 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
          <p className="text-sm text-slate-400">{t(`upgrade.${plan.id}.summary`)}</p>
        </div>
        <span className="rounded-xl border border-accent-400/30 bg-accent-400/10 p-2 text-accent-300">
          <Icon size={18} aria-hidden="true" />
        </span>
      </div>

      <p className="mb-4 text-2xl font-bold text-white">
        {formatPrice(plan.priceCents, locale)}
        <span className="ml-1 text-sm font-medium text-slate-400">{t("upgrade.perMonth")}</span>
      </p>

      <ul className="space-y-2 text-sm text-slate-200">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-300" aria-hidden="true" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      {limit ? (
        <p className="mt-4 rounded-xl border border-surface-700 bg-surface-900 px-3 py-2 text-xs text-slate-300">
          {limit}
        </p>
      ) : null}
    </article>
  );
}

export function UpgradePlanModal() {
  const { t } = useI18n();
  const upgradeModal = useUiFeedbackStore((state) => state.upgradeModal);
  const closeUpgradeModal = useUiFeedbackStore((state) => state.closeUpgradeModal);

  return (
    <Modal open={upgradeModal.open} onClose={closeUpgradeModal} title={t("upgrade.title")}>
      <p className="mb-2 text-sm text-slate-300">{t("upgrade.subtitle")}</p>
      {upgradeModal.message ? <p className="mb-4 text-xs text-slate-500">{upgradeModal.message}</p> : null}

      <div className="grid gap-3 md:grid-cols-2">
        <PlanOptionCard
          plan={planCatalog.essential}
          tone="essential"
          benefits={[
            t("upgrade.essential.benefit.orders"),
            t("upgrade.essential.benefit.whatsapp"),
            t("upgrade.essential.benefit.cash"),
            t("upgrade.essential.benefit.support")
          ]}
          limit={t("upgrade.essential.limit")}
        />
        <PlanOptionCard
          plan={planCatalog.pro}
          tone="pro"
          benefits={[
            t("upgrade.pro.benefit.orders"),
            t("upgrade.pro.benefit.whatsapp"),
            t("upgrade.pro.benefit.cash"),
            t("upgrade.pro.benefit.support")
          ]}
        />
      </div>

      <div className="mt-4 flex justify-end">
        <Button variant="ghost" onClick={closeUpgradeModal}>
          {t("common.close")}
        </Button>
      </div>
    </Modal>
  );
}
