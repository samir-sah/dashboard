'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import { MoreVertical } from "lucide-react"
import { useDashboardGenderOrders } from "../hooks/useDashboard"

export default function GenderOrders({ params }) {
  const query = useDashboardGenderOrders(params)
  const genderOrdersData = query.data || []
  const total = genderOrdersData.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col h-full w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Gender Based Orders</h3>
      </div>

      {query.isLoading ? (
        <div className="h-64 rounded-lg bg-muted animate-pulse" />
      ) : query.error ? (
        <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">{query.error.message}</div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-6 flex-1">
          <div className="h-48 w-48 relative min-w-0 min-h-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie data={genderOrdersData} innerRadius={65} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                  {genderOrdersData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</span>
              <span className="text-xs font-medium text-gray-500 mt-0.5">Total Orders</span>
            </div>
          </div>
          <div className="flex w-full justify-around mt-2 flex-wrap gap-3">
            {genderOrdersData.map((item) => (
              <div key={item.name} className="flex flex-col gap-1 items-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-sm font-medium text-gray-600">{item.name}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-gray-900">{item.value}</span>
                  <span className="text-xs font-medium text-gray-400">({total ? ((item.value / total) * 100).toFixed(1) : "0.0"}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
