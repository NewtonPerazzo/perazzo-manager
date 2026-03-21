"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Modal } from "@/components/atoms/modal";
import { ConfirmDeleteModal } from "@/components/molecules/common/confirm-delete-modal";
import { ListSkeleton } from "@/components/molecules/common/list-skeleton";
import { WhatsappPhoneModal } from "@/components/molecules/common/whatsapp-phone-modal";
import { OrderCard } from "@/components/molecules/order/order-card";
import { OrderForm } from "@/components/molecules/order/order-form";
import { useUiFeedback } from "@/hooks/use-ui-feedback";
import { useI18n } from "@/i18n/provider";
import { buildOrderWhatsappMessage } from "@/lib/order-whatsapp-message";
import { hasValidWhatsapp, normalizePhone } from "@/lib/phone";
import { courierService } from "@/services/resources/courier-service";
import { customerService } from "@/services/resources/customer-service";
import { deliveryMethodService } from "@/services/resources/delivery-method-service";
import { orderService } from "@/services/resources/order-service";
import { paymentMethodService } from "@/services/resources/payment-method-service";
import { productService } from "@/services/resources/product-service";
import { storeService } from "@/services/resources/store-service";
import { useAuthStore } from "@/store/auth-store";
import { useUiFeedbackStore } from "@/store/ui-feedback-store";
import type { PaymentMethodResponse } from "@/types/api/payment-method";
import type { ProductResponse } from "@/types/api/product";
import type { CourierResponse } from "@/types/api/courier";
import type { DeliveryMethodResponse } from "@/types/api/delivery-method";
import type { OrderCreatePayload, OrderResponse, OrderStatus } from "@/types/api/order";

const PAGE_SIZE = 10;

function getCatalogBaseUrl(): string {
  const envBase =
    process.env.NEXT_PUBLIC_CATALOG_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  return envBase.replace(/\/$/, "");
}

function getTodayDateInputValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function OrdersTemplate({
  initialData,
  paymentMethods,
  deliveryMethods,
  initialStoreWhatsapp,
  initialStoreSlug
}: {
  initialData: OrderResponse[];
  paymentMethods: PaymentMethodResponse[];
  deliveryMethods: DeliveryMethodResponse[];
  initialStoreWhatsapp?: string | null;
  initialStoreSlug?: string | null;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const { runWithFeedback } = useUiFeedback();
  const isSubmitting = useUiFeedbackStore((state) => Boolean(state.loadingByKey["orders:submit"]));
  const isDeletingOrder = useUiFeedbackStore((state) => Boolean(state.loadingByKey["orders:delete"]));
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderResponse | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<OrderResponse | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>(initialData);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [totalOrders, setTotalOrders] = useState(initialData.length);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayDateInputValue());
  const [storeWhatsapp, setStoreWhatsapp] = useState(initialStoreWhatsapp ?? "");
  const [storeSlug, setStoreSlug] = useState(initialStoreSlug ?? "");
  const [availableProducts, setAvailableProducts] = useState<ProductResponse[]>([]);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<PaymentMethodResponse[]>(
    paymentMethods
  );
  const [availableDeliveryMethods, setAvailableDeliveryMethods] = useState<DeliveryMethodResponse[]>(
    deliveryMethods
  );
  const [availableCouriers, setAvailableCouriers] = useState<CourierResponse[]>([]);
  const [totalCouriers, setTotalCouriers] = useState(0);
  const [pendingWhatsappOrder, setPendingWhatsappOrder] = useState<OrderResponse | null>(null);
  const [pendingWhatsappTarget, setPendingWhatsappTarget] = useState<"customer" | "store">("customer");
  const [phoneModalTarget, setPhoneModalTarget] = useState<"store" | "customer" | null>(null);
  const [isSavingWhatsapp, setIsSavingWhatsapp] = useState(false);
  const hasPreviousPage = page > 1;
  const hasNextPage = page * PAGE_SIZE < totalOrders;

  const loadOrders = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoadingOrders(true);
      const response = await orderService.list(token, {
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
        search: searchTerm || undefined,
        orderDate: selectedDate
      });
      setOrders(response.items);
      setTotalOrders(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.unexpectedError"));
    } finally {
      setIsLoadingOrders(false);
    }
  }, [page, searchTerm, selectedDate, t, token]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadOrders();
    }, 500);
    return () => clearTimeout(timeout);
  }, [loadOrders]);

  useEffect(() => {
    async function loadStoreSummary() {
      if (!token) return;
      if (storeWhatsapp && storeSlug) return;
      try {
        const store = await storeService.getMyStore(token);
        setStoreWhatsapp((prev) => prev || store.whatsapp || "");
        setStoreSlug((prev) => prev || store.slug || "");
      } catch {
        // Keep order flow available even if store summary fails.
      }
    }

    void loadStoreSummary();
  }, [storeSlug, storeWhatsapp, token]);

  useEffect(() => {
    async function loadCouriersForListActions() {
      if (!token) return;
      try {
        const couriers = await courierService.list(token, { skip: 0, limit: 200 });
        setAvailableCouriers(couriers.items);
        setTotalCouriers(couriers.total);
      } catch {
        // Keep orders list available if couriers fails.
      }
    }

    void loadCouriersForListActions();
  }, [token]);

  useEffect(() => {
    async function loadOrderDependencies() {
      if (!token || !open) return;

      try {
        if (availableProducts.length === 0) {
          const productResponse = await productService.list(token, { skip: 0, limit: 200 });
          setAvailableProducts(productResponse.items);
        }
      } catch {
        // Keep form usable even if products call fails.
      }

      try {
        if (availablePaymentMethods.length === 0) {
          const methods = await paymentMethodService.list(token);
          setAvailablePaymentMethods(methods);
        }
      } catch {
        // Keep form usable even if payment methods call fails.
      }

      try {
        if (availableDeliveryMethods.length === 0) {
          const methods = await deliveryMethodService.list(token, { skip: 0, limit: 200 });
          setAvailableDeliveryMethods(methods.items);
        }
      } catch {
        // Keep form usable even if delivery methods call fails.
      }

      try {
        if (availableCouriers.length === 0) {
          const couriers = await courierService.list(token, { skip: 0, limit: 200 });
          setAvailableCouriers(couriers.items);
          setTotalCouriers(couriers.total);
        }
      } catch {
        // Keep form usable even if couriers call fails.
      }
    }

    void loadOrderDependencies();
  }, [availableCouriers.length, availableDeliveryMethods.length, availablePaymentMethods.length, availableProducts.length, open, token]);

  async function handleSubmit(payload: OrderCreatePayload) {
    if (!token) return;

    const result = await runWithFeedback(
      "orders:submit",
      async () => {
        setError(null);
        if (editingOrder) {
          const updated = await orderService.update(token, editingOrder.id, payload);
          setOrders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        } else {
          const created = await orderService.create(token, payload);
          setOrders((prev) => [created, ...prev]);
          setTotalOrders((prev) => prev + 1);
        }
      },
      {
        successMessage: editingOrder ? t("common.updatedSuccess") : t("common.createdSuccess"),
        mapErrorMessage: (error) => {
          const message = error instanceof Error ? error.message : "";
          if (message.includes("Delivery method is required when delivery is selected")) {
            return t("orders.selectNeighborhoodToast");
          }
          return message || t("common.unexpectedError");
        },
        mapErrorVariant: (error) => {
          const message = error instanceof Error ? error.message : "";
          return message.includes("Delivery method is required when delivery is selected")
            ? "warning"
            : "error";
        }
      }
    );

    if (!result.ok) {
      return;
    }
    setOpen(false);
    setEditingOrder(null);
    void loadOrders();
    router.refresh();
  }

  function openCreateModal() {
    setError(null);
    setEditingOrder(null);
    setOpen(true);
  }

  function openEditModal(order: OrderResponse) {
    setError(null);
    setEditingOrder(order);
    setOpen(true);
  }

  async function handleDeleteOrder(order: OrderResponse) {
    if (!token) return;

    const result = await runWithFeedback(
      "orders:delete",
      async () => {
        setError(null);
        await orderService.remove(token, order.id);
      },
      {
        successMessage: t("common.deletedSuccess")
      }
    );

    if (!result.ok) {
      return;
    }
    setDeletingOrder(null);
    setTotalOrders((prev) => Math.max(0, prev - 1));
    void loadOrders();
    router.refresh();
  }

  async function handleStatusChange(order: OrderResponse, status: OrderStatus) {
    if (!token || order.status === status) return;

    try {
      setError(null);
      const updated = await orderService.updateStatus(token, order.id, status);
      setOrders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.unexpectedError"));
    }
  }

  function openWhatsapp(order: OrderResponse, customerPhone: string) {
    const repeatUrl = storeSlug ? `${getCatalogBaseUrl()}/catalog/${storeSlug}` : undefined;
    const message = buildOrderWhatsappMessage(order, { repeatUrl });
    const to = normalizePhone(customerPhone);
    const url = `https://wa.me/${to}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function resetWhatsappFlow() {
    setPendingWhatsappOrder(null);
    setPendingWhatsappTarget("customer");
    setPhoneModalTarget(null);
    setIsSavingWhatsapp(false);
  }

  function startSendToCustomerWhatsapp(order: OrderResponse) {
    setError(null);
    setPendingWhatsappOrder(order);
    setPendingWhatsappTarget("customer");

    if (!hasValidWhatsapp(storeWhatsapp)) {
      setPhoneModalTarget("store");
      return;
    }

    if (!hasValidWhatsapp(order.customer.phone)) {
      setPhoneModalTarget("customer");
      return;
    }

    openWhatsapp(order, order.customer.phone);
    resetWhatsappFlow();
  }

  function startReceiveOnStoreWhatsapp(order: OrderResponse) {
    setError(null);
    setPendingWhatsappOrder(order);
    setPendingWhatsappTarget("store");

    if (!hasValidWhatsapp(storeWhatsapp)) {
      setPhoneModalTarget("store");
      return;
    }

    openWhatsapp(order, storeWhatsapp);
    resetWhatsappFlow();
  }

  async function handleConfirmWhatsapp(phone: string) {
    if (!token || !pendingWhatsappOrder) return;

    try {
      setIsSavingWhatsapp(true);
      const normalized = normalizePhone(phone);

      if (phoneModalTarget === "store") {
        await storeService.updateStorePartial(token, { whatsapp: normalized });
        setStoreWhatsapp(normalized);

        if (pendingWhatsappTarget === "store") {
          openWhatsapp(pendingWhatsappOrder, normalized);
          resetWhatsappFlow();
          return;
        }

        if (!hasValidWhatsapp(pendingWhatsappOrder.customer.phone)) {
          setPhoneModalTarget("customer");
          return;
        }

        openWhatsapp(pendingWhatsappOrder, pendingWhatsappOrder.customer.phone);
        resetWhatsappFlow();
        return;
      }

      if (phoneModalTarget === "customer") {
        const updatedCustomer = await customerService.update(token, pendingWhatsappOrder.customer.id, {
          phone: normalized
        });

        const updatedOrder: OrderResponse = {
          ...pendingWhatsappOrder,
          customer: {
            ...pendingWhatsappOrder.customer,
            phone: updatedCustomer.phone
          }
        };

        setOrders((prev) =>
          prev.map((order) =>
            order.id === updatedOrder.id ? updatedOrder : order
          )
        );

        openWhatsapp(updatedOrder, updatedCustomer.phone);
        resetWhatsappFlow();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.unexpectedError"));
    } finally {
      setIsSavingWhatsapp(false);
    }
  }

  return (
    <>
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white">{`${t("orders.title")} - ${totalOrders}`}</h1>
            <p className="text-sm text-slate-300">{t("orders.subtitle")}</p>
          </div>
          <Button onClick={openCreateModal} disabled={isSubmitting || isDeletingOrder}>
            {t("common.addNew")}
          </Button>
        </div>

        <div className="mb-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px]">
            <Input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
              placeholder={t("orders.searchPlaceholder")}
            />
            <Input
              type="date"
              value={selectedDate}
              onChange={(event) => {
                setSelectedDate(event.target.value || getTodayDateInputValue());
                setPage(1);
              }}
              aria-label={t("orders.filterDate")}
            />
          </div>
        </div>

        <div className="space-y-4">
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          {isLoadingOrders && orders.length === 0 ? (
            <ListSkeleton items={3} className="space-y-2" itemClassName="h-36 w-full rounded-xl" />
          ) : null}
          {!isLoadingOrders && orders.length === 0 ? (
            <p className="text-sm text-slate-300">{t("common.empty")}</p>
          ) : (
            !isLoadingOrders &&
            orders.map((order, index) => (
              <div key={order.id} className="space-y-4">
                <OrderCard
                  order={order}
                  onSendToCustomerWhatsapp={startSendToCustomerWhatsapp}
                  onReceiveOnStoreWhatsapp={startReceiveOnStoreWhatsapp}
                  onStatusChange={handleStatusChange}
                  showAssociateCourierButton={totalCouriers > 1}
                  onAssociateCourier={openEditModal}
                  onEdit={openEditModal}
                  onDelete={setDeletingOrder}
                />
                {index < orders.length - 1 ? <div className="border-b border-surface-700/70" /> : null}
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button variant="ghost" disabled={!hasPreviousPage} onClick={() => setPage((prev) => prev - 1)}>
            {t("common.previous")}
          </Button>
          <span className="text-sm text-slate-300">{`${t("common.page")} ${page}`}</span>
          <Button variant="ghost" disabled={!hasNextPage} onClick={() => setPage((prev) => prev + 1)}>
            {t("common.next")}
          </Button>
        </div>
      </Card>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditingOrder(null);
        }}
        title={editingOrder ? t("common.edit") : t("orders.title")}
      >
        {error ? <p className="mb-2 text-sm text-red-300">{error}</p> : null}
            <OrderForm
              onSubmit={handleSubmit}
              products={availableProducts}
              paymentMethods={availablePaymentMethods}
              deliveryMethods={availableDeliveryMethods}
              couriers={availableCouriers}
              initialData={editingOrder}
              submitLabel={editingOrder ? t("common.save") : t("common.create")}
            />
      </Modal>

      <WhatsappPhoneModal
        open={phoneModalTarget === "store"}
        title={t("orders.storeWhatsappModalTitle")}
        description={t("orders.storeWhatsappModalDescription")}
        initialValue={storeWhatsapp}
        isLoading={isSavingWhatsapp}
        onCancel={resetWhatsappFlow}
        onConfirm={handleConfirmWhatsapp}
      />

      <WhatsappPhoneModal
        open={phoneModalTarget === "customer"}
        title={t("orders.customerWhatsappModalTitle")}
        description={t("orders.customerWhatsappModalDescription")}
        initialValue={pendingWhatsappOrder?.customer.phone ?? ""}
        isLoading={isSavingWhatsapp}
        onCancel={resetWhatsappFlow}
        onConfirm={handleConfirmWhatsapp}
      />

      <ConfirmDeleteModal
        open={Boolean(deletingOrder)}
        onClose={() => setDeletingOrder(null)}
        onConfirm={async () => {
          if (!deletingOrder) return;
          await handleDeleteOrder(deletingOrder);
        }}
        isLoading={isDeletingOrder}
      />

    </>
  );
}
