'use client'

import { TrendingUp, MoreVertical } from "lucide-react"
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip as RechartsTooltip } from "recharts"
import { useDashboardBusinessGrowth } from "../hooks/useDashboard"

export default function BusinessGrowthCard({ params }) {
  const query = useDashboardBusinessGrowth(params)
  const businessGrowthData = query.data

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm h-full flex flex-col justify-between w-full">
      <div className="flex items-center justify-between mb-6">
         <h3 className="text-xl font-bold text-gray-900">Business Growth</h3>
         <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-5 h-5" /></button>
      </div>

      {query.isLoading ? (
        <div className="h-64 rounded-lg bg-muted animate-pulse" />
      ) : query.error ? (
        <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">{query.error.message}</div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <span className="text-5xl font-extrabold text-gray-900">{businessGrowthData?.overallGrowth || "+0.0%"}</span>
              </div>
              <span className="text-base text-gray-500 font-medium ml-11">Overall Growth</span>
            </div>
            <div className="flex flex-row gap-6 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-500">Revenue</span>
                <span className="text-2xl font-bold text-green-600">{businessGrowthData?.revenueGrowth || "+0.0%"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-500">Orders</span>
                <span className="text-2xl font-bold text-blue-600">{businessGrowthData?.orderGrowth || "+0.0%"}</span>
              </div>
            </div>
          </div>
          <div className="h-40 w-full mt-auto min-h-[160px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={businessGrowthData?.trendData || []}>
                <XAxis dataKey="date" hide />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={4} fillOpacity={0.2} fill="#22c55e" activeDot={{ r: 6, strokeWidth: 0, fill: '#22c55e' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
