"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/atoms/button";
import { Field } from "@/components/atoms/field";
import { Input } from "@/components/atoms/input";
import { Textarea } from "@/components/atoms/textarea";
import { useI18n } from "@/i18n/provider";
import { categorySchema } from "@/schemas/forms";
import type { CategoryCreatePayload, CategoryResponse } from "@/types/api/category";

export function CategoryForm({
  onSubmit,
  initialData,
  submitLabel
}: {
  onSubmit: (payload: CategoryCreatePayload) => Promise<void>;
  initialData?: CategoryResponse | null;
  submitLabel?: string;
}) {
  const { t } = useI18n();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors }
  } = useForm<CategoryCreatePayload>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? ""
    }
  });

  useEffect(() => {
    reset({
      name: initialData?.name ?? "",
      description: initialData?.description ?? ""
    });
  }, [initialData, reset]);

  async function submit(values: CategoryCreatePayload) {
    await onSubmit(values);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-3">
      <Field label={t("categories.name")}>
        <Input {...register("name")} required />
        {errors.name ? <p className="text-xs text-red-300">{errors.name.message ?? t("common.invalidField")}</p> : null}
      </Field>
      <Field label={t("categories.description")}>
        <Textarea {...register("description")} />
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("common.loading") : submitLabel ?? t("common.create")}
      </Button>
    </form>
  );
}
