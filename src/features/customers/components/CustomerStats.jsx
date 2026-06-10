'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Users, UserCheck, UserPlus, IndianRupee } from "lucide-react"

export default function CustomerStats({ stats }) {
  if (!stats) return null;

  const items = [
    { title: "Total Customers", value: stats.totalCustomers, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Active Customers", value: stats.activeCustomers, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-100" },
    { title: "New Customers", value: stats.newCustomers, icon: UserPlus, color: "text-purple-600", bg: "bg-purple-100" },
    { title: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="border-gray-200 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${item.bg}`}>
                <Icon size={24} className={item.color} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{item.title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{item.value}</h3>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  )
}
