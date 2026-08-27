'use client'

import { useDashboardStateOrders } from "../hooks/useDashboard"

export default function TopPerformingStates({ params }) {
  const query = useDashboardStateOrders({ ...params, limit: 5 })
  const topPerformingStatesData = query.data || []

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm h-full w-full flex flex-col">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Top Performing States</h3>
      {query.isLoading ? (
        <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />)}</div>
      ) : query.error ? (
        <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">{query.error.message}</div>
      ) : (
        <div className="flex flex-col gap-4 flex-1 justify-center">
          {topPerformingStatesData.map((state) => (
            <div key={state.rank} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
              <div className="flex items-center gap-4">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold">{state.rank}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">{state.state}</span>
                  <span className="text-xs text-gray-500">{state.orders} Orders</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-gray-900">{state.revenue}</span>
                <span className="text-xs font-semibold text-green-600">{state.growth}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
