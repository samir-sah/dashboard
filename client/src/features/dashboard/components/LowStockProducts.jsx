'use client'

import { Package } from "lucide-react"
import { useDashboardLowStockProducts } from "../hooks/useDashboard"

export default function LowStockProducts({ params }) {
  const query = useDashboardLowStockProducts({ ...params, limit: 3 })
  const lowStockData = query.data || []

  return (
    <div className="flex h-full w-full flex-col rounded-[1.1rem] border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-semibold text-ink">Low Stock Products</h3>
      </div>

      {query.isLoading ? (
        <div className="space-y-5">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-[1.1rem] bg-surface-elevated" />)}</div>
      ) : query.error ? (
        <div className="rounded-[1.1rem] border border-red-100 bg-red-50 p-4 text-sm text-red-700">{query.error.message}</div>
      ) : (
        <div className="flex flex-col gap-6 flex-1 justify-center">
          {lowStockData.length === 0 ? <div className="text-sm text-muted-foreground">No low stock products.</div> : lowStockData.map((item) => {
            const percentage = item.total ? (item.remaining / item.total) * 100 : 0
            return (
              <div key={item.id} className="flex items-center gap-4 group">
                <div className="flex-shrink-0 rounded-full border border-red-100 bg-red-50 p-3 transition-colors group-hover:bg-red-100">
                  <Package className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex flex-col flex-1 gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink">{item.name}</span>
                    <span className="text-xs font-bold text-red-600">{item.remaining} Remaining</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full bg-red-600 rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
