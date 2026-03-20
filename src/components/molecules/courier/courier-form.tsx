"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/atoms/button";
import { Field } from "@/components/atoms/field";
import { Input } from "@/components/atoms/input";
import { courierSchema } from "@/schemas/forms";
import { useI18n } from "@/i18n/provider";
import type { CourierPayload, CourierResponse } from "@/types/api/courier";

export function CourierForm({
  onSubmit,
  initialData,
  submitLabel
}: {
  onSubmit: (payload: CourierPayload) => Promise<void>;
  initialData?: CourierResponse | null;
  submitLabel?: string;
}) {
  const { t } = useI18n();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors }
  } = useForm<CourierPayload>({
    resolver: zodResolver(courierSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      address: initialData?.address ?? ""
    }
  });

  useEffect(() => {
    reset({
      name: initialData?.name ?? "",
      address: initialData?.address ?? ""
    });
  }, [initialData, reset]);

  async function submit(values: CourierPayload) {
    await onSubmit(values);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-3">
      <Field label={t("couriers.name")} required>
        <Input {...register("name")} />
        {errors.name ? <p className="text-xs text-red-300">{errors.name.message ?? t("common.invalidField")}</p> : null}
      </Field>
      <Field label={t("couriers.addressOptional")}>
        <Input {...register("address")} />
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("common.loading") : submitLabel ?? t("common.create")}
      </Button>
    </form>
  );
}

