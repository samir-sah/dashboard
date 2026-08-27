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
    return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] h-full overflow-hidden flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center gap-4 bg-white">
        <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
        <div className={`w-3 h-3 rounded-full shrink-0 ${getStatusColor(product.status)}`} title={`Status: ${product.status}`} />
      </div>

      <div className="px-6 py-5 border-b border-gray-50">
        <div className="flex items-end justify-between gap-4 mb-3">
          <div>
            <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase">Current Stock</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">
              {product.stock} <span className="text-base font-semibold text-gray-500">Units</span>
            </p>
          </div>
          <ReorderStatusBadge inventoryStatus={product.status} />
        </div>
        <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full bg-[#5048e5]" style={{ width: `${stockPercent}%` }} />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>{stockPercent}% capacity used</span>
          <span>Max {product.maxCapacity || 0} units</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-6 border-b border-gray-50">
        {planningStats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Icon size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-sm font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="px-6 flex-1 grid grid-cols-3 gap-x-6 pt-4 pb-5 items-start">
        {fields.map((f) => (
          <div key={f.label} className="py-3 text-center">
            <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{f.label}</span>
            <span className="block text-[14px] font-bold text-gray-900" title={f.value}>{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
