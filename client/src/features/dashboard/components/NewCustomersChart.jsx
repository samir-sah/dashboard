'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { useDashboardCustomerGrowth } from "../hooks/useDashboard"

export default function NewCustomersChart({ params }) {
  const query = useDashboardCustomerGrowth(params)
  const customerGrowthData = query.data?.data || []

  return (
    <div className="flex h-full w-full flex-col rounded-[1.1rem] border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-ink">New Customers Acquired</h3>
      </div>
      
      {query.isLoading ? (
        <div className="h-64 animate-pulse rounded-[1.1rem] bg-surface-elevated" />
      ) : query.error ? (
        <div className="rounded-[1.1rem] border border-red-100 bg-red-50 p-4 text-sm text-red-700">{query.error.message}</div>
      ) : (
        <div className="h-64 w-full min-h-[256px] min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={customerGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9e8f3" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9a9aae', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9a9aae', fontSize: 12 }} />
              <RechartsTooltip cursor={{ fill: '#ebf6ef' }} contentStyle={{ borderRadius: '17.6px', border: '1px solid #e9e8f3', boxShadow: '0 14px 40px rgba(22, 22, 29, 0.07)', fontWeight: '600' }} />
              <Bar dataKey="newCustomers" name="New Customers" fill="#2f8159" barSize={32} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
