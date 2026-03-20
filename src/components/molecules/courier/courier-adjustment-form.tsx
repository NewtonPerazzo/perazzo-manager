"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/atoms/button";
import { Field } from "@/components/atoms/field";
import { Input } from "@/components/atoms/input";
import { PriceInput } from "@/components/atoms/price-input";
import { useI18n } from "@/i18n/provider";
import type { CourierAdjustmentPayload, CourierAdjustmentType, CourierResponse } from "@/types/api/courier";

interface AdjustmentFormValues {
  amount: number;
  courier_id?: string | null;
  payment_method?: string;
  note?: string;
  occurred_on?: string;
}

const adjustmentFormSchema = z.object({
  amount: z.coerce.number().positive(),
  courier_id: z.string().uuid().optional().or(z.literal("")).nullable(),
  payment_method: z.string().trim().optional().or(z.literal("")),
  note: z.string().trim().optional().or(z.literal("")),
  occurred_on: z.string().trim().optional().or(z.literal(""))
});

export function CourierAdjustmentForm({
  onSubmit,
  couriers,
  adjustmentType,
  submitLabel
}: {
  onSubmit: (payload: CourierAdjustmentPayload) => Promise<void>;
  couriers: CourierResponse[];
  adjustmentType: CourierAdjustmentType;
  submitLabel?: string;
}) {
  const { t } = useI18n();
  const {
    control,
    register,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = useForm<AdjustmentFormValues>({
    resolver: zodResolver(adjustmentFormSchema),
    defaultValues: {
      amount: 0,
      courier_id: "",
      payment_method: "",
      note: "",
      occurred_on: ""
    }
  });

  async function submit(values: AdjustmentFormValues) {
    await onSubmit({
      adjustment_type: adjustmentType,
      amount: values.amount,
      courier_id: values.courier_id || undefined,
      payment_method: values.payment_method || undefined,
      note: values.note || undefined,
      occurred_on: values.occurred_on || undefined
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-3">
      <Field label={t("cashRegister.amount")} required>
        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <PriceInput value={Number(field.value ?? 0)} onChange={(value) => field.onChange(value)} />
          )}
        />
        {errors.amount ? <p className="text-xs text-red-300">{errors.amount.message ?? t("common.invalidField")}</p> : null}
      </Field>
      <Field label={t("couriers.selectRiderOptional")}>
        <select
          {...register("courier_id")}
          className="w-full rounded-xl border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-white outline-none focus:border-accent-500"
        >
          <option value="">{t("couriers.unassigned")}</option>
          {couriers.map((courier) => (
            <option key={courier.id} value={courier.id}>
              {courier.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t("cashRegister.paymentMethodOptional")}>
        <Input {...register("payment_method")} />
      </Field>
      <Field label={t("cashRegister.note")}>
        <Input {...register("note")} />
      </Field>
      <Field label={t("cashRegister.date")}>
        <Input type="date" {...register("occurred_on")} />
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("common.loading") : submitLabel ?? t("common.create")}
      </Button>
    </form>
  );
}
