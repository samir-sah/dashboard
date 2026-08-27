'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Users, UserCheck, UserPlus, Package } from "lucide-react"

export default function CustomerStats({ stats }) {
  if (!stats) return null;

  const items = [
    { title: "Total Customers", value: stats.totalCustomers != null ? stats.totalCustomers : 'N/A', icon: Users, color: "text-brand-700", bg: "bg-brand-100" },
    { title: "Active Customers", value: stats.activeCustomers != null ? stats.activeCustomers : 'N/A', icon: UserCheck, color: "text-brand-700", bg: "bg-brand-100" },
    { title: "New Customers", value: stats.newCustomers != null ? stats.newCustomers : 'N/A', icon: UserPlus, color: "text-brand-700", bg: "bg-brand-100" },
    { title: "Total Units Sold", value: stats.totalUnitsSold != null ? stats.totalUnitsSold.toLocaleString() : 'N/A', icon: Package, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="bg-card rounded-xl border border-border p-5 flex items-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group min-h-[96px]">
            <div className="flex items-center gap-4 w-full">
              <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-muted-foreground uppercase ">{item.title}</span>
                <span className="text-2xl font-bold text-ink leading-none">{item.value}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )
}
