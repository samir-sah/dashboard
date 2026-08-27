'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import { useDashboardGenderOrders } from "../hooks/useDashboard"

export default function GenderOrders({ params }) {
  const query = useDashboardGenderOrders(params)
  const genderOrdersData = query.data || []
  const total = genderOrdersData.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <div className="group flex h-full w-full flex-col rounded-[1.1rem] border border-border bg-card p-8 shadow-[var(--shadow-soft)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold uppercase text-ink">Gender Based Orders</h3>
      </div>

      {query.isLoading ? (
        <div className="h-64 animate-pulse rounded-[1.1rem] bg-surface-elevated" />
      ) : query.error ? (
        <div className="rounded-[1.1rem] border border-red-100 bg-red-50 p-4 text-sm text-red-700">{query.error.message}</div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-6 flex-1">
          <div className="h-48 w-48 relative min-w-0 min-h-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie data={genderOrdersData} innerRadius={65} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                  {genderOrdersData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '17.6px', border: '1px solid #e9e8f3', boxShadow: '0 14px 40px rgba(22, 22, 29, 0.07)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-semibold text-ink">{total.toLocaleString()}</span>
              <span className="mt-0.5 text-xs font-medium text-muted-foreground">Total Orders</span>
            </div>
          </div>
          <div className="flex w-full justify-around mt-2 flex-wrap gap-3">
            {genderOrdersData.map((item) => (
              <div key={item.name} className="flex flex-col gap-1 items-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-sm font-medium text-muted-foreground">{item.name}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-semibold text-ink">{item.value}</span>
                  <span className="text-xs font-medium text-faint">({total ? ((item.value / total) * 100).toFixed(1) : "0.0"}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
