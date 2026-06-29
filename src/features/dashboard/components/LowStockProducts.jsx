'use client'

import { Package, MoreVertical } from "lucide-react"
import { useDashboardLowStockProducts } from "../hooks/useDashboard"

export default function LowStockProducts({ params }) {
  const query = useDashboardLowStockProducts({ ...params, limit: 3 })
  const lowStockData = query.data || []

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm flex flex-col h-full w-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-gray-900">Low Stock Products</h3>
      </div>

      {query.isLoading ? (
        <div className="space-y-5">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : query.error ? (
        <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">{query.error.message}</div>
      ) : (
        <div className="flex flex-col gap-6 flex-1 justify-center">
          {lowStockData.length === 0 ? <div className="text-sm text-gray-500">No low stock products.</div> : lowStockData.map((item) => {
            const percentage = item.total ? (item.remaining / item.total) * 100 : 0
            return (
              <div key={item.id} className="flex items-center gap-4 group">
                <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex-shrink-0 transition-colors group-hover:bg-red-100">
                  <Package className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex flex-col flex-1 gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">{item.name}</span>
                    <span className="text-xs font-bold text-red-600">{item.remaining} Remaining</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
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
