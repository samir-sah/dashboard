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
import { MoreVertical, TrendingUp, TrendingDown } from "lucide-react"
import {
  useDashboardOrderStatus,
  useDashboardOrdersVsUnits,
  useDashboardRevenueForecast,
} from "../hooks/useDashboard"
import GenderOrders from "./GenderOrders"

const ChartHeader = ({ title }) => (
  <div className="flex items-center justify-between mb-2">
    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{title}</h3>
  </div>
)

const ChartState = ({ query, children }) => {
  if (query.isLoading) return <div className="h-64 w-full mt-4 rounded-lg bg-muted animate-pulse" />
  if (query.error) return <div className="h-64 w-full mt-4 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">{query.error.message}</div>
  return children
}

const ForecastTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 border border-gray-700 p-4 rounded-xl shadow-xl">
      <p className="text-gray-300 text-xs font-bold mb-2 uppercase">{label}</p>
      {payload.filter((entry) => entry.value != null).map((entry, index) => (
        <div key={index} className="flex items-center gap-3 mt-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-400 text-sm font-medium">{entry.name}:</span>
          <span className="text-white text-sm font-bold">₹{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

const UnitsLineTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-lg">
      <p className="text-gray-500 text-xs font-bold mb-2 uppercase">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-3 mt-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-500 text-sm font-medium">{entry.name}:</span>
          <span className="text-gray-900 text-sm font-bold">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

const OrderStatusTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="bg-white border border-gray-100 p-3 rounded-lg shadow-md flex items-center gap-3">
      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: data.fill }} />
      <div className="flex flex-col">
        <span className="text-sm font-bold text-gray-900">{data.name}</span>
        <span className="text-xs text-gray-500">{data.count} Orders ({data.value}%)</span>
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow group">
        <ChartHeader title="Order Status" metric={orderStatus.data?.metric || "Current Distribution"} />
        <ChartState query={orderStatus}>
          <div className="h-64 w-full min-h-[256px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart layout="vertical" data={orderStatusData} margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 600 }} width={80} />
                <RechartsTooltip cursor={{ fill: '#f9fafb' }} content={<OrderStatusTooltip />} />
                <Bar dataKey="value" barSize={18} radius={[0, 8, 8, 0]}>
                  {orderStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartState>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow group">
        <ChartHeader title="Orders vs Units Sold" metric={ordersVsUnits.data?.metric || "0 Units / 0 Orders"} growth={ordersVsUnits.data?.growth || "Avg 0.0 Units/Order"} />
        <ChartState query={ordersVsUnits}>
          <div className="h-64 w-full min-h-[256px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart data={ordersVsUnitsData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <RechartsTooltip content={<UnitsLineTooltip />} />
                <Line yAxisId="left" name="Units Sold" type="monotone" dataKey="units" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" name="Orders" type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartState>
      </div>

      <GenderOrders params={params} />

      <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <ChartHeader title="Monthly Revenue & Forecast" metric={revenueForecast.data?.metric || "₹0 Current"} growth={revenueForecast.data?.growth || "Projected ₹0"} />
        <ChartState query={revenueForecast}>
          <div className="h-64 w-full z-10 min-h-[256px] min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart data={expectedGrowthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <RechartsTooltip content={<ForecastTooltip />} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }} />
                <Line name="Actual Revenue" type="monotone" dataKey="actualRevenue" stroke="#0f172a" strokeWidth={3} dot={{ r: 4, fill: '#0f172a', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line name="Forecast Revenue" type="monotone" dataKey="forecastRevenue" stroke="#3b82f6" strokeWidth={3} strokeDasharray="6 6" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartState>
      </div>
    </div>
  )
}
