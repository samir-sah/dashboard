'use client'

import { ShoppingBag, Users, Package, Truck, AlertTriangle, Wallet, TrendingUp, IndianRupee, PackageCheck } from "lucide-react"

const iconMap = {
  "total-revenue": Wallet,
  "total-orders": ShoppingBag,
  "active-customers": Users,
  "pending-deliveries": Truck,
  "low-stock-products": AlertTriangle,
  "avg-order-value": Wallet,
  "conversion-rate": TrendingUp,
  "avg-session-duration": Users,
  "cart-abandonment": ShoppingBag,
  "pending-deliveries-insight": Truck,
  "todays-revenue": IndianRupee,
  "todays-orders": Package,
  "delivered-orders-insight": PackageCheck,
}

const colorMap = {
  "total-revenue": { bg: "bg-brand-50 text-brand-800", stroke: "#2f8159" },
  "total-orders": { bg: "bg-brand-50 text-brand-700", stroke: "#57a47b" },
  "active-customers": { bg: "bg-brand-100 text-brand-900", stroke: "#246646" },
  "pending-deliveries": { bg: "bg-orange-100 text-orange-600", stroke: "#ea580c" },
  "low-stock-products": { bg: "bg-red-100 text-red-600", stroke: "#dc2626" },
  "avg-order-value": { bg: "bg-brand-50 text-brand-800", stroke: "#2f8159" },
  "conversion-rate": { bg: "bg-brand-100 text-brand-900", stroke: "#246646" },
  "avg-session-duration": { bg: "bg-surface-2 text-muted-foreground", stroke: "#5d5d6e" },
  "cart-abandonment": { bg: "bg-rose-100 text-rose-600", stroke: "#e11d48" },
  "pending-deliveries-insight": { bg: "bg-orange-100 text-orange-600", stroke: "#ea580c" },
  "todays-revenue": { bg: "bg-brand-50 text-brand-800", stroke: "#2f8159" },
  "todays-orders": { bg: "bg-brand-50 text-brand-700", stroke: "#57a47b" },
  "delivered-orders-insight": { bg: "bg-brand-100 text-brand-900", stroke: "#246646" },
}

export default function DashboardKPICard({ kpi }) {
  const Icon = iconMap[kpi.id] || ShoppingBag;
  const colors = colorMap[kpi.id] || { bg: "bg-surface-2 text-muted-foreground", stroke: "#5d5d6e" };

  return (
    <div className="kpi-card group relative flex min-h-[108px] items-center overflow-hidden rounded-[1.1rem] border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition-all duration-200 ease-out">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] opacity-80" />
      <div className="flex w-full items-center gap-4">
        <div className={`rounded-full p-3 ${colors.bg}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold uppercase text-muted-foreground">{kpi.label}</span>
          <span className="text-2xl font-semibold leading-none text-ink">{kpi.value}</span>
        </div>
      </div>
    </div>
  )
}
