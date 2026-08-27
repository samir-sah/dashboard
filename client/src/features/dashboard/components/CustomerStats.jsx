'use client'

import { Users, UserCheck, Repeat } from "lucide-react"
import { useDashboardCustomerStats } from "../hooks/useDashboard"

export default function CustomerStats({ params }) {
  const query = useDashboardCustomerStats(params)
  const customerStatsData = query.data

  return (
    <div className="flex h-full w-full flex-col rounded-[1.1rem] border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-semibold text-ink">Customer Stats</h3>
      </div>

      {query.isLoading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-[1.1rem] bg-surface-elevated" />)}</div>
      ) : query.error ? (
        <div className="rounded-[1.1rem] border border-red-100 bg-red-50 p-4 text-sm text-red-700">{query.error.message}</div>
      ) : (
        <div className="flex flex-col gap-6 flex-1 justify-center">
          {[
            { label: "New Customers", value: customerStatsData?.newCustomers?.value ?? 0, trend: customerStatsData?.newCustomers?.trend, icon: Users, color: "text-brand-700" },
            { label: "Returning Customers", value: customerStatsData?.returningCustomers?.value ?? 0, trend: customerStatsData?.returningCustomers?.trend, icon: UserCheck, color: "text-brand-800" },
            { label: "Repeat Purchase Rate", value: customerStatsData?.repeatPurchaseRate?.value ?? "0.0%", trend: customerStatsData?.repeatPurchaseRate?.trend, icon: Repeat, color: "text-brand-900" },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="flex items-center justify-between rounded-[1.1rem] border border-border bg-surface-2/70 p-4">
                <div className="flex items-center gap-4">
                  <div className={`rounded-full border border-border bg-background p-3 shadow-xs ${item.color}`}><Icon className="w-5 h-5" /></div>
                  <span className="text-base font-semibold text-foreground">{item.label}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-2xl font-semibold leading-none text-ink">{item.value}</span>
                  {item.trend ? <span className="text-xs font-semibold text-brand-700">{item.trend}</span> : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
