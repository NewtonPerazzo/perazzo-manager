"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { LocaleSelect } from "@/components/molecules/common/locale-select";
import { SidebarNav } from "@/components/molecules/navigation/sidebar-nav";
import { ToastViewport } from "@/components/molecules/common/toast-viewport";
import { UpgradePlanModal } from "@/components/molecules/common/upgrade-plan-modal";
import { UserAvatar } from "@/components/atoms/user-avatar";
import { useI18n } from "@/i18n/provider";
import { DashboardTopbar } from "@/components/organisms/dashboard-topbar";
import { getPlan, type PlanId } from "@/lib/plans";
import { useAuthStore } from "@/store/auth-store";

export function ClientShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userName = useAuthStore((state) => state.userName);
  const userPhoto = useAuthStore((state) => state.userPhoto);
  const userPlan = useAuthStore((state) => state.userPlan);

  return (
    <div className="min-h-screen bg-surface-950 bg-atmosphere text-white">
      <DashboardTopbar onToggleMenu={() => setMobileMenuOpen((prev) => !prev)} />

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <aside
            className="relative flex h-full w-72 flex-col overflow-y-auto border-r border-surface-700 bg-surface-900 p-4 pb-8 pt-24 shadow-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start gap-3">
              <div className="flex min-w-0 items-start gap-2">
                {userName && <UserAvatar name={userName} photo={userPhoto} size="sm" />}
                {userName ? (
                  <div className="min-w-0 pt-0.5 flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-100">{userName}</p>
                    <PlanBadge plan={userPlan} label={t("plans.current")} className="mt-1" />
                  </div>
                ) : null}
              </div>
            </div>
            <div className="min-h-0 flex-1 pb-6">
              <SidebarNav onNavigate={() => setMobileMenuOpen(false)} />
              <div className="mt-3 flex justify-end">
                <LocaleSelect className="shrink-0 rounded-xl border border-surface-700 bg-surface-800 px-2 py-2 text-sm text-white" />
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      <div className="mx-auto grid max-w-7xl gap-4 px-3 pb-3 pt-24 md:grid-cols-[240px,1fr] md:px-6 md:pb-6 md:pt-24">
        <aside className="hidden rounded-xl2 border border-surface-700 bg-surface-900/85 p-3 shadow-panel backdrop-blur md:sticky md:top-24 md:block md:h-fit">
          {userName ? (
            <div className="mb-3 flex min-w-0 items-center gap-2">
              <p className="truncate text-sm font-semibold text-slate-100">{userName}</p>
              <PlanBadge plan={userPlan} label={t("plans.current")} />
            </div>
          ) : null}
          <SidebarNav />
        </aside>

        <section>{children}</section>
      </div>

      <ToastViewport />
      <UpgradePlanModal />
    </div>
  );
}

function PlanBadge({ className, label, plan }: { className?: string; label: string; plan: PlanId }) {
  const currentPlan = getPlan(plan);

  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center rounded-full border border-accent-400/30 bg-accent-400/10 px-2 py-0.5 text-[11px] font-semibold uppercase text-accent-300 ${className ?? ""}`}
      title={`${label}: ${currentPlan.name}`}
    >
      {currentPlan.name}
    </span>
  );
}
