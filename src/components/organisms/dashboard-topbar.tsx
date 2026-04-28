"use client";

import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/atoms/button";
import { UserAvatar } from "@/components/atoms/user-avatar";
import { useI18n } from "@/i18n/provider";
import { authService } from "@/services/resources/auth-service";
import { sessionService } from "@/services/resources/session-service";
import { useAuthStore } from "@/store/auth-store";
import { useCatalogCartStore } from "@/store/catalog-cart-store";

export function DashboardTopbar({ onToggleMenu }: { onToggleMenu: () => void }) {
  const router = useRouter();
  const { locale, setLocale, t } = useI18n();
  const token = useAuthStore((state) => state.token);
  const userName = useAuthStore((state) => state.userName);
  const userPhoto = useAuthStore((state) => state.userPhoto);
  const setUser = useAuthStore((state) => state.setUser);
  const clearToken = useAuthStore((state) => state.clearToken);
  const resetCatalogSession = useCatalogCartStore((state) => state.resetSession);
  const [isSessionValid, setIsSessionValid] = useState(false);

  useEffect(() => {
    let active = true;

    async function validateSession() {
      if (!token) {
        setIsSessionValid(false);
        return;
      }

      try {
        const me = await authService.getMe(token);
        if (!active) return;
        const fullName = [me.name, me.last_name].filter(Boolean).join(" ").trim();
        setUser(fullName || me.email, me.email, me.photo);
        setIsSessionValid(true);
      } catch (error) {
        if (!active) return;
        setIsSessionValid(false);

        const isUnauthorized = error instanceof Error && error.message.includes("401");
        if (isUnauthorized) {
          clearToken();
          resetCatalogSession();
          await sessionService.clearToken();
        }
      }
    }

    void validateSession();

    return () => {
      active = false;
    };
  }, [clearToken, resetCatalogSession, setUser, token]);

  async function handleLogout() {
    clearToken();
    resetCatalogSession();
    await sessionService.clearToken();
    router.push("/login");
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-surface-700 bg-surface-900/95 px-3 py-3 backdrop-blur md:px-6">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleMenu}
            className="rounded-xl border border-surface-700 p-2 text-slate-200 hover:bg-surface-800 md:hidden"
            aria-label="open-menu"
          >
            <Menu size={18} />
          </button>
          {token && isSessionValid ? (
            <UserAvatar name={userName} photo={userPhoto} size="md" className="hidden md:grid" />
          ) : null}
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">{t("app.name")}</p>
            {token && isSessionValid ? (
              <p className="flex items-center gap-2 text-sm text-slate-100">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                {`${userName ?? "User"} - ${t("status.connected")}`}
              </p>
            ) : (
              <p className="flex items-center gap-2 text-sm text-slate-100">
                <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
                {t("status.disconnected")}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={locale}
            onChange={(event) => setLocale(event.target.value as typeof locale)}
            className="hidden rounded-xl border border-surface-700 bg-surface-800 px-2 py-2 text-sm text-white md:block"
            aria-label={t("common.locale")}
          >
            <option value="pt-br">PT-BR</option>
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
          <Button variant="ghost" onClick={handleLogout}>
            {t("common.logout")}
          </Button>
        </div>
      </div>
    </header>
  );
}
