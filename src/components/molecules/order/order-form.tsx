"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/atoms/button";
import { Field } from "@/components/atoms/field";
import { ImageDisplay } from "@/components/atoms/image-display";
import { Input } from "@/components/atoms/input";
import { PhoneWhatsappInput } from "@/components/atoms/phone-whatsapp-input";
import { Switch } from "@/components/atoms/switch";
import { useUiFeedback } from "@/hooks/use-ui-feedback";
import { useI18n } from "@/i18n/provider";
import { mapOrderFormToPayload, orderFormSchema } from "@/schemas/forms";
import { orderService } from "@/services/resources/order-service";
import { useAuthStore } from "@/store/auth-store";
import type { CourierResponse } from "@/types/api/courier";
import type { DeliveryMethodResponse } from "@/types/api/delivery-method";
import type { PaymentMethodResponse } from "@/types/api/payment-method";
import type { ProductResponse } from "@/types/api/product";
import type { OrderCreatePayload, OrderResponse } from "@/types/api/order";
import type { OrderFormValues } from "@/schemas/forms";

function normalizePhoneForForm(value?: string | null): string {
  const phone = (value ?? "").trim();
  return phone === "-" ? "" : phone;
}

function normalizeCustomerNameForForm(value?: string | null): string {
  const name = (value ?? "").trim();
  if (!name) return "";

  const lower = name.toLowerCase();
  if (lower === "cliente" || lower === "cliente removido") {
    return "";
  }

  return name;
}

export function OrderForm({
  onSubmit,
  products,
  paymentMethods,
  deliveryMethods,
  couriers,
  initialData,
  submitLabel
}: {
  onSubmit: (payload: OrderCreatePayload) => Promise<void>;
  products: ProductResponse[];
  paymentMethods: PaymentMethodResponse[];
  deliveryMethods: DeliveryMethodResponse[];
  couriers: CourierResponse[];
  initialData?: OrderResponse | null;
  submitLabel?: string;
}) {
  const { t } = useI18n();
  const { toast } = useUiFeedback();
  const token = useAuthStore((state) => state.token);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedAmount, setSelectedAmount] = useState("");
  const [previewTotal, setPreviewTotal] = useState(0);
  const [isCalculatingTotal, setIsCalculatingTotal] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { isSubmitting, errors }
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      products:
        initialData?.products.map((item) => ({
          product_id: item.product.id,
          amount: item.amount
        })) ?? [],
      customer_name: normalizeCustomerNameForForm(initialData?.customer.name),
      customer_phone: normalizePhoneForForm(initialData?.customer.phone),
      customer_address: initialData?.customer.address ?? "",
      customer_neighborhood: initialData?.customer.neighborhood ?? "",
      customer_email: initialData?.customer.email ?? "",
      payment_method: initialData?.payment_method ?? "",
      delivery_method_id: initialData?.delivery_method?.id ?? "",
      courier_id: initialData?.courier?.id ?? "",
      is_to_deliver: initialData?.is_to_deliver ?? false
    }
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "products"
  });
  const watchedProducts = useWatch({ control, name: "products" });
  const selectedProducts = useMemo(() => watchedProducts ?? [], [watchedProducts]);
  const selectedDeliveryMethodId = useWatch({ control, name: "delivery_method_id" }) ?? "";
  const isToDeliver = Boolean(watch("is_to_deliver"));
  const shouldShowCourierSelect = isToDeliver;

  useEffect(() => {
    reset({
      products:
        initialData?.products.map((item) => ({
          product_id: item.product.id,
          amount: item.amount
        })) ?? [],
      customer_name: normalizeCustomerNameForForm(initialData?.customer.name),
      customer_phone: normalizePhoneForForm(initialData?.customer.phone),
      customer_address: initialData?.customer.address ?? "",
      customer_neighborhood: initialData?.customer.neighborhood ?? "",
      customer_email: initialData?.customer.email ?? "",
      payment_method: initialData?.payment_method ?? "",
      delivery_method_id: initialData?.delivery_method?.id ?? "",
      courier_id: initialData?.courier?.id ?? "",
      is_to_deliver: initialData?.is_to_deliver ?? false
    });
    setSelectedAmount("");
    setSelectedProductId("");
  }, [initialData, reset]);

  const productsById = useMemo(() => {
    return new Map(products.map((item) => [item.id, item]));
  }, [products]);

  useEffect(() => {
    async function calculatePreview() {
      const hasProducts = selectedProducts.length > 0;
      const hasDeliveryOnly = isToDeliver && Boolean(selectedDeliveryMethodId);

      if (!token || (!hasProducts && !hasDeliveryOnly)) {
        setPreviewTotal(0);
        return;
      }

      try {
        setIsCalculatingTotal(true);
        const total = await orderService.previewTotal(token, {
          products: selectedProducts,
          is_to_deliver: isToDeliver,
          delivery_method_id: isToDeliver ? (selectedDeliveryMethodId || undefined) : undefined
        });
        setPreviewTotal(total);
      } catch {
        setPreviewTotal(0);
      } finally {
        setIsCalculatingTotal(false);
      }
    }

    void calculatePreview();
  }, [isToDeliver, selectedDeliveryMethodId, selectedProducts, token]);

  function addSelectedProduct() {
    if (!selectedProductId) return;
    const parsedAmount = Number(selectedAmount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
    const selectedProduct = productsById.get(selectedProductId);

    const existingIndex = selectedProducts.findIndex((item) => item.product_id === selectedProductId);
    const currentAmount = existingIndex >= 0 ? Number(selectedProducts[existingIndex]?.amount ?? 0) : 0;
    const nextAmount = currentAmount + parsedAmount;

    if (selectedProduct?.stock !== null && selectedProduct?.stock !== undefined && nextAmount > selectedProduct.stock) {
      toast(`Estoque insuficiente: apenas ${selectedProduct.stock} unidades`, "warning");
      return;
    }

    if (existingIndex >= 0) {
      setValue(`products.${existingIndex}.amount`, nextAmount, {
        shouldDirty: true,
        shouldValidate: true
      });
    } else {
      append({ product_id: selectedProductId, amount: parsedAmount });
    }

    setSelectedAmount("");
  }

  async function submit(values: OrderFormValues) {
    const payload = mapOrderFormToPayload(values);
    if (payload.is_to_deliver && payload.delivery_method_id) {
      const selectedMethod = deliveryMethods.find((method) => method.id === payload.delivery_method_id);
      payload.customer.neighborhood = selectedMethod?.name || undefined;
    }
    await onSubmit(payload);
    reset();
    setSelectedProductId("");
    setSelectedAmount("");
    setPreviewTotal(0);
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="grid gap-3">
      <Field label={t("orders.products")} required>
        <div className="grid gap-2">
          <div className="grid gap-2 sm:grid-cols-[1fr,180px,auto] sm:items-center">
            <select
              value={selectedProductId}
              onChange={(event) => setSelectedProductId(event.target.value)}
              className="w-full rounded-xl border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-white outline-none focus:border-accent-500"
            >
              <option value="">{t("orders.selectProduct")}</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {`${product.name} - R$ ${product.price.toFixed(2)}`}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-200">
              <span>{`${t("orders.amount")}:`}</span>
              <Input
                type="number"
                min={1}
                value={selectedAmount}
                onChange={(event) => setSelectedAmount(event.target.value.replace(/[^0-9]/g, ""))}
              />
            </label>
            <Button
              type="button"
              onClick={addSelectedProduct}
              disabled={!selectedProductId || !selectedAmount || Number(selectedAmount) <= 0}
            >
              {t("orders.addProduct")}
            </Button>
          </div>
        </div>
        {errors.products ? <p className="text-xs text-red-300">{errors.products.message ?? t("common.invalidField")}</p> : null}
        {products.length === 0 ? <p className="text-xs text-slate-400">{t("orders.noProductsAvailable")}</p> : null}
      </Field>

      <div className="min-w-0 space-y-2 rounded-xl border border-surface-700 p-2">
        <p className="text-sm font-medium text-slate-100">{t("orders.selectedProducts")}</p>
        {fields.length === 0 ? (
          <p className="text-sm text-slate-300">{t("common.empty")}</p>
        ) : (
          <div className="max-w-full overflow-x-auto overflow-y-hidden pb-1">
            <div className="inline-flex min-w-full gap-2">
            {fields.map((field, index) => {
              const product = productsById.get(field.product_id);
              const quantity = watch(`products.${index}.amount`) ?? field.amount;
              return (
                <div
                  key={field.id}
                  className="w-[220px] shrink-0 rounded-lg border border-surface-700 p-2"
                >
                  <div className="flex items-center gap-2">
                    <ImageDisplay
                      src={product?.image_url}
                      alt={product?.name ?? "product"}
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-md border border-surface-700 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm text-slate-100">{product?.name ?? field.product_id}</p>
                      <p className="text-xs text-slate-400">{`R$ ${(product?.price ?? 0).toFixed(2)}`}</p>
                      <p className="text-xs font-semibold text-slate-200">{`x${quantity}`}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Button type="button" variant="danger" className="w-full" onClick={() => remove(index)}>
                      {t("common.delete")}
                    </Button>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">{t("orders.customerSection")}</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t("customers.name")}>
            <Input {...register("customer_name")} />
          </Field>
          <Field label={t("customers.phone")}>
            <Controller
              control={control}
              name="customer_phone"
              render={({ field }) => <PhoneWhatsappInput value={field.value} onChange={field.onChange} />}
            />
          </Field>
        </div>
      </div>

      {isToDeliver ? (
        <Field label={t("orders.streetAddress")} required>
          <Input {...register("customer_address")} />
          {errors.customer_address ? <p className="text-xs text-red-300">{errors.customer_address.message ?? t("common.invalidField")}</p> : null}
        </Field>
      ) : null}

      {isToDeliver ? (
        <Field label={t("orders.neighborhood")} required>
          <select
            {...register("delivery_method_id")}
            className="w-full rounded-xl border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-white outline-none focus:border-accent-500"
          >
            <option value="">{t("orders.selectNeighborhood")}</option>
            {deliveryMethods.map((method) => (
              <option key={method.id} value={method.id}>
                {`${method.name} - R$ ${method.price.toFixed(2)}`}
              </option>
            ))}
          </select>
          {errors.delivery_method_id ? <p className="text-xs text-red-300">{errors.delivery_method_id.message ?? t("common.invalidField")}</p> : null}
        </Field>
      ) : null}

      {shouldShowCourierSelect ? (
        <Field label={t("couriers.linkToOrderOptional")}>
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
      ) : null}

      <Field label={t("orders.paymentMethod")} required>
        <select
          {...register("payment_method")}
          className="w-full rounded-xl border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-white outline-none focus:border-accent-500"
        >
          <option value="">{t("orders.selectPaymentMethod")}</option>
          {paymentMethods.map((method) => (
            <option key={method.id} value={method.name}>
              {method.name}
            </option>
          ))}
        </select>
        {errors.payment_method ? <p className="text-xs text-red-300">{errors.payment_method.message ?? t("common.invalidField")}</p> : null}
      </Field>

      <label className="flex items-center gap-2 text-sm text-slate-200">
        <Controller
          control={control}
          name="is_to_deliver"
          render={({ field }) => (
            <Switch checked={Boolean(field.value)} onChange={(value) => field.onChange(value)} />
          )}
        />
        {t("orders.isToDeliver")}
      </label>

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-surface-700 bg-surface-900/95 px-4 pt-3 pb-1 backdrop-blur">
        <Button type="submit" className="w-full" isLoading={isSubmitting || isCalculatingTotal}>
          {`${submitLabel ?? t("common.create")} - R$ ${previewTotal.toFixed(2)}`}
        </Button>
      </div>
    </form>
  );
}
