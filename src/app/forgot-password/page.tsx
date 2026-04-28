"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Field } from "@/components/atoms/field";
import { Input } from "@/components/atoms/input";
import { LocaleSelect } from "@/components/molecules/common/locale-select";
import { useI18n } from "@/i18n/provider";
import { forgotPasswordSchema } from "@/schemas/forms";
import { authService } from "@/services/resources/auth-service";
import type { ForgotPasswordPayload } from "@/types/api/auth";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [isRequestSuccessful, setIsRequestSuccessful] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors }
  } = useForm<ForgotPasswordPayload>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ""
    }
  });

  async function submit(values: ForgotPasswordPayload) {
    try {
      await authService.forgotPassword(values);
      setIsRequestSuccessful(true);
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
        {isRequestSuccessful ? (
          <>
            <h1 className="text-2xl font-semibold text-white">{t("auth.resetEmailSentTitle")}</h1>
            <p className="mt-2 text-sm text-slate-300">{t("auth.resetEmailSentSubtitle")}</p>
            <Link
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-accent-500 px-4 py-2 text-sm font-semibold text-surface-950 transition hover:bg-accent-400"
              href="/login"
            >
              {t("auth.backToLogin")}
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-white">{t("auth.forgotTitle")}</h1>
            <p className="mb-4 text-sm text-slate-300">{t("auth.forgotSubtitle")}</p>
            {errors.root ? <p className="mb-3 text-sm text-red-300">{errors.root.message}</p> : null}
            <form className="grid gap-3" onSubmit={handleSubmit(submit)}>
              <Field label={t("auth.email")}>
                <Input type="email" {...register("email")} required />
                {errors.email ? (
                  <p className="text-xs text-red-300">{errors.email.message ?? t("common.invalidField")}</p>
                ) : null}
              </Field>
              <Button type="submit" isLoading={isSubmitting}>
                {t("auth.forgotSubmit")}
              </Button>
            </form>

            <p className="mt-4 text-sm text-slate-300">
              <Link className="text-accent-400 hover:underline" href="/login">
                {t("auth.backToLogin")}
              </Link>
            </p>
          </>
        )}
      </Card>
    </main>
  );
}
