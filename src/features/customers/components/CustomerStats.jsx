'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Users, UserCheck, UserPlus, Package } from "lucide-react"

export default function CustomerStats({ stats }) {
  if (!stats) return null;

  const items = [
    { title: "Total Customers", value: stats.totalCustomers != null ? stats.totalCustomers : 'N/A', icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Active Customers", value: stats.activeCustomers != null ? stats.activeCustomers : 'N/A', icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-100" },
    { title: "New Customers", value: stats.newCustomers != null ? stats.newCustomers : 'N/A', icon: UserPlus, color: "text-purple-600", bg: "bg-purple-100" },
    { title: "Total Units Sold", value: stats.totalUnitsSold != null ? stats.totalUnitsSold.toLocaleString() : 'N/A', icon: Package, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="kpi-card bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s ease, transform 0.2s ease' }}>
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase">
                {item.title}
              </p>
              <p className="text-3xl font-bold leading-none text-gray-900">
                {item.value}
              </p>
            </div>
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${item.bg}`}>
              <Icon size={24} className={item.color} />
            </div>
          </div>
        );
      })}
    </div>
  )
}
