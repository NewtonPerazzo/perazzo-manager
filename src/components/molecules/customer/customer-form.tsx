"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/atoms/button";
import { Field } from "@/components/atoms/field";
import { Input } from "@/components/atoms/input";
import { PhoneWhatsappInput } from "@/components/atoms/phone-whatsapp-input";
import { useI18n } from "@/i18n/provider";
import { customerSchema } from "@/schemas/forms";
import type { CustomerCreatePayload, CustomerResponse } from "@/types/api/customer";

export function CustomerForm({
  onSubmit,
  initialData,
  submitLabel
}: {
  onSubmit: (payload: CustomerCreatePayload) => Promise<void>;
  initialData?: CustomerResponse | null;
  submitLabel?: string;
}) {
  const { t } = useI18n();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors }
  } = useForm<CustomerCreatePayload>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      phone: initialData?.phone ?? "",
      address: initialData?.address ?? "",
      neighborhood: initialData?.neighborhood ?? "",
      email: initialData?.email ?? ""
    }
  });

  useEffect(() => {
    reset({
      name: initialData?.name ?? "",
      phone: initialData?.phone ?? "",
      address: initialData?.address ?? "",
      neighborhood: initialData?.neighborhood ?? "",
      email: initialData?.email ?? ""
    });
  }, [initialData, reset]);

  async function submit(values: CustomerCreatePayload) {
    await onSubmit(values);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-3">
      <Field label={t("customers.name")}>
        <Input {...register("name")} required />
        {errors.name ? <p className="text-xs text-red-300">{t("common.invalidField")}</p> : null}
      </Field>
      <Field label={t("customers.phone")}>
        <Controller
          control={control}
          name="phone"
          render={({ field }) => <PhoneWhatsappInput value={field.value} onChange={field.onChange} />}
        />
        {errors.phone ? <p className="text-xs text-red-300">{t("common.invalidField")}</p> : null}
      </Field>
      <Field label={t("customers.address")}>
        <Input {...register("address")} />
      </Field>
      <Field label={t("customers.neighborhood")}>
        <Input {...register("neighborhood")} />
      </Field>
      <Field label={t("customers.email")}>
        <Input type="email" {...register("email")} />
        {errors.email ? <p className="text-xs text-red-300">{t("common.invalidField")}</p> : null}
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("common.loading") : submitLabel ?? t("common.create")}
      </Button>
    </form>
  );
}
