"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { SidebarNav } from "@/components/molecules/navigation/sidebar-nav";
import { ToastViewport } from "@/components/molecules/common/toast-viewport";
import { useI18n } from "@/i18n/provider";
import { DashboardTopbar } from "@/components/organisms/dashboard-topbar";
import { useAuthStore } from "@/store/auth-store";

export function ClientShell({ children }: { children: ReactNode }) {
  const { locale, setLocale, t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userName = useAuthStore((state) => state.userName);

  return (
    <div className="min-h-screen bg-surface-950 bg-atmosphere text-white">
      <DashboardTopbar onToggleMenu={() => setMobileMenuOpen((prev) => !prev)} />

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <aside
            className="relative h-full w-72 border-r border-surface-700 bg-surface-900 p-4 pt-20 shadow-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              {userName && <p className="text-sm font-semibold text-slate-100">{userName}</p>}
            </div>
            <SidebarNav onNavigate={() => setMobileMenuOpen(false)} />
            <div className="absolute bottom-4 right-4">
              <select
                value={locale}
                onChange={(event) => setLocale(event.target.value as typeof locale)}
                className="rounded-xl border border-surface-700 bg-surface-800 px-2 py-2 text-sm text-white"
                aria-label={t("common.locale")}
              >
                <option value="pt-br">PT-BR</option>
                <option value="en">EN</option>
                <option value="es">ES</option>
              </select>
            </div>
          </aside>
        </div>
      ) : null}

      <div className="mx-auto grid max-w-7xl gap-4 px-3 pb-3 pt-24 md:grid-cols-[240px,1fr] md:px-6 md:pb-6 md:pt-24">
        <aside className="hidden rounded-xl2 border border-surface-700 bg-surface-900/85 p-3 shadow-panel backdrop-blur md:sticky md:top-24 md:block md:h-fit">
          {userName && <p className="mb-3 text-sm font-semibold text-slate-100">{userName}</p>}
          <SidebarNav />
        </aside>

        <section>{children}</section>
      </div>

      <ToastViewport />
    </div>
  );
}
