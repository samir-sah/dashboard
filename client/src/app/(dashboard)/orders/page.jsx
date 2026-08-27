'use client'
import { useEffect, useState } from 'react'
import apiFetch from '@/services/api/api.service'
import { ShoppingBag, CheckCircle2, Loader, Truck, PackageCheck, XCircle } from 'lucide-react'
import StatCard from "@/features/orders/components/dashboard/StatCard"
import OrdersTable from "@/features/orders/components/dashboard/OrdersTable"

const defaultStats = [
  { label: 'TOTAL ORDERS', value: '—', icon: ShoppingBag,  iconColor: 'text-brand-700',    iconBg: 'bg-brand-100' },
  { label: 'SHIPPED',      value: '—', icon: Truck,        iconColor: 'text-amber-600',    iconBg: 'bg-amber-100' },
  { label: 'DELIVERED',    value: '—', icon: PackageCheck,  iconColor: 'text-brand-700',  iconBg: 'bg-brand-100' },
  { label: 'CANCELLED',    value: '—', icon: XCircle,      iconColor: 'text-red-600',      iconBg: 'bg-red-100' },
]

export default function OrdersPage() {
  const [stats, setStats] = useState(defaultStats)

  useEffect(() => {
    apiFetch('/api/orders/stats')
      .then(data => {
        setStats([
          { label: 'TOTAL ORDERS', value: data.total?.toLocaleString('en-IN')      ?? '—', icon: ShoppingBag,  iconColor: 'text-brand-700',    iconBg: 'bg-brand-100' },
          { label: 'SHIPPED',      value: data.shipped?.toLocaleString('en-IN')    ?? '—', icon: Truck,        iconColor: 'text-amber-600',    iconBg: 'bg-amber-100' },
          { label: 'DELIVERED',    value: data.delivered?.toLocaleString('en-IN')  ?? '—', icon: PackageCheck,  iconColor: 'text-brand-700',  iconBg: 'bg-brand-100' },
          { label: 'CANCELLED',    value: data.cancelled?.toLocaleString('en-IN')  ?? '—', icon: XCircle,      iconColor: 'text-red-600',      iconBg: 'bg-red-100' },
        ])
      })
      .catch(err => console.error('Stats fetch failed:', err))
  }, [])

  return (
    <div style={{ maxWidth: '1400px' }}>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map(({ label, value, icon, iconColor, iconBg }) => (
          <StatCard key={label} label={label} value={value} icon={icon} iconColor={iconColor} iconBg={iconBg} />
        ))}
      </div>

      <OrdersTable />
    </div>
  )
}
