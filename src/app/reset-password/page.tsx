"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Field } from "@/components/atoms/field";
import { Input } from "@/components/atoms/input";
import { useI18n } from "@/i18n/provider";
import { resetPasswordSchema } from "@/schemas/forms";
import { authService } from "@/services/resources/auth-service";
import type { ResetPasswordPayload } from "@/types/api/auth";

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const initialToken = searchParams.get("token") ?? "";

  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors, isSubmitSuccessful }
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
    } catch (error) {
      const message = error instanceof Error ? error.message : t("common.unexpectedError");
      setError("root", { message });
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-950 bg-atmosphere p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-white">{t("auth.resetTitle")}</h1>
        <p className="mb-4 text-sm text-slate-300">{t("auth.resetSubtitle")}</p>

        {errors.root ? <p className="mb-3 text-sm text-red-300">{errors.root.message}</p> : null}
        {isSubmitSuccessful ? (
          <p className="mb-3 text-sm text-emerald-300">{t("auth.resetSuccess")}</p>
        ) : null}

        <form className="grid gap-3" onSubmit={handleSubmit(submit)}>
          <Field label={t("auth.resetToken")}>
            <Input {...register("token")} required />
            {errors.token ? <p className="text-xs text-red-300">{t("common.invalidField")}</p> : null}
          </Field>
          <Field label={t("auth.newPassword")}>
            <Input type="password" {...register("new_password")} required />
            {errors.new_password ? (
              <p className="text-xs text-red-300">{t("common.invalidField")}</p>
            ) : null}
          </Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("common.loading") : t("auth.resetSubmit")}
          </Button>
        </form>

        <p className="mt-4 text-sm text-slate-300">
          <Link className="text-accent-400 hover:underline" href="/login">
            {t("auth.backToLogin")}
          </Link>
        </p>
      </Card>
    </main>
  );
}
