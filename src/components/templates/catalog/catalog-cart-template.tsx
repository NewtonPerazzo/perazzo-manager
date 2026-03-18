"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CircleCheckBig } from "lucide-react";

import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { ListSkeleton } from "@/components/molecules/common/list-skeleton";
import { CatalogCartQuantityControl } from "@/components/molecules/catalog/catalog-cart-quantity-control";
import { CatalogShell } from "@/components/organisms/catalog/catalog-shell";
import { PhoneWhatsappInput } from "@/components/atoms/phone-whatsapp-input";
import { Textarea } from "@/components/atoms/textarea";
import { useI18n } from "@/i18n/provider";
import { catalogService } from "@/services/resources/catalog-service";
import {
  selectCatalogCartTotalItems,
  useCatalogCartStore
} from "@/store/catalog-cart-store";
import type { CatalogCartResponse, CatalogHomeResponse } from "@/types/api/catalog";
import type { DeliveryMethodResponse } from "@/types/api/delivery-method";
import type { OrderResponse } from "@/types/api/order";
import type { PaymentMethodResponse } from "@/types/api/payment-method";

function formatMoney(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

type Step = 0 | 1 | 2 | 3;

function getCatalogBaseUrl(): string {
  const envBase =
    process.env.NEXT_PUBLIC_CATALOG_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  return envBase.replace(/\/$/, "");
}

function normalizePhone(value?: string | null): string {
  return (value ?? "").replace(/\D/g, "");
}

function hasValidWhatsapp(value?: string | null): boolean {
  return normalizePhone(value).length >= 8;
}

function buildWhatsappMessage(order: OrderResponse, storeSlug: string): string {
  const createdAt = new Date(order.created_at);
  const timeText = createdAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const itemsTotal = order.products.reduce((sum, item) => sum + item.price, 0);

  const lines: string[] = [
    `Novo Pedido (${timeText}): ${order.order_number}`,
    `Tipo de entrega: ${order.is_to_deliver ? `Delivery${order.delivery_method?.name ? ` - ${order.delivery_method.name}` : ""}` : "Retirada"}`
  ];

  if (order.customer.name) lines.push(`Nome: ${order.customer.name}`);
  if (order.customer.phone) lines.push(`Telefone: ${order.customer.phone}`);
  if (order.is_to_deliver && order.customer.address) {
    const neighborhood = order.customer.neighborhood ? ` - Bairro *${order.customer.neighborhood}*` : "";
    lines.push(`Endereço: ${order.customer.address}${neighborhood}`);
  }

  lines.push("------------------------------");
  for (const item of order.products) {
    lines.push(`# ${item.amount}x ${item.product.name} (R$${item.price.toFixed(2).replace(".", ",")})`);
  }
  lines.push("------------------------------");
  if (order.observation?.trim()) {
    lines.push(`Observação: ${order.observation.trim()}`);
    lines.push("------------------------------");
  }
  lines.push(`Itens: R$${itemsTotal.toFixed(2).replace(".", ",")}`);
  lines.push("");
  lines.push(`TOTAL: R$${order.total_price.toFixed(2).replace(".", ",")}`);
  lines.push("------------------------------");
  const repeatUrl = `${getCatalogBaseUrl()}/catalog/${storeSlug}`;
  lines.push("");
  lines.push(`Para repetir o pedido: ${repeatUrl}`);

  return lines.join("\n");
}

function openOrderWhatsapp(order: OrderResponse, storeSlug: string, storeWhatsapp?: string | null): void {
  const to = normalizePhone(storeWhatsapp);
  if (!to) return;
  const message = buildWhatsappMessage(order, storeSlug);
  const url = `https://wa.me/${to}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export function CatalogCartTemplate({ storeSlug }: { storeSlug: string }) {
  const { t } = useI18n();
  const [catalogData, setCatalogData] = useState<CatalogHomeResponse | null>(null);
  const [cartData, setCartData] = useState<CatalogCartResponse | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodResponse[]>([]);
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethodResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>(0);
  const [totalPreview, setTotalPreview] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClearingCart, setIsClearingCart] = useState(false);

  const cartId = useCatalogCartStore((state) => state.cartId);
  const itemsByProductId = useCatalogCartStore((state) => state.itemsByProductId);
  const pricesByProductId = useCatalogCartStore((state) => state.pricesByProductId);
  const checkoutDraft = useCatalogCartStore((state) => state.checkoutDraft);
  const setQuantity = useCatalogCartStore((state) => state.setQuantity);
  const updateCheckoutDraft = useCatalogCartStore((state) => state.updateCheckoutDraft);
  const clearCart = useCatalogCartStore((state) => state.clearCart);

  const totalItems = useMemo(() => selectCatalogCartTotalItems(itemsByProductId), [itemsByProductId]);
  const catalogPricesByProductId = useMemo(
    () =>
      Object.fromEntries(
        (cartData?.products ?? []).map((item) => [item.product.id, item.product.price])
      ) as Record<string, number>,
    [cartData]
  );
  const localProductsTotal = useMemo(
    () =>
      Object.entries(itemsByProductId).reduce((sum, [productId, amount]) => {
        const price = pricesByProductId[productId] ?? catalogPricesByProductId[productId] ?? 0;
        return sum + (amount * price);
      }, 0),
    [catalogPricesByProductId, itemsByProductId, pricesByProductId]
  );

  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      try {
        const [home, payments, deliveries] = await Promise.all([
          catalogService.getHome(storeSlug),
          catalogService.listPaymentMethods(storeSlug),
          catalogService.listDeliveryMethods(storeSlug)
        ]);

        setCatalogData(home);
        setPaymentMethods(payments);
        setDeliveryMethods(deliveries);

        if (cartId) {
          const cart = await catalogService.getCart(storeSlug, cartId);
          setCartData(cart);
        } else {
          setCartData(null);
          setTotalPreview(0);
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("catalog.cartLoadError"));
      } finally {
        setLoading(false);
      }
    }

    void loadInitial();
  }, [cartId, storeSlug, t]);

  useEffect(() => {
    async function refreshTotalPreview() {
      if (!cartId) {
        setTotalPreview(0);
        return;
      }

      try {
        const total = await catalogService.previewCartTotal(storeSlug, cartId, {
          is_to_deliver: checkoutDraft.isToDeliver,
          delivery_method_id: checkoutDraft.deliveryMethodId || null
        });
        setTotalPreview(total);
      } catch {
        // keep last preview value
      }
    }

    void refreshTotalPreview();
  }, [cartId, checkoutDraft.deliveryMethodId, checkoutDraft.isToDeliver, itemsByProductId, storeSlug]);

  const products = useMemo(() => {
    if (!cartData) return [];
    return cartData.products
      .map((item) => ({
        ...item,
        amount: itemsByProductId[item.product.id] ?? item.amount
      }))
      .filter((item) => item.amount > 0);
  }, [cartData, itemsByProductId]);

  const selectedDelivery = useMemo(
    () => deliveryMethods.find((item) => item.id === checkoutDraft.deliveryMethodId),
    [checkoutDraft.deliveryMethodId, deliveryMethods]
  );
  const fallbackTotal = useMemo(() => {
    const deliveryPrice = checkoutDraft.isToDeliver ? (selectedDelivery?.price ?? 0) : 0;
    return localProductsTotal + deliveryPrice;
  }, [checkoutDraft.isToDeliver, localProductsTotal, selectedDelivery?.price]);
  const displayedTotal = totalItems === 0 ? 0 : (fallbackTotal > 0 ? fallbackTotal : totalPreview);

  useEffect(() => {
    if (checkoutDraft.isToDeliver && selectedDelivery && !checkoutDraft.neighborhood) {
      updateCheckoutDraft({ neighborhood: selectedDelivery.name });
    }
  }, [checkoutDraft.isToDeliver, checkoutDraft.neighborhood, selectedDelivery, updateCheckoutDraft]);

  useEffect(() => {
    function handleCartOpen() {
      setStep(0);
    }

    window.addEventListener("catalog-cart-open", handleCartOpen);
    return () => window.removeEventListener("catalog-cart-open", handleCartOpen);
  }, []);

  useEffect(() => {
    if (checkoutDraft.isToDeliver && !checkoutDraft.deliveryMethodId && deliveryMethods.length > 0) {
      const firstMethod = deliveryMethods[0];
      updateCheckoutDraft({
        deliveryMethodId: firstMethod.id,
        neighborhood: firstMethod.name
      });
    }
  }, [checkoutDraft.deliveryMethodId, checkoutDraft.isToDeliver, deliveryMethods, updateCheckoutDraft]);

  async function handleFinishOrder() {
    if (!cartId) return;

    if (!checkoutDraft.paymentMethodId) {
      setError(t("catalog.validation.paymentMethodRequired"));
      return;
    }

    if (checkoutDraft.isToDeliver && !checkoutDraft.deliveryMethodId) {
      setError(t("catalog.validation.deliveryMethodRequired"));
      return;
    }

    if (!checkoutDraft.firstName.trim()) {
      setError(t("catalog.validation.firstNameRequired"));
      return;
    }

    if (!checkoutDraft.lastName.trim()) {
      setError(t("catalog.validation.lastNameRequired"));
      return;
    }

    if (!checkoutDraft.whatsapp.trim()) {
      setError(t("catalog.validation.whatsappRequired"));
      return;
    }

    if (checkoutDraft.isToDeliver && !checkoutDraft.neighborhood.trim()) {
      setError(t("catalog.validation.neighborhoodRequired"));
      return;
    }

    if (checkoutDraft.isToDeliver && !checkoutDraft.address.trim()) {
      setError(t("catalog.validation.addressRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      const createdOrder = await catalogService.checkoutCart(storeSlug, cartId, {
        payment_method_id: checkoutDraft.paymentMethodId,
        is_to_deliver: checkoutDraft.isToDeliver,
        delivery_method_id: checkoutDraft.isToDeliver ? checkoutDraft.deliveryMethodId || null : null,
        customer: {
          first_name: checkoutDraft.firstName,
          last_name: checkoutDraft.lastName,
          whatsapp: checkoutDraft.whatsapp,
          neighborhood: checkoutDraft.isToDeliver ? checkoutDraft.neighborhood : null,
          address: checkoutDraft.isToDeliver ? checkoutDraft.address : null
        },
        observation: checkoutDraft.observation || null
      });

      if (
        catalogData?.store.is_accepted_send_order_to_whatsapp &&
        hasValidWhatsapp(catalogData.store.whatsapp)
      ) {
        openOrderWhatsapp(createdOrder, storeSlug, catalogData.store.whatsapp);
      }

      clearCart();
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.unexpectedError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleClearCart() {
    if (!cartId) {
      clearCart();
      return;
    }

    setIsClearingCart(true);
    try {
      await catalogService.deleteCart(storeSlug, cartId);
      clearCart();
      setCartData(null);
      setTotalPreview(0);
      setStep(0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.unexpectedError"));
    } finally {
      setIsClearingCart(false);
    }
  }

  if (loading && !catalogData) {
    return (
      <div className="mx-auto max-w-6xl px-3 py-4">
        <ListSkeleton items={6} className="space-y-2" itemClassName="h-16 w-full rounded-xl" />
      </div>
    );
  }

  if (!catalogData || error && !cartData) {
    return <p className="px-3 py-5 text-sm text-red-300">{error ?? t("catalog.cartUnavailable")}</p>;
  }

  return (
    <CatalogShell store={catalogData.store} storeSlug={storeSlug}>
      <div className="space-y-4 pb-24">
        {step < 3 ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep((prev) => (prev > 0 ? ((prev - 1) as Step) : prev))}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-surface-700 bg-surface-900 text-slate-100"
                  aria-label="go-back-step"
                >
                  <ArrowLeft size={16} />
                </button>
              ) : null}
              <h2 className="text-lg font-semibold">{t("catalog.cart")}</h2>
            </div>
            {totalItems > 0 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => void handleClearCart()}
                disabled={isClearingCart}
              >
                {t("catalog.clearCart")}
              </Button>
            ) : null}
          </div>
        ) : null}
        {error ? <p className="text-sm text-red-300">{error}</p> : null}

        {step === 0 ? (
          <div className="space-y-2">
            {totalItems === 0 ? <p className="text-sm text-slate-300">{t("catalog.emptyCart")}</p> : null}
            {products.map((item) => {
              const currentAmount = itemsByProductId[item.product.id] ?? item.amount;
              return (
              <div key={item.product.id} className="rounded-xl border border-surface-700 bg-surface-900/70 p-3">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                    <p className="font-medium">{item.product.name}</p>
                    {item.product.description ? (
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">{item.product.description}</p>
                    ) : null}
                    </div>
                    <p className="shrink-0 text-sm text-slate-300">{formatMoney(item.product.price)}</p>
                  </div>
                  <div className="flex justify-end">
                    <CatalogCartQuantityControl
                      quantity={currentAmount}
                      onIncrease={() => void setQuantity(item.product, currentAmount + 1)}
                      onDecrease={() => void setQuantity(item.product, currentAmount - 1)}
                      onInputQuantity={(value) => void setQuantity(item.product, value)}
                    />
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-3 rounded-xl border border-surface-700 bg-surface-900/70 p-4">
            <label className="block space-y-1 text-sm">
              <span>{t("orders.paymentMethod")}</span>
              <select
                value={checkoutDraft.paymentMethodId}
                onChange={(event) => updateCheckoutDraft({ paymentMethodId: event.target.value })}
                className="w-full rounded-xl border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-white"
              >
                <option value="">{t("orders.selectPaymentMethod")}</option>
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={checkoutDraft.isToDeliver}
                onChange={(event) =>
                  updateCheckoutDraft({
                    isToDeliver: event.target.checked,
                    deliveryMethodId: event.target.checked ? checkoutDraft.deliveryMethodId : ""
                  })
                }
              />
              <span>{t("orders.delivery")}</span>
            </label>

            {checkoutDraft.isToDeliver ? (
              <label className="block space-y-1 text-sm">
                <span>{t("orders.neighborhood")}</span>
                <select
                  required
                  value={checkoutDraft.deliveryMethodId}
                  onChange={(event) => {
                    const method = deliveryMethods.find((item) => item.id === event.target.value);
                    updateCheckoutDraft({
                      deliveryMethodId: event.target.value,
                      neighborhood: method?.name ?? checkoutDraft.neighborhood
                    });
                  }}
                  className="w-full rounded-xl border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-white"
                >
                  <option value="">{t("orders.selectNeighborhood")}</option>
                  {deliveryMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {`${method.name} (${formatMoney(method.price)})`}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3 rounded-xl border border-surface-700 bg-surface-900/70 p-4">
            <label className="block space-y-1 text-sm">
              <span>{`${t("auth.firstName")} *`}</span>
              <Input value={checkoutDraft.firstName} onChange={(event) => updateCheckoutDraft({ firstName: event.target.value })} />
            </label>
            <label className="block space-y-1 text-sm">
              <span>{`${t("auth.lastName")} *`}</span>
              <Input value={checkoutDraft.lastName} onChange={(event) => updateCheckoutDraft({ lastName: event.target.value })} />
            </label>
            <label className="block space-y-1 text-sm">
              <span>{`${t("store.whatsapp")} *`}</span>
              <PhoneWhatsappInput
                value={checkoutDraft.whatsapp}
                onChange={(value) => updateCheckoutDraft({ whatsapp: value })}
              />
            </label>

            {checkoutDraft.isToDeliver ? (
              <>
                <label className="block space-y-1 text-sm">
                  <span>{`${t("orders.neighborhood")} *`}</span>
                <select
                    required
                    value={checkoutDraft.deliveryMethodId}
                    onChange={(event) => {
                      const method = deliveryMethods.find((item) => item.id === event.target.value);
                      updateCheckoutDraft({
                        deliveryMethodId: event.target.value,
                        neighborhood: method?.name ?? ""
                      });
                    }}
                    className="w-full rounded-xl border border-surface-700 bg-surface-900 px-3 py-2 text-sm text-white"
                  >
                    <option value="">{t("orders.selectNeighborhood")}</option>
                    {deliveryMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {`${method.name} (${formatMoney(method.price)})`}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1 text-sm">
                  <span>{`${t("orders.streetAddress")} *`}</span>
                  <Input
                    value={checkoutDraft.address}
                    onChange={(event) => updateCheckoutDraft({ address: event.target.value })}
                  />
                </label>
              </>
            ) : null}

            <label className="block space-y-1 text-sm">
              <span>{t("catalog.observation")}</span>
              <Textarea
                value={checkoutDraft.observation}
                onChange={(event) => updateCheckoutDraft({ observation: event.target.value })}
                placeholder={t("catalog.observation")}
              />
            </label>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="rounded-xl border border-surface-700 bg-surface-900/70 p-5 text-center">
            <CircleCheckBig className="mx-auto mb-3 h-20 w-20 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">{t("catalog.orderSuccessTitle")}</h3>
            <p className="mt-2 text-sm text-slate-300">{t("catalog.orderSuccessDescription")}</p>
            <Button
              type="button"
              className="mt-4"
              onClick={() => (window.location.href = `/catalog/${storeSlug}`)}
              style={{ backgroundColor: "var(--catalog-primary)", color: "#04110c" }}
            >
              {t("catalog.backToHome")}
            </Button>
          </div>
        ) : null}
      </div>

      {step < 3 ? (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-surface-700 bg-surface-950/95 p-3 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
            <div>
              <p className="text-xs text-slate-400">{`${t("catalog.items")}: ${totalItems}`}</p>
              <p className="text-base font-semibold" style={{ color: "var(--catalog-primary-soft)" }}>
                {`${t("catalog.total")}: ${formatMoney(displayedTotal)}`}
              </p>
            </div>
            <Button
              type="button"
              disabled={
                isSubmitting ||
                totalItems === 0 ||
                (step === 1 && checkoutDraft.isToDeliver && !checkoutDraft.deliveryMethodId)
              }
              onClick={() => {
                if (step === 0) {
                  setStep(1);
                  return;
                }
                if (step === 1) {
                  if (checkoutDraft.isToDeliver && !checkoutDraft.deliveryMethodId) {
                    setError(t("catalog.validation.deliveryMethodRequired"));
                    return;
                  }
                  setStep(2);
                  return;
                }
                if (step === 2) {
                  void handleFinishOrder();
                }
              }}
              style={{ backgroundColor: "var(--catalog-primary)", color: "#04110c" }}
            >
              {step < 2 ? t("common.next") : isSubmitting ? t("common.loading") : t("catalog.send")}
            </Button>
          </div>
        </div>
      ) : null}
    </CatalogShell>
  );
}
