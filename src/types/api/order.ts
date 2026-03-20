import type { UUID } from "@/types/api/common";
import type { ProductResponse } from "@/types/api/product";
import type { CustomerResponse } from "@/types/api/customer";
import type { CourierResponse } from "@/types/api/courier";
import type { DeliveryMethodResponse } from "@/types/api/delivery-method";

export type OrderStatus =
  | "confirmed"
  | "canceled"
  | "preparing"
  | "in_transit"
  | "pending"
  | "deliveried";

export interface ProductOrderCreatePayload {
  product_id: UUID;
  amount: number;
}

export interface OrderCreatePayload {
  products: ProductOrderCreatePayload[];
  customer: {
    name: string;
    phone: string;
    address?: string | null;
    neighborhood?: string | null;
    email?: string | null;
  };
  is_to_deliver?: boolean;
  delivery_method_id?: UUID | null;
  courier_id?: UUID | null;
  payment_method: string;
}

export interface OrderTotalPreviewPayload {
  products: ProductOrderCreatePayload[];
  is_to_deliver?: boolean;
  delivery_method_id?: UUID | null;
}

export interface OrderTotalPreviewResponse {
  total_price: number;
}

export interface OrderStatusUpdatePayload {
  status: OrderStatus;
}

export interface ProductOrderResponse {
  product: ProductResponse;
  amount: number;
  price: number;
}

export interface OrderResponse {
  id: UUID;
  order_number: string;
  products: ProductOrderResponse[];
  customer: CustomerResponse;
  is_to_deliver: boolean;
  delivery_method?: DeliveryMethodResponse | null;
  courier?: CourierResponse | null;
  status: OrderStatus;
  payment_method: string;
  observation?: string | null;
  total_price: number;
  created_at: string;
  updated_at: string;
}
