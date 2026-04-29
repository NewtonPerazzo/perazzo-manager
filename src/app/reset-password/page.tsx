"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Field } from "@/components/atoms/field";
import { PasswordInput } from "@/components/atoms/password-input";
import { LocaleSelect } from "@/components/molecules/common/locale-select";
import { useI18n } from "@/i18n/provider";
import { translateFormError } from "@/lib/form-error";
import { resetPasswordSchema } from "@/schemas/forms";
import { authService } from "@/services/resources/auth-service";
import type { ResetPasswordPayload } from "@/types/api/auth";

function ResetPasswordPageContent() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialToken = searchParams.get("token") ?? "";

  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors }
  } = useForm<ResetPasswordPayload>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: initialToken,
      new_password: ""
    }
  });

  async function submit(values: ResetPasswordPayload) {
    try {
      await authService.resetPassword(values);
      router.push("/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : t("common.unexpectedError");
      setError("root", { message });
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-950 bg-atmosphere p-4">
      <Card className="w-full max-w-md">
        <div className="mb-3 flex justify-end">
          <LocaleSelect />
        </div>
        <h1 className="text-2xl font-semibold text-white">{t("auth.resetTitle")}</h1>
        <p className="mb-4 text-sm text-slate-300">{t("auth.resetSubtitle")}</p>

        {errors.root ? <p className="mb-3 text-sm text-red-300">{errors.root.message}</p> : null}
        {initialToken ? (
          <form className="grid gap-3" onSubmit={handleSubmit(submit)}>
            <input type="hidden" {...register("token")} />
            <Field label={t("auth.newPassword")}>
              <PasswordInput
                {...register("new_password")}
                required
                showLabel={t("auth.showPassword")}
                hideLabel={t("auth.hidePassword")}
              />
              <p className="text-xs leading-5 text-slate-400">{t("auth.passwordHint")}</p>
              {errors.new_password ? (
                <p className="text-xs text-red-300">
                  {translateFormError(locale, errors.new_password.message, t("common.invalidField"))}
                </p>
              ) : null}
            </Field>
            <Button type="submit" isLoading={isSubmitting}>
              {t("auth.resetSubmit")}
            </Button>
          </form>
        ) : (
          <p className="text-sm text-red-300">{t("auth.resetLinkInvalid")}</p>
        )}

        <p className="mt-4 text-sm text-slate-300">
          <Link className="text-accent-400 hover:underline" href="/login">
            {t("auth.backToLogin")}
          </Link>
        </p>
      </Card>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
