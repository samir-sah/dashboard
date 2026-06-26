'use client'

import { Users, UserCheck, Repeat, MoreVertical } from "lucide-react"
import { useDashboardCustomerStats } from "../hooks/useDashboard"

export default function CustomerStats({ params }) {
  const query = useDashboardCustomerStats(params)
  const customerStatsData = query.data

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm h-full flex flex-col w-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-gray-900">Customer Stats</h3>
        <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-5 h-5" /></button>
      </div>

      {query.isLoading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : query.error ? (
        <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">{query.error.message}</div>
      ) : (
        <div className="flex flex-col gap-6 flex-1 justify-center">
          {[
            { label: "New Customers", value: customerStatsData?.newCustomers?.value ?? 0, trend: customerStatsData?.newCustomers?.trend, icon: Users, color: "text-blue-600" },
            { label: "Returning Customers", value: customerStatsData?.returningCustomers?.value ?? 0, trend: customerStatsData?.returningCustomers?.trend, icon: UserCheck, color: "text-purple-600" },
            { label: "Repeat Purchase Rate", value: customerStatsData?.repeatPurchaseRate?.value ?? "0.0%", trend: customerStatsData?.repeatPurchaseRate?.trend, icon: Repeat, color: "text-green-600" },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className={`p-3 bg-white ${item.color} rounded-lg shadow-sm border border-gray-100`}><Icon className="w-5 h-5" /></div>
                  <span className="text-base font-bold text-gray-700">{item.label}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-2xl font-black text-gray-900 leading-none">{item.value}</span>
                  {item.trend ? <span className="text-xs font-bold text-green-600">{item.trend}</span> : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
