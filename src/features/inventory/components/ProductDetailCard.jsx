'use client'

import React from 'react';
import ReorderStatusBadge from './ReorderStatusBadge';

export default function ProductDetailCard({ product }) {
  if (!product) return null;

  const fields = [
    { label: 'Product Name', value: product.name },
    { label: 'SKU', value: product.sku },
    { label: 'Category', value: product.category },
    { label: 'Current Stock', value: `${product.stock} Units` },
    { label: 'Reorder Level', value: `${product.reorderPoint} Units` },
    { label: 'Unit Price', value: `₹${product.unitPrice?.toLocaleString('en-IN')}` },
    { 
      label: 'Last Restock Date', 
      value: product.lastRestockedAt ? new Date(product.lastRestockedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A' 
    }
  ];

  const getStatusColor = (status) => {
    if (status === 'Out Of Stock' || status === 'Immediate Reorder Required' || status === 'Critical') return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
    if (status === 'Restock Soon' || status === 'Low Stock') return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
    return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] h-full overflow-hidden flex flex-col">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
        <h2 className="text-lg font-bold text-gray-900">Device Details</h2>
        <div className={`w-3 h-3 rounded-full ${getStatusColor(product.status)}`} title={`Status: ${product.status}`}></div>
      </div>

      {/* Details List */}
      <div className="px-6 flex-1 flex flex-col pt-2">
        {fields.map((f, i) => (
          <div key={i} className="flex justify-between items-center py-4 border-b border-gray-50 last:border-0">
            <span className="text-[13px] text-gray-500 font-medium">{f.label}</span>
            <span className="text-[13px] font-semibold text-gray-900 text-right max-w-[200px] truncate" title={f.value}>{f.value}</span>
          </div>
        ))}
        <div className="flex justify-between items-center py-4 border-t border-gray-50 mt-auto">
            <span className="text-[13px] text-gray-500 font-medium">Inventory Status</span>
            <ReorderStatusBadge inventoryStatus={product.status} />
        </div>
      </div>

    </div>
  );
}
