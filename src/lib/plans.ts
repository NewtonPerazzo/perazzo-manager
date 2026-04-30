export const planIds = ["free", "essential", "pro"] as const;

export type PlanId = (typeof planIds)[number];

export type PlanFeatureValue = "unlimited" | "7_days" | "10/month" | "50/month" | "9h_to_20h_every_day";

export type PlanDefinition = {
  id: PlanId;
  name: string;
  priceCents: number;
  billingPeriodDays: number | null;
  monthlyOrderLimit: number | null;
  advancedFeaturesTrialDays: number | null;
  features: {
    catalog: PlanFeatureValue;
    orders: PlanFeatureValue;
    whatsappOrders: PlanFeatureValue;
    orderEditing: PlanFeatureValue;
    cashRegister: PlanFeatureValue;
    couriers: PlanFeatureValue;
    tutorialsAndSupport: PlanFeatureValue;
  };
};

export const planCatalog: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    priceCents: 0,
    billingPeriodDays: null,
    monthlyOrderLimit: 10,
    advancedFeaturesTrialDays: 7,
    features: {
      catalog: "unlimited",
      orders: "10/month",
      whatsappOrders: "7_days",
      orderEditing: "7_days",
      cashRegister: "7_days",
      couriers: "7_days",
      tutorialsAndSupport: "9h_to_20h_every_day"
    }
  },
  essential: {
    id: "essential",
    name: "Essential",
    priceCents: 2500,
    billingPeriodDays: 30,
    monthlyOrderLimit: 50,
    advancedFeaturesTrialDays: null,
    features: {
      catalog: "unlimited",
      orders: "50/month",
      whatsappOrders: "unlimited",
      orderEditing: "unlimited",
      cashRegister: "unlimited",
      couriers: "unlimited",
      tutorialsAndSupport: "9h_to_20h_every_day"
    }
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceCents: 5000,
    billingPeriodDays: 30,
    monthlyOrderLimit: null,
    advancedFeaturesTrialDays: null,
    features: {
      catalog: "unlimited",
      orders: "unlimited",
      whatsappOrders: "unlimited",
      orderEditing: "unlimited",
      cashRegister: "unlimited",
      couriers: "unlimited",
      tutorialsAndSupport: "9h_to_20h_every_day"
    }
  }
};

export function normalizePlan(plan?: string | null): PlanId {
  return planIds.includes(plan as PlanId) ? (plan as PlanId) : "free";
}

export function getPlan(plan?: string | null): PlanDefinition {
  return planCatalog[normalizePlan(plan)];
}

export function isFree(plan?: string | null): boolean {
  return normalizePlan(plan) === "free";
}

export function isEssential(plan?: string | null): boolean {
  return normalizePlan(plan) === "essential";
}

export function isPro(plan?: string | null): boolean {
  return normalizePlan(plan) === "pro";
}
