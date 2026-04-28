"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/atoms/button";
import { Field } from "@/components/atoms/field";
import { Input } from "@/components/atoms/input";
import { useI18n } from "@/i18n/provider";
import { paymentMethodSchema } from "@/schemas/forms";
import type {
  PaymentMethodCreatePayload,
  PaymentMethodResponse
} from "@/types/api/payment-method";

export function PaymentMethodForm({
  onSubmit,
  initialData,
  submitLabel
}: {
  onSubmit: (payload: PaymentMethodCreatePayload) => Promise<void>;
  initialData?: PaymentMethodResponse | null;
  submitLabel?: string;
}) {
  const { t } = useI18n();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors }
  } = useForm<PaymentMethodCreatePayload>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: { name: initialData?.name ?? "" }
  });

  useEffect(() => {
    reset({ name: initialData?.name ?? "" });
  }, [initialData, reset]);

  async function submit(values: PaymentMethodCreatePayload) {
    await onSubmit(values);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-3">
      <Field label={t("paymentMethods.name")}>
        <Input {...register("name")} required />
        {errors.name ? <p className="text-xs text-red-300">{errors.name.message ?? t("common.invalidField")}</p> : null}
      </Field>
      <Button type="submit" isLoading={isSubmitting}>
        {submitLabel ?? t("common.create")}
      </Button>
    </form>
  );
}
