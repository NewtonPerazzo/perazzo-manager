import type { UUID } from "@/types/api/common";

export type CashEntryType = "entry" | "expense";
export type CashPeriodView = "day" | "week" | "month" | "year";

export interface CashRegisterEntryPayload {
  entry_type: CashEntryType;
  name: string;
  amount: number;
  payment_method?: string | null;
  is_profit?: boolean;
  note?: string | null;
  occurred_on?: string | null;
}

export interface CashRegisterEntryUpdatePayload {
  entry_type?: CashEntryType;
  name?: string;
  amount?: number;
  payment_method?: string | null;
  is_profit?: boolean;
  note?: string | null;
  occurred_on?: string | null;
}

export interface CashRegisterEntryResponse {
  id: UUID;
  entry_type: CashEntryType;
  name: string;
  amount: number;
  payment_method?: string | null;
  is_profit: boolean;
  note?: string | null;
  occurred_on: string;
  created_at: string;
  updated_at: string;
}

export interface CashRegisterOrderAutoEntryResponse {
  name: string;
  amount: number;
  payment_method: string;
}

export interface CashRegisterByPaymentResponse {
  payment_method: string;
  entries: number;
  expenses: number;
  net: number;
}

export interface CashRegisterSummaryResponse {
  period_view: CashPeriodView;
  period_start: string;
  period_end: string;
  target_date: string;
  auto_entries: CashRegisterOrderAutoEntryResponse[];
  manual_entries: CashRegisterEntryResponse[];
  manual_expenses: CashRegisterEntryResponse[];
  profit_entries: CashRegisterEntryResponse[];
  by_payment_method: CashRegisterByPaymentResponse[];
  totals: {
    auto_entries: number;
    manual_entries: number;
    entries_total: number;
    expenses_total: number;
    profits_total: number;
    balance: number;
  };
}
