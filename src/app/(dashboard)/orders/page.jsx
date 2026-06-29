'use client'
import { useEffect, useState } from 'react'
import StatCard from "@/features/orders/components/dashboard/StatCard"
import OrdersTable from "@/features/orders/components/dashboard/OrdersTable"

const defaultStats = [
  { label: 'TOTAL ORDERS', value: '—', color: '#111827' },
  { label: 'CONFIRMED',    value: '—', color: '#64748b' },
  { label: 'PROCESSING',   value: '—', color: '#6366f1' },
  { label: 'SHIPPED',      value: '—', color: '#f59e0b' },
  { label: 'DELIVERED',    value: '—', color: '#16a34a' },
  { label: 'CANCELLED',    value: '—', color: '#e11d48' },
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
          { label: 'TOTAL ORDERS', value: data.total?.toLocaleString('en-IN')      ?? '—', color: '#111827' },
          { label: 'CONFIRMED',    value: data.confirmed?.toLocaleString('en-IN')  ?? '—', color: '#64748b' },
          { label: 'PROCESSING',   value: data.processing?.toLocaleString('en-IN') ?? '—', color: '#6366f1' },
          { label: 'SHIPPED',      value: data.shipped?.toLocaleString('en-IN')    ?? '—', color: '#f59e0b' },
          { label: 'DELIVERED',    value: data.delivered?.toLocaleString('en-IN')  ?? '—', color: '#16a34a' },
          { label: 'CANCELLED',    value: data.cancelled?.toLocaleString('en-IN')  ?? '—', color: '#e11d48' },
        ])
      })
      .catch(err => console.error('Stats fetch failed:', err))
  }, [])

  return (
    <div style={{ maxWidth: '1400px' }}>

      {/* Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '16px',
        marginBottom: '20px',
      }}>
        {stats.map(({ label, value, color }) => (
          <StatCard key={label} label={label} value={value} valueColor={color} />
        ))}
      </div>

      <OrdersTable />
    </div>
  )
}
