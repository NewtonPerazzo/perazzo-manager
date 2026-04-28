"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/atoms/button";
import { Field } from "@/components/atoms/field";
import { Input } from "@/components/atoms/input";
import { Textarea } from "@/components/atoms/textarea";
import { CurrencyInput } from "@/components/atoms/currency-input";
import { useI18n } from "@/i18n/provider";
import type {
  CashEntryType,
  CashRegisterEntryPayload,
  CashRegisterEntryResponse
} from "@/types/api/cash-register";

const schema = z.object({
  name: z.string().trim().min(1),
  amount: z.coerce.number().positive(),
  payment_method: z.string().trim().optional().or(z.literal("")),
  note: z.string().trim().optional().or(z.literal("")),
  occurred_on: z.string().trim().min(1)
});

type FormValues = z.infer<typeof schema>;

export function CashRegisterEntryForm({
  type,
  initialData,
  onSubmit,
  submitLabel,
  fixedDate,
  isProfit
}: {
  type: CashEntryType;
  initialData?: CashRegisterEntryResponse | null;
  onSubmit: (payload: CashRegisterEntryPayload) => Promise<void>;
  submitLabel: string;
  fixedDate?: string;
  isProfit?: boolean;
}) {
  const { t } = useI18n();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { isSubmitting, errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? "",
      amount: initialData?.amount ?? 0,
      payment_method: initialData?.payment_method ?? "",
      note: initialData?.note ?? "",
      occurred_on: initialData?.occurred_on ?? fixedDate ?? new Date().toISOString().slice(0, 10)
    }
  });
  const amountValue = watch("amount") ?? 0;

  useEffect(() => {
    reset({
      name: initialData?.name ?? "",
      amount: initialData?.amount ?? 0,
      payment_method: initialData?.payment_method ?? "",
      note: initialData?.note ?? "",
      occurred_on: initialData?.occurred_on ?? fixedDate ?? new Date().toISOString().slice(0, 10)
    });
  }, [fixedDate, initialData, reset]);

  return (
    <form
      className="grid gap-3"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit({
          entry_type: type,
          name: values.name,
          amount: values.amount,
          payment_method: values.payment_method || null,
          is_profit: Boolean(isProfit),
          note: values.note || null,
          occurred_on: values.occurred_on
        });
      })}
    >
      <Field label={t("cashRegister.name")} required>
        <Input {...register("name")} />
        {errors.name ? <p className="text-xs text-red-300">{errors.name.message ?? t("common.invalidField")}</p> : null}
      </Field>
      <Field label={t("cashRegister.amount")} required>
        <CurrencyInput
          value={amountValue}
          onChange={(value) => setValue("amount", value, { shouldValidate: true, shouldDirty: true })}
        />
        {errors.amount ? <p className="text-xs text-red-300">{errors.amount.message ?? t("common.invalidField")}</p> : null}
      </Field>
      <Field label={t("cashRegister.paymentMethodOptional")}>
        <Input {...register("payment_method")} />
      </Field>
      <Field label={t("cashRegister.date")} required>
        <Input type="date" {...register("occurred_on")} />
      </Field>
      <Field label={t("cashRegister.note")}>
        <Textarea {...register("note")} />
      </Field>
      <Button type="submit" isLoading={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
