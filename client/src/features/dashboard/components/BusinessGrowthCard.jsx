'use client'

import { TrendingUp } from "lucide-react"
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip as RechartsTooltip } from "recharts"
import { useDashboardBusinessGrowth } from "../hooks/useDashboard"

export default function BusinessGrowthCard({ params }) {
  const query = useDashboardBusinessGrowth(params)
  const businessGrowthData = query.data

  return (
    <div className="flex h-full w-full flex-col justify-between rounded-[1.1rem] border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between mb-6">
         <h3 className="text-xl font-semibold text-ink">Business Growth</h3>
      </div>

      {query.isLoading ? (
        <div className="h-64 animate-pulse rounded-[1.1rem] bg-surface-elevated" />
      ) : query.error ? (
        <div className="rounded-[1.1rem] border border-red-100 bg-red-50 p-4 text-sm text-red-700">{query.error.message}</div>
      ) : (
        <>
          <div className="mb-8 flex flex-col items-center gap-8 md:flex-row">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-brand-700" />
                <span className="text-5xl font-semibold text-ink">{businessGrowthData?.overallGrowth || "+0.0%"}</span>
              </div>
              <span className="ml-11 text-base font-medium text-muted-foreground">Overall Growth</span>
            </div>
            <div className="flex flex-row gap-6 border-t border-border pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground">Revenue</span>
                <span className="text-2xl font-semibold text-brand-800">{businessGrowthData?.revenueGrowth || "+0.0%"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground">Orders</span>
                <span className="text-2xl font-semibold text-brand-700">{businessGrowthData?.orderGrowth || "+0.0%"}</span>
              </div>
            </div>
          </div>
          <div className="mt-auto h-40 w-full min-h-[160px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={businessGrowthData?.trendData || []}>
                <XAxis dataKey="date" hide />
                <RechartsTooltip contentStyle={{ borderRadius: '17.6px', border: '1px solid #e9e8f3', boxShadow: '0 14px 40px rgba(22, 22, 29, 0.07)' }} />
                <Area type="monotone" dataKey="value" stroke="#2f8159" strokeWidth={4} fillOpacity={0.22} fill="#8bc4a4" activeDot={{ r: 6, strokeWidth: 0, fill: '#2f8159' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
