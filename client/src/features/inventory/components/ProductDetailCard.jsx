'use client'

import React from 'react'
import { Activity, RotateCcw } from 'lucide-react'
import ReorderStatusBadge from './ReorderStatusBadge'

export default function ProductDetailCard({ product }) {
  if (!product) return null

  const formatDate = (date) => date
    ? new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'N/A'

  const stockPercent = product.maxCapacity
    ? Math.min(100, Math.round((product.stock / product.maxCapacity) * 100))
    : 0

  const getStatusColor = (status) => {
    if (status === 'Out Of Stock' || status === 'Immediate Reorder Required' || status === 'Critical') return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
    if (status === 'Restock Soon' || status === 'Low Stock') return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
    return 'bg-brand-500 shadow-[0_0_8px_rgba(47,129,89,0.42)]'
  }

  const planningStats = [
    { label: 'Reorder Point', value: `${product.reorderPoint} Units`, icon: RotateCcw },
    { label: 'Low Stock Threshold', value: `${product.lowStockThreshold} Units`, icon: Activity },
  ]

  const fields = [
    { label: 'SKU', value: product.sku },
    { label: 'Unit Price', value: `Rs. ${product.unitPrice?.toLocaleString('en-IN')}` },
    { label: 'Total Sold', value: `${product.totalSold || 0} Units` },
  ]

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[1.1rem] border border-border bg-card shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between gap-4 border-b border-border bg-card px-6 py-5">
        <h2 className="text-2xl font-semibold text-ink">{product.name}</h2>
        <div className={`w-3 h-3 rounded-full shrink-0 ${getStatusColor(product.status)}`} title={`Status: ${product.status}`} />
      </div>

      <div className="border-b border-border px-6 py-5">
        <div className="flex items-end justify-between gap-4 mb-3">
          <div>
            <p className="text-xs font-semibold uppercase text-faint">Current Stock</p>
            <p className="mt-2 text-4xl font-semibold text-ink">
              {product.stock} <span className="text-base font-semibold text-muted-foreground">Units</span>
            </p>
          </div>
          <ReorderStatusBadge inventoryStatus={product.status} />
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-brand-700" style={{ width: `${stockPercent}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{stockPercent}% capacity used</span>
          <span>Max {product.maxCapacity || 0} units</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 border-b border-border p-6 sm:grid-cols-2">
        {planningStats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-[1.1rem] border border-border bg-surface-2/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Icon size={16} />
              <span className="text-xs font-semibold uppercase">{label}</span>
            </div>
            <p className="text-sm font-semibold text-ink">{value}</p>
          </div>
        ))}
      </div>

      <div className="px-6 flex-1 grid grid-cols-3 gap-x-6 pt-4 pb-5 items-start">
        {fields.map((f) => (
          <div key={f.label} className="py-3 text-center">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase text-faint">{f.label}</span>
            <span className="block text-[14px] font-semibold text-ink" title={f.value}>{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
