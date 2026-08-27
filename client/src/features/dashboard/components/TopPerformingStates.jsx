'use client'

import { useDashboardStateOrders } from "../hooks/useDashboard"

export default function TopPerformingStates({ params }) {
  const query = useDashboardStateOrders({ ...params, limit: 5 })
  const topPerformingStatesData = query.data || []

  return (
    <div className="flex h-full w-full flex-col rounded-[1.1rem] border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
      <h3 className="mb-6 text-xl font-semibold text-ink">Top Performing States</h3>
      {query.isLoading ? (
        <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-[1.1rem] bg-surface-elevated" />)}</div>
      ) : query.error ? (
        <div className="rounded-[1.1rem] border border-red-100 bg-red-50 p-4 text-sm text-red-700">{query.error.message}</div>
      ) : (
        <div className="flex flex-col gap-4 flex-1 justify-center">
          {topPerformingStatesData.map((state) => (
            <div key={state.rank} className="flex items-center justify-between rounded-[1.1rem] border border-transparent p-3 transition-colors hover:border-brand-100 hover:bg-brand-50/60">
              <div className="flex items-center gap-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-800 text-xs font-semibold text-white">{state.rank}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-ink">{state.state}</span>
                  <span className="text-xs text-muted-foreground">{state.orders} Orders</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-ink">{state.revenue}</span>
                <span className="text-xs font-semibold text-brand-700">{state.growth}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
