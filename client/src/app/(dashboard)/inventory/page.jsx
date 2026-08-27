'use client'

import React from 'react';
import InventoryKPICards from "@/features/inventory/components/InventoryKPICards"
import ProductDetailCard from "@/features/inventory/components/ProductDetailCard"
import SalesTrendChart from "@/features/inventory/components/SalesTrendChart"
import { useInventory } from "./hooks/useInventory"
import { Skeleton } from "@/components/ui/Skeleton"

export default function InventoryPage() {
  const { 
    period,
    setPeriod,
    dashboardData, 
    loading, 
    error 
  } = useInventory()

  return (
    <div style={{ maxWidth: '1400px' }} className="pb-10">

      {/* Error banner */}
      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          ⚠ {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <Skeleton className="w-24 h-3 mb-3" />
                <Skeleton className="w-20 h-8" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-6">
            <Skeleton className="w-full h-[460px] rounded-2xl" />
            <Skeleton className="w-full h-[460px] rounded-2xl" />
          </div>
        </>
      ) : dashboardData ? (
        <>
          <InventoryKPICards kpis={dashboardData.kpis} />
          
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-6 items-stretch">
            <ProductDetailCard product={dashboardData.product} />
            <SalesTrendChart 
              data={dashboardData.salesTrend} 
              daysRemaining={dashboardData.forecast.daysRemaining} 
              period={period}
              setPeriod={setPeriod}
            />
          </div>
        </>
      ) : (
        !loading && !error && (
          <div className="text-center py-20 bg-surface-2 rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground">No active product found in inventory.</p>
          </div>
        )
      )}
    </div>
  )
}
