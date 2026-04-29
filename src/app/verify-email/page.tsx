"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Card } from "@/components/atoms/card";
import { LocaleSelect } from "@/components/molecules/common/locale-select";
import { useI18n } from "@/i18n/provider";
import { authService } from "@/services/resources/auth-service";

function VerifyEmailPageContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">(token ? "loading" : "error");

  useEffect(() => {
    if (!token) return;

    let active = true;

    async function verify() {
      try {
        await authService.verifyEmail(token);
        if (active) setStatus("success");
      } catch {
        if (active) setStatus("error");
      }
    }

    void verify();

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-950 bg-atmosphere p-4">
      <Card className="w-full max-w-md">
        <div className="mb-3 flex justify-end">
          <LocaleSelect />
        </div>
        <h1 className="text-2xl font-semibold text-white">{t("auth.verifyEmailTitle")}</h1>
        <p className="mt-2 text-sm text-slate-300">
          {status === "loading" ? t("common.loading") : null}
          {status === "success" ? t("auth.verifyEmailSuccess") : null}
          {status === "error" ? t("auth.verifyEmailError") : null}
        </p>
        <Link className="mt-5 inline-flex text-sm text-accent-400 hover:underline" href="/login">
          {t("auth.backToLogin")}
        </Link>
      </Card>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}
