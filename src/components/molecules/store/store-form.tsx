"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { HexColorPicker } from "react-colorful";

import { Button } from "@/components/atoms/button";
import { Field } from "@/components/atoms/field";
import { ImagePicker } from "@/components/atoms/image-picker";
import { Input } from "@/components/atoms/input";
import { PhoneWhatsappInput } from "@/components/atoms/phone-whatsapp-input";
import { Switch } from "@/components/atoms/switch";
import { Textarea } from "@/components/atoms/textarea";
import { useI18n } from "@/i18n/provider";
import { normalizeBusinessHours } from "@/lib/store-hours";
import { storeSchema } from "@/schemas/forms";
import type { StoreCreatePayload, StoreResponse } from "@/types/api/store";

interface StoreFormProps {
  initialData?: StoreResponse | null;
  onSubmit: (payload: StoreCreatePayload) => Promise<void>;
  submitLabel?: string;
}

const DEFAULT_STORE_COLOR = "#22c55e";

function normalizeHex(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

function isHexColor(value: string): boolean {
  return /^#([0-9a-fA-F]{6})$/.test(value);
}

function hasValidWhatsapp(value?: string | null): boolean {
  return (value ?? "").replace(/\D/g, "").length >= 8;
}

const dayRows = [
  { key: "monday", labelKey: "store.day.monday" },
  { key: "tuesday", labelKey: "store.day.tuesday" },
  { key: "wednesday", labelKey: "store.day.wednesday" },
  { key: "thursday", labelKey: "store.day.thursday" },
  { key: "friday", labelKey: "store.day.friday" },
  { key: "saturday", labelKey: "store.day.saturday" },
  { key: "sunday", labelKey: "store.day.sunday" }
] as const;

export function StoreForm({ initialData, onSubmit, submitLabel }: StoreFormProps) {
  const { t } = useI18n();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { isSubmitting, errors }
  } = useForm<StoreCreatePayload>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      phone: initialData?.phone ?? "",
      whatsapp: initialData?.whatsapp ?? "",
      address: initialData?.address ?? "",
      instagram: initialData?.instagram ?? "",
      email: initialData?.email ?? "",
      logo: initialData?.logo ?? "",
      color: initialData?.color ?? DEFAULT_STORE_COLOR,
      does_delivery: initialData?.does_delivery ?? false,
      does_pick_up: initialData?.does_pick_up ?? false,
      has_catalog_active: initialData?.has_catalog_active ?? false,
      is_accepted_send_order_to_whatsapp: initialData?.is_accepted_send_order_to_whatsapp ?? false,
      business_hours: normalizeBusinessHours(initialData?.business_hours)
    }
  });

  const colorValue = watch("color") ?? DEFAULT_STORE_COLOR;
  const pickerColor = isHexColor(colorValue) ? colorValue : DEFAULT_STORE_COLOR;
  const logoValue = watch("logo") ?? "";
  const whatsappValue = watch("whatsapp") ?? "";
  const isAcceptedSendToWhatsapp = Boolean(watch("is_accepted_send_order_to_whatsapp"));
  const canEnableSendToWhatsapp = hasValidWhatsapp(whatsappValue);

  useEffect(() => {
    reset({
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      phone: initialData?.phone ?? "",
      whatsapp: initialData?.whatsapp ?? "",
      address: initialData?.address ?? "",
      instagram: initialData?.instagram ?? "",
      email: initialData?.email ?? "",
      logo: initialData?.logo ?? "",
      color: initialData?.color ?? DEFAULT_STORE_COLOR,
      does_delivery: initialData?.does_delivery ?? false,
      does_pick_up: initialData?.does_pick_up ?? false,
      has_catalog_active: initialData?.has_catalog_active ?? false,
      is_accepted_send_order_to_whatsapp: initialData?.is_accepted_send_order_to_whatsapp ?? false,
      business_hours: normalizeBusinessHours(initialData?.business_hours)
    });
  }, [initialData, reset]);

  useEffect(() => {
    if (!canEnableSendToWhatsapp && isAcceptedSendToWhatsapp) {
      setValue("is_accepted_send_order_to_whatsapp", false, { shouldValidate: true });
    }
  }, [canEnableSendToWhatsapp, isAcceptedSendToWhatsapp, setValue]);

  return (
    <form
      className="grid gap-3"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit({
          ...values,
          is_accepted_send_order_to_whatsapp: canEnableSendToWhatsapp
            ? Boolean(values.is_accepted_send_order_to_whatsapp)
            : false
        });
      })}
    >
      <Field label={t("store.name")}>
        <Input {...register("name")} required />
        {errors.name ? <p className="text-xs text-red-300">{errors.name.message ?? t("common.invalidField")}</p> : null}
      </Field>
      <Field label={t("store.description")}>
        <Textarea {...register("description")} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t("store.phone")}>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => <PhoneWhatsappInput value={field.value} onChange={field.onChange} />}
          />
        </Field>
        <Field label={t("store.whatsapp")}>
          <Controller
            control={control}
            name="whatsapp"
            render={({ field }) => <PhoneWhatsappInput value={field.value} onChange={field.onChange} />}
          />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t("store.email")}>
          <Input type="email" {...register("email")} />
          {errors.email ? <p className="text-xs text-red-300">{errors.email.message ?? t("common.invalidField")}</p> : null}
        </Field>
        <Field label={t("store.instagram")}>
          <Input {...register("instagram")} />
        </Field>
      </div>
      <Field label={t("store.address")}>
        <Input {...register("address")} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t("store.logo")}>
          <ImagePicker
            value={logoValue}
            alt="store-logo"
            onChange={(value) => setValue("logo", value, { shouldValidate: true })}
            selectLabel={t("common.selectImage")}
            changeLabel={t("common.changeImage")}
            removeLabel={t("common.removeImage")}
          />
        </Field>

        <Field label={t("store.color")}>
          <div className="space-y-4 rounded-xl border border-surface-700 p-4">
            <div className="px-2 py-1">
              <HexColorPicker color={pickerColor} onChange={(hex) => setValue("color", hex)} />
            </div>
            <Input
              value={colorValue}
              onChange={(event) => setValue("color", normalizeHex(event.target.value))}
              onBlur={(event) => {
                const normalized = normalizeHex(event.target.value);
                setValue("color", normalized || DEFAULT_STORE_COLOR, { shouldValidate: true });
              }}
            />
          </div>
          {errors.color ? <p className="text-xs text-red-300">{errors.color.message ?? t("common.invalidField")}</p> : null}
        </Field>
      </div>

      <div className="flex flex-wrap gap-4 rounded-xl border border-surface-700 p-3">
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <Controller
            control={control}
            name="does_delivery"
            render={({ field }) => (
              <Switch checked={Boolean(field.value)} onChange={(value) => field.onChange(value)} />
            )}
          />
          {t("store.doesDelivery")}
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <Controller
            control={control}
            name="does_pick_up"
            render={({ field }) => (
              <Switch checked={Boolean(field.value)} onChange={(value) => field.onChange(value)} />
            )}
          />
          {t("store.doesPickup")}
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <Controller
            control={control}
            name="has_catalog_active"
            render={({ field }) => (
              <Switch checked={Boolean(field.value)} onChange={(value) => field.onChange(value)} />
            )}
          />
          {t("store.catalogActive")}
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <Controller
            control={control}
            name="is_accepted_send_order_to_whatsapp"
            render={({ field }) => (
              <Switch
                checked={Boolean(field.value)}
                onChange={(value) => field.onChange(value)}
                disabled={!canEnableSendToWhatsapp}
              />
            )}
          />
          {t("store.acceptSendOrderToWhatsapp")}
        </label>
      </div>
      {!canEnableSendToWhatsapp ? (
        <p className="text-xs text-amber-300">{t("store.acceptSendOrderToWhatsappHint")}</p>
      ) : null}

      <div className="space-y-3 rounded-xl border border-surface-700 p-3">
        <p className="text-sm font-medium text-slate-100">{t("store.businessHours")}</p>
        {dayRows.map((day) => (
          <div key={day.key} className="grid gap-2 rounded-lg border border-surface-700 p-2 sm:grid-cols-[1fr,120px,120px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-slate-200">{t(day.labelKey)}</span>
              <Controller
                control={control}
                name={`business_hours.${day.key}.enabled`}
                render={({ field }) => (
                  <Switch checked={Boolean(field.value)} onChange={(value) => field.onChange(value)} />
                )}
              />
            </div>
            <label className="grid gap-1 text-xs text-slate-300">
              <span>{t("store.from")}</span>
              <Input type="time" {...register(`business_hours.${day.key}.start_time`)} />
            </label>
            <label className="grid gap-1 text-xs text-slate-300">
              <span>{t("store.to")}</span>
              <Input type="time" {...register(`business_hours.${day.key}.end_time`)} />
            </label>
          </div>
        ))}
        {errors.business_hours ? (
          <p className="text-xs text-red-300">{errors.business_hours.message ?? t("common.invalidField")}</p>
        ) : null}
      </div>

      <Button type="submit" isLoading={isSubmitting}>
        {submitLabel ?? t("common.save")}
      </Button>
    </form>
  );
}
