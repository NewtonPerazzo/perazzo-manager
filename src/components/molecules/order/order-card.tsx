"use client";

import { MessageCircle } from "lucide-react";

import { Button } from "@/components/atoms/button";
import { ImageDisplay } from "@/components/atoms/image-display";
import { OrderStatusTag } from "@/components/molecules/order/order-status-tag";
import { useI18n } from "@/i18n/provider";
import type { OrderResponse, OrderStatus } from "@/types/api/order";

export function OrderCard({
  order,
  onSendWhatsapp,
  onStatusChange,
  onEdit,
  onDelete
}: {
  order: OrderResponse;
  onSendWhatsapp: (order: OrderResponse) => void;
  onStatusChange: (order: OrderResponse, status: OrderStatus) => Promise<void> | void;
  onEdit: (order: OrderResponse) => void;
  onDelete: (order: OrderResponse) => void;
}) {
  const { t, locale } = useI18n();
  const hasName =
    Boolean(order.customer.name?.trim()) &&
    order.customer.name.trim().toLowerCase() !== "cliente" &&
    order.customer.name.trim().toLowerCase() !== "cliente removido";
  const hasPhone =
    Boolean(order.customer.phone?.trim()) &&
    order.customer.phone.trim() !== "-";
  const itemsSubtotal = order.products.reduce((sum, item) => sum + item.price, 0);
  const createdAtText = new Date(order.created_at).toLocaleString(
    locale === "pt-br" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US"
  );

  return (
    <div className="rounded-xl border border-surface-700 p-3">
      <div className="flex min-w-0 items-center gap-2">
        <p className="min-w-0 truncate text-sm font-semibold text-slate-100">
          {t("orders.number")}: {order.order_number}
        </p>
        <OrderStatusTag status={order.status} onChange={(status) => onStatusChange(order, status)} />
      </div>

      <div className="mt-3 space-y-2">
        {order.products.map((item, index) => (
          <div key={`${order.id}-product-${index}`} className="flex items-center gap-3 rounded-lg border border-surface-700 p-2">
            <ImageDisplay
              src={item.product.image_url}
              alt={item.product.name}
              width={52}
              height={52}
              className="h-[52px] w-[52px] shrink-0 rounded-md border border-surface-700 object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm text-slate-100">{item.product.name}</p>
              <p className="text-xs text-slate-300">{`R$ ${item.product.price.toFixed(2)}`}</p>
              <p className="text-xs text-slate-400">{`x${item.amount}`}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-1 text-sm text-slate-200">
        {hasName ? <p>{`${t("customers.name")}: ${order.customer.name}`}</p> : null}
        <p className="text-xs text-slate-400">{createdAtText}</p>
        {order.is_to_deliver ? <p>{`${t("orders.itemsTotal")}: R$ ${itemsSubtotal.toFixed(2)}`}</p> : null}
        {hasPhone ? <p>{`${t("customers.phone")}: ${order.customer.phone}`}</p> : null}
        {order.is_to_deliver && order.customer.address ? (
          <p>{`${t("customers.address")}: ${order.customer.address}`}</p>
        ) : null}
        <p>
          {order.is_to_deliver
            ? `${t("orders.delivery")} - ${order.delivery_method?.name ?? t("orders.neighborhoodNotSet")}${order.delivery_method ? ` (R$ ${order.delivery_method.price.toFixed(2)})` : ""}`
            : t("orders.pickup")}
        </p>
        <p>{`${t("orders.paymentMethod")}: ${order.payment_method}`}</p>
        <p className="font-semibold text-slate-100">{`${t("orders.total")}: R$ ${order.total_price.toFixed(2)}`}</p>
      </div>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button type="button" variant="ghost" onClick={() => onEdit(order)} className="w-full sm:w-auto">
          {t("common.edit")}
        </Button>
        <Button type="button" variant="danger" onClick={() => onDelete(order)} className="w-full sm:w-auto">
          {t("common.delete")}
        </Button>
        <Button type="button" onClick={() => onSendWhatsapp(order)} className="w-full sm:w-auto">
          <span className="inline-flex items-center gap-2">
            <MessageCircle size={16} />
            {t("orders.sendWhatsapp")}
          </span>
        </Button>
      </div>
    </div>
  );
}
