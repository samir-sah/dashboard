'use client'

import { ShoppingBag, Users, Package, Truck, AlertTriangle, Wallet, TrendingUp, TrendingDown, IndianRupee, PackageCheck } from "lucide-react"
import { LineChart, Line, ResponsiveContainer } from "recharts"

const iconMap = {
  "total-revenue": Wallet,
  "total-orders": ShoppingBag,
  "active-customers": Users,
  "pending-deliveries": Truck,
  "low-stock-products": AlertTriangle,
  "avg-order-value": Wallet,
  "conversion-rate": TrendingUp,
  "avg-session-duration": Users,
  "cart-abandonment": ShoppingBag,
  "pending-deliveries-insight": Truck,
  "todays-revenue": IndianRupee,
  "todays-orders": Package,
  "delivered-orders-insight": PackageCheck,
}

const colorMap = {
  "total-revenue": { bg: "bg-green-100 text-green-600", stroke: "#16a34a" },
  "total-orders": { bg: "bg-blue-100 text-blue-600", stroke: "#2563eb" },
  "active-customers": { bg: "bg-purple-100 text-purple-600", stroke: "#9333ea" },
  "pending-deliveries": { bg: "bg-orange-100 text-orange-600", stroke: "#ea580c" },
  "low-stock-products": { bg: "bg-red-100 text-red-600", stroke: "#dc2626" },
  "avg-order-value": { bg: "bg-teal-100 text-teal-600", stroke: "#0d9488" },
  "conversion-rate": { bg: "bg-indigo-100 text-indigo-600", stroke: "#4f46e5" },
  "avg-session-duration": { bg: "bg-pink-100 text-pink-600", stroke: "#db2777" },
  "cart-abandonment": { bg: "bg-rose-100 text-rose-600", stroke: "#e11d48" },
  "pending-deliveries-insight": { bg: "bg-orange-100 text-orange-600", stroke: "#ea580c" },
  "todays-revenue": { bg: "bg-green-100 text-green-600", stroke: "#16a34a" },
  "todays-orders": { bg: "bg-blue-100 text-blue-600", stroke: "#2563eb" },
  "delivered-orders-insight": { bg: "bg-teal-100 text-teal-600", stroke: "#0d9488" },
}

export default function DashboardKPICard({ kpi }) {
  const Icon = iconMap[kpi.id] || ShoppingBag;
  const colors = colorMap[kpi.id] || { bg: "bg-gray-100 text-gray-600", stroke: "#4b5563" };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group min-h-[96px]">
      <div className="flex items-center gap-4 w-full">
        <div className={`p-3 rounded-xl ${colors.bg}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{kpi.label}</span>
          <span className="text-2xl font-bold text-gray-900 leading-none">{kpi.value}</span>
        </div>
      </div>
    </div>
  )
}
