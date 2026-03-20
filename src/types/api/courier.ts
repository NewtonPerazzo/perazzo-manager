import type { UUID } from "@/types/api/common";

export type CourierPeriodView = "day" | "week" | "month" | "year";
export type CourierAdjustmentType = "add" | "remove";

export interface CourierPayload {
  name: string;
  address?: string | null;
}

export interface CourierResponse {
  id: UUID;
  name: string;
  address?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CourierAdjustmentPayload {
  adjustment_type: CourierAdjustmentType;
  amount: number;
  courier_id?: UUID | null;
  payment_method?: string | null;
  note?: string | null;
  occurred_on?: string | null;
}

export interface CourierAdjustmentResponse {
  id: UUID;
  adjustment_type: CourierAdjustmentType;
  amount: number;
  courier_id?: UUID | null;
  payment_method?: string | null;
  note?: string | null;
  occurred_on: string;
  created_at: string;
  updated_at: string;
  courier?: CourierResponse | null;
}

export interface CourierSummaryTotals {
  deliveries_count: number;
  deliveries_amount: number;
  adjustments_total: number;
  total_earnings: number;
}

export interface CourierSummaryItem {
  courier?: CourierResponse | null;
  totals: CourierSummaryTotals;
}

export interface CourierSummaryResponse {
  period_view: CourierPeriodView;
  period_start: string;
  period_end: string;
  target_date: string;
  riders: CourierSummaryItem[];
  unassigned: CourierSummaryItem;
  adjustments: CourierAdjustmentResponse[];
  totals: CourierSummaryTotals;
}

