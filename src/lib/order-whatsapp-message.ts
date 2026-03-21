import type { OrderResponse } from "@/types/api/order";

interface BuildOrderWhatsappMessageOptions {
  repeatUrl?: string;
}

export function buildOrderWhatsappMessage(
  order: OrderResponse,
  options?: BuildOrderWhatsappMessageOptions
): string {
  const createdAt = new Date(order.created_at);
  const timeText = createdAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const itemsTotal = order.products.reduce((sum, item) => sum + item.price, 0);
  const deliveryTotal = Math.max(0, order.total_price - itemsTotal);

  const lines: string[] = [
    `Novo Pedido (${timeText}): ${order.order_number}`,
    `Tipo de entrega: ${order.is_to_deliver
      ? `Delivery${order.delivery_method?.name ? ` - ${order.delivery_method.name}` : ""}${order.delivery_method ? ` (R$${order.delivery_method.price.toFixed(2).replace(".", ",")})` : ""}`
      : "Retirada"}`
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
  if (order.is_to_deliver) {
    lines.push(`Entrega: R$${deliveryTotal.toFixed(2).replace(".", ",")}`);
  }
  lines.push("");
  lines.push(`TOTAL: R$${order.total_price.toFixed(2).replace(".", ",")}`);
  lines.push("------------------------------");

  if (options?.repeatUrl) {
    lines.push("");
    lines.push(`Para repetir o pedido: ${options.repeatUrl}`);
  }

  return lines.join("\n");
}

