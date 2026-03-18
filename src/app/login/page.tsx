"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Field } from "@/components/atoms/field";
import { Input } from "@/components/atoms/input";
import { LocaleSelect } from "@/components/molecules/common/locale-select";
import { useI18n } from "@/i18n/provider";
import { loginSchema } from "@/schemas/forms";
import { authService } from "@/services/resources/auth-service";
import { sessionService } from "@/services/resources/session-service";
import { useAuthStore } from "@/store/auth-store";
import type { UserLoginPayload } from "@/types/api/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const registered = searchParams.get("registered") === "1";

  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors }
  } = useForm<UserLoginPayload>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  async function submit(values: UserLoginPayload) {
    try {
      const auth = await authService.login(values);
      setToken(auth.access_token);
      const me = await authService.getMe(auth.access_token);
      const fullName = [me.name, me.last_name].filter(Boolean).join(" ").trim();
      setUser(fullName || me.email, me.email);
      await sessionService.setToken(auth.access_token);

      router.push("/dashboard");
    } catch {
      setError("root", { message: t("auth.error") });
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-950 bg-atmosphere p-4">
      <Card className="w-full max-w-md">
        <div className="mb-3 flex justify-end">
          <LocaleSelect />
        </div>
        <h1 className="text-2xl font-semibold text-white">{t("auth.title")}</h1>
        <p className="mb-4 text-sm text-slate-300">{t("auth.subtitle")}</p>
        {registered ? <p className="mb-3 text-sm text-emerald-300">{t("auth.registerSuccess")}</p> : null}
        {errors.root ? <p className="mb-3 text-sm text-red-300">{errors.root.message}</p> : null}
        <form className="grid gap-3" onSubmit={handleSubmit(submit)}>
          <Field label={t("auth.email")}>
            <Input type="email" {...register("email")} required />
            {errors.email ? <p className="text-xs text-red-300">{errors.email.message ?? t("common.invalidField")}</p> : null}
          </Field>
          <Field label={t("auth.password")}>
            <Input type="password" {...register("password")} required />
            {errors.password ? <p className="text-xs text-red-300">{errors.password.message ?? t("common.invalidField")}</p> : null}
          </Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("common.loading") : t("auth.submit")}
          </Button>
        </form>
        <div className="mt-4 flex justify-between text-sm text-slate-300">
          <Link className="text-accent-400 hover:underline" href="/register">
            {t("auth.createAccount")}
          </Link>
          <Link className="text-accent-400 hover:underline" href="/forgot-password">
            {t("auth.forgotPasswordLink")}
          </Link>
        </div>
      </Card>
    </main>
  );
}
