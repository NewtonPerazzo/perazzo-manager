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
      has_catalog_active: initialData?.has_catalog_active ?? false
    }
  });

  const colorValue = watch("color") ?? DEFAULT_STORE_COLOR;
  const pickerColor = isHexColor(colorValue) ? colorValue : DEFAULT_STORE_COLOR;
  const logoValue = watch("logo") ?? "";

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
      has_catalog_active: initialData?.has_catalog_active ?? false
    });
  }, [initialData, reset]);

  return (
    <form className="grid gap-3" onSubmit={handleSubmit(onSubmit)}>
      <Field label={t("store.name")}>
        <Input {...register("name")} required />
        {errors.name ? <p className="text-xs text-red-300">{t("common.invalidField")}</p> : null}
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
          {errors.email ? <p className="text-xs text-red-300">{t("common.invalidField")}</p> : null}
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
          {errors.color ? <p className="text-xs text-red-300">{t("common.invalidField")}</p> : null}
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
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("common.loading") : submitLabel ?? t("common.save")}
      </Button>
    </form>
  );
}
