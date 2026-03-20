"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n/provider";

const items = [
  { href: "/dashboard", key: "nav.home" },
  { href: "/dashboard/products", key: "nav.products" },
  { href: "/dashboard/categories", key: "nav.categories" },
  { href: "/dashboard/customers", key: "nav.customers" },
  { href: "/dashboard/orders", key: "nav.orders" },
  { href: "/dashboard/couriers", key: "nav.couriers" },
  { href: "/dashboard/cash-register", key: "nav.cashRegister" },
  { href: "/dashboard/delivery-methods", key: "nav.deliveryMethods" },
  { href: "/dashboard/payment-methods", key: "nav.paymentMethods" }
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav className="grid gap-2 pt-2">
      {items.map((item) => {
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "rounded-xl px-3 py-2 text-sm transition",
              active
                ? "bg-accent-500 text-surface-950"
                : "text-slate-200 hover:bg-surface-800"
            )}
          >
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}
