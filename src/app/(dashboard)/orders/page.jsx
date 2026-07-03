'use client'
import { useEffect, useState } from 'react'
import { ShoppingBag, CheckCircle2, Loader, Truck, PackageCheck, XCircle } from 'lucide-react'
import StatCard from "@/features/orders/components/dashboard/StatCard"
import OrdersTable from "@/features/orders/components/dashboard/OrdersTable"

const defaultStats = [
  { label: 'TOTAL ORDERS', value: '—', icon: ShoppingBag,  iconColor: 'text-blue-600',    iconBg: 'bg-blue-100' },
  { label: 'CONFIRMED',    value: '—', icon: CheckCircle2, iconColor: 'text-slate-600',    iconBg: 'bg-slate-100' },
  { label: 'PROCESSING',   value: '—', icon: Loader,       iconColor: 'text-indigo-600',   iconBg: 'bg-indigo-100' },
  { label: 'SHIPPED',      value: '—', icon: Truck,        iconColor: 'text-amber-600',    iconBg: 'bg-amber-100' },
  { label: 'DELIVERED',    value: '—', icon: PackageCheck,  iconColor: 'text-emerald-600',  iconBg: 'bg-emerald-100' },
  { label: 'CANCELLED',    value: '—', icon: XCircle,      iconColor: 'text-red-600',      iconBg: 'bg-red-100' },
]

export default function OrdersPage() {
  const [stats, setStats] = useState(defaultStats)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/stats`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(r => r.json())
      .then(data => {
        setStats([
          { label: 'TOTAL ORDERS', value: data.total?.toLocaleString('en-IN')      ?? '—', icon: ShoppingBag,  iconColor: 'text-blue-600',    iconBg: 'bg-blue-100' },
          { label: 'CONFIRMED',    value: data.confirmed?.toLocaleString('en-IN')  ?? '—', icon: CheckCircle2, iconColor: 'text-slate-600',    iconBg: 'bg-slate-100' },
          { label: 'PROCESSING',   value: data.processing?.toLocaleString('en-IN') ?? '—', icon: Loader,       iconColor: 'text-indigo-600',   iconBg: 'bg-indigo-100' },
          { label: 'SHIPPED',      value: data.shipped?.toLocaleString('en-IN')    ?? '—', icon: Truck,        iconColor: 'text-amber-600',    iconBg: 'bg-amber-100' },
          { label: 'DELIVERED',    value: data.delivered?.toLocaleString('en-IN')  ?? '—', icon: PackageCheck,  iconColor: 'text-emerald-600',  iconBg: 'bg-emerald-100' },
          { label: 'CANCELLED',    value: data.cancelled?.toLocaleString('en-IN')  ?? '—', icon: XCircle,      iconColor: 'text-red-600',      iconBg: 'bg-red-100' },
        ])
      })
      .catch(err => console.error('Stats fetch failed:', err))
  }, [])

  return (
    <div style={{ maxWidth: '1400px' }}>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-5">
        {stats.map(({ label, value, icon, iconColor, iconBg }) => (
          <StatCard key={label} label={label} value={value} icon={icon} iconColor={iconColor} iconBg={iconBg} />
        ))}
      </div>

      <OrdersTable />
    </div>
  )
}
