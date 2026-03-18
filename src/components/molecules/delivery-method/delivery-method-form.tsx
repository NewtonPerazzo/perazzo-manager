"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/atoms/button";
import { Field } from "@/components/atoms/field";
import { Input } from "@/components/atoms/input";
import { PriceInput } from "@/components/atoms/price-input";
import { useI18n } from "@/i18n/provider";
import { deliveryMethodSchema } from "@/schemas/forms";
import type {
  DeliveryMethodCreatePayload,
  DeliveryMethodResponse
} from "@/types/api/delivery-method";

export function DeliveryMethodForm({
  onSubmit,
  initialData,
  submitLabel
}: {
  onSubmit: (payload: DeliveryMethodCreatePayload) => Promise<void>;
  initialData?: DeliveryMethodResponse | null;
  submitLabel?: string;
}) {
  const { t } = useI18n();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors }
  } = useForm<DeliveryMethodCreatePayload>({
    resolver: zodResolver(deliveryMethodSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      price: initialData?.price ?? 0,
      description: initialData?.description ?? ""
    }
  });

  useEffect(() => {
    reset({
      name: initialData?.name ?? "",
      price: initialData?.price ?? 0,
      description: initialData?.description ?? ""
    });
  }, [initialData, reset]);

  async function submit(values: DeliveryMethodCreatePayload) {
    await onSubmit(values);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-3">
      <Field label={t("deliveryMethods.name")}>
        <Input {...register("name")} required />
        {errors.name ? <p className="text-xs text-red-300">{t("common.invalidField")}</p> : null}
      </Field>

      <Field label={t("deliveryMethods.price")}>
        <Controller
          control={control}
          name="price"
          render={({ field }) => (
            <PriceInput value={Number(field.value ?? 0)} onChange={(value) => field.onChange(value)} />
          )}
        />
        {errors.price ? <p className="text-xs text-red-300">{t("common.invalidField")}</p> : null}
      </Field>

      <Field label={t("deliveryMethods.description")}>
        <Input {...register("description")} />
      </Field>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("common.loading") : submitLabel ?? t("common.create")}
      </Button>
    </form>
  );
}
