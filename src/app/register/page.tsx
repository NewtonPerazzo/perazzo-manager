"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Field } from "@/components/atoms/field";
import { Input } from "@/components/atoms/input";
import { useI18n } from "@/i18n/provider";
import { registerSchema } from "@/schemas/forms";
import { authService } from "@/services/resources/auth-service";
import type { UserRegisterPayload } from "@/types/api/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useI18n();

  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors }
  } = useForm<UserRegisterPayload>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      last_name: "",
      email: "",
      password: "",
      birth_date: "",
      photo: ""
    }
  });

  async function submit(values: UserRegisterPayload) {
    try {
      const payload: UserRegisterPayload = {
        email: values.email,
        password: values.password,
        name: values.name || undefined,
        last_name: values.last_name || undefined,
        birth_date: values.birth_date || undefined,
        photo: values.photo || undefined
      };

      await authService.register(payload);
      router.push("/login?registered=1");
    } catch (error) {
      const message = error instanceof Error ? error.message : t("common.unexpectedError");
      setError("root", { message });
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-950 bg-atmosphere p-4">
      <Card className="w-full max-w-lg">
        <h1 className="text-2xl font-semibold text-white">{t("auth.registerTitle")}</h1>
        <p className="mb-4 text-sm text-slate-300">{t("auth.registerSubtitle")}</p>
        {errors.root ? <p className="mb-3 text-sm text-red-300">{errors.root.message}</p> : null}
        <form className="grid gap-3" onSubmit={handleSubmit(submit)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("auth.firstName")}>
              <Input {...register("name")} />
            </Field>
            <Field label={t("auth.lastName")}>
              <Input {...register("last_name")} />
            </Field>
          </div>
          <Field label={t("auth.email")} required>
            <Input type="email" {...register("email")} required />
            {errors.email ? <p className="text-xs text-red-300">{t("common.invalidField")}</p> : null}
          </Field>
          <Field label={t("auth.password")} required>
            <Input type="password" {...register("password")} required />
            {errors.password ? <p className="text-xs text-red-300">{t("common.invalidField")}</p> : null}
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t("auth.birthDate")}>
              <Input type="date" {...register("birth_date")} />
            </Field>
            <Field label={t("auth.photoUrl")}>
              <Input {...register("photo")} />
            </Field>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("common.loading") : t("auth.registerSubmit")}
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
