'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  Legend,
} from "recharts"
import {
  useDashboardOrderStatus,
  useDashboardOrdersVsUnits,
  useDashboardRevenueForecast,
} from "../hooks/useDashboard"
import GenderOrders from "./GenderOrders"

const ChartHeader = ({ title }) => (
  <div className="flex items-center justify-between mb-2">
    <h3 className="text-sm font-semibold uppercase text-ink">{title}</h3>
  </div>
)

const ChartState = ({ query, children }) => {
  if (query.isLoading) return <div className="mt-4 h-64 w-full animate-pulse rounded-[1.1rem] bg-surface-elevated" />
  if (query.error) return <div className="mt-4 h-64 w-full rounded-[1.1rem] border border-red-100 bg-red-50 p-4 text-sm text-red-700">{query.error.message}</div>
  return children
}

const ForecastTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-[1.1rem] border border-border bg-popover p-4 text-popover-foreground shadow-[var(--shadow-soft)]">
      <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      {payload.filter((entry) => entry.value != null).map((entry, index) => (
        <div key={index} className="flex items-center gap-3 mt-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-sm font-medium text-muted-foreground">{entry.name}:</span>
          <span className="text-sm font-semibold text-ink">₹{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

const UnitsLineTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-[1.1rem] border border-border bg-popover p-4 shadow-[var(--shadow-soft)]">
      <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-3 mt-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-sm font-medium text-muted-foreground">{entry.name}:</span>
          <span className="text-sm font-semibold text-ink">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

const OrderStatusTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="flex items-center gap-3 rounded-[1.1rem] border border-border bg-popover p-3 shadow-[var(--shadow-soft)]">
      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: data.fill }} />
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-ink">{data.name}</span>
        <span className="text-xs text-muted-foreground">{data.count} Orders ({data.value}%)</span>
      </div>
    </div>
  )
}

export default function AnalyticsCharts({ params }) {
  const orderStatus = useDashboardOrderStatus(params)
  const ordersVsUnits = useDashboardOrdersVsUnits(params)
  const revenueForecast = useDashboardRevenueForecast({ ...params, forecastMonths: 3 })

  const orderStatusData = orderStatus.data?.data || []
  const ordersVsUnitsData = ordersVsUnits.data?.data || []
  const expectedGrowthData = revenueForecast.data?.data || []

  return (
    <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="group flex flex-col rounded-[1.1rem] border border-border bg-card p-8 shadow-[var(--shadow-soft)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
        <ChartHeader title="Order Status" metric={orderStatus.data?.metric || "Current Distribution"} />
        <ChartState query={orderStatus}>
          <div className="h-64 w-full min-h-[256px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart layout="vertical" data={orderStatusData} margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e9e8f3" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#5d5d6e', fontSize: 13, fontWeight: 600 }} width={80} />
                <RechartsTooltip cursor={{ fill: '#ebf6ef' }} content={<OrderStatusTooltip />} />
                <Bar dataKey="value" barSize={18} radius={[0, 8, 8, 0]}>
                  {orderStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartState>
      </div>

      <div className="group flex flex-col rounded-[1.1rem] border border-border bg-card p-8 shadow-[var(--shadow-soft)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
        <ChartHeader title="Orders vs Units Sold" metric={ordersVsUnits.data?.metric || "0 Units / 0 Orders"} growth={ordersVsUnits.data?.growth || "Avg 0.0 Units/Order"} />
        <ChartState query={ordersVsUnits}>
          <div className="h-64 w-full min-h-[256px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart data={ordersVsUnitsData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9e8f3" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9a9aae', fontSize: 12 }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#9a9aae', fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#9a9aae', fontSize: 12 }} />
                <RechartsTooltip content={<UnitsLineTooltip />} />
                <Line yAxisId="left" name="Units Sold" type="monotone" dataKey="units" stroke="#2f8159" strokeWidth={3} dot={{ r: 4, fill: '#2f8159', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" name="Orders" type="monotone" dataKey="orders" stroke="#8bc4a4" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: '#8bc4a4', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 500, color: '#5d5d6e' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartState>
      </div>

      <GenderOrders params={params} />

      <div className="group relative flex flex-col overflow-hidden rounded-[1.1rem] border border-border bg-card p-8 shadow-[var(--shadow-soft)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
        <ChartHeader title="Monthly Revenue & Forecast" metric={revenueForecast.data?.metric || "₹0 Current"} growth={revenueForecast.data?.growth || "Projected ₹0"} />
        <ChartState query={revenueForecast}>
          <div className="h-64 w-full z-10 min-h-[256px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart data={expectedGrowthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9e8f3" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9a9aae', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9a9aae', fontSize: 12 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <RechartsTooltip content={<ForecastTooltip />} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 500, color: '#5d5d6e' }} />
                <Line name="Actual Revenue" type="monotone" dataKey="actualRevenue" stroke="#1d5038" strokeWidth={3} dot={{ r: 4, fill: '#1d5038', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line name="Forecast Revenue" type="monotone" dataKey="forecastRevenue" stroke="#8bc4a4" strokeWidth={3} strokeDasharray="6 6" dot={{ r: 4, fill: '#8bc4a4', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartState>
      </div>
    </div>
  )
}
