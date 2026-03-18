"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/atoms/button";
import { Field } from "@/components/atoms/field";
import { ImagePicker } from "@/components/atoms/image-picker";
import { Input } from "@/components/atoms/input";
import { PriceInput } from "@/components/atoms/price-input";
import { Textarea } from "@/components/atoms/textarea";
import { useI18n } from "@/i18n/provider";
import { mapProductFormToPayload, productFormSchema } from "@/schemas/forms";
import type { CategoryResponse } from "@/types/api/category";
import type { ProductCreatePayload, ProductResponse } from "@/types/api/product";

type ProductFormInput = {
  name: string;
  price: number;
  description?: string;
  stock?: number;
  image_url?: string;
  category_id?: string;
};

export function ProductForm({
  onSubmit,
  initialData,
  submitLabel,
  categories
}: {
  onSubmit: (payload: ProductCreatePayload) => Promise<void>;
  initialData?: ProductResponse | null;
  submitLabel?: string;
  categories: CategoryResponse[];
}) {
  const { t } = useI18n();

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting, errors }
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      price: initialData?.price ?? 0,
      description: initialData?.description ?? "",
      stock: initialData?.stock ?? undefined,
      image_url: initialData?.image_url ?? "",
      category_id: initialData?.categories[0]?.id ?? ""
    }
  });

  const imageValue = watch("image_url") ?? "";

  useEffect(() => {
    reset({
      name: initialData?.name ?? "",
      price: initialData?.price ?? 0,
      description: initialData?.description ?? "",
      stock: initialData?.stock ?? undefined,
      image_url: initialData?.image_url ?? "",
      category_id: initialData?.categories[0]?.id ?? ""
    });
  }, [initialData, reset]);

  async function submit(values: ProductFormInput) {
    const payload = mapProductFormToPayload(values);
    await onSubmit(payload);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-3">
      <Field label={t("products.name")}>
        <Input {...register("name")} required />
        {errors.name ? <p className="text-xs text-red-300">{errors.name.message ?? t("common.invalidField")}</p> : null}
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t("products.price")}>
          <Controller
            control={control}
            name="price"
            render={({ field }) => (
              <PriceInput value={Number(field.value ?? 0)} onChange={(value) => field.onChange(value)} />
            )}
          />
          {errors.price ? <p className="text-xs text-red-300">{errors.price.message ?? t("common.invalidField")}</p> : null}
        </Field>
        <Field label={t("products.stock")}>
          <Input
            type="number"
            {...register("stock", {
              setValueAs: (value) => (value === "" ? undefined : Number(value))
            })}
          />
          {errors.stock ? <p className="text-xs text-red-300">{errors.stock.message ?? t("common.invalidField")}</p> : null}
        </Field>
      </div>
      <Field label={t("store.description")}>
        <Textarea {...register("description")} />
      </Field>
      <Field label={t("products.image")}>
        <ImagePicker
          value={imageValue}
          alt="product-image"
          onChange={(value) => setValue("image_url", value, { shouldValidate: true })}
          selectLabel={t("common.selectImage")}
          changeLabel={t("common.changeImage")}
          removeLabel={t("common.removeImage")}
        />
        {errors.image_url ? <p className="text-xs text-red-300">{errors.image_url.message ?? t("common.invalidField")}</p> : null}
      </Field>
      <Field label={t("products.categories")}>
        <select
          {...register("category_id")}
          className="w-full rounded-xl border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-white outline-none focus:border-accent-500"
        >
          <option value="">{t("products.noCategory")}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.category_id ? <p className="text-xs text-red-300">{errors.category_id.message ?? t("common.invalidField")}</p> : null}
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("common.loading") : submitLabel ?? t("common.create")}
      </Button>
    </form>
  );
}
