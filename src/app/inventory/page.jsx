'use client'

import React from 'react';
import ProductSelector from "@/features/inventory/components/ProductSelector"
import InventoryKPICards from "@/features/inventory/components/InventoryKPICards"
import ProductDetailCard from "@/features/inventory/components/ProductDetailCard"
import SalesTrendChart from "@/features/inventory/components/SalesTrendChart"
import { useInventory } from "./hooks/useInventory"
import { Skeleton } from "@/components/ui/Skeleton"

export default function InventoryPage() {
  const { 
    products, 
    selectedProductId, 
    setSelectedProductId,
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

      {/* Product Selector */}
      {!loading && products.length > 0 && (
        <ProductSelector 
          products={products} 
          selectedProductId={selectedProductId} 
          onSelectProduct={setSelectedProductId} 
        />
      )}

      {/* Loading state */}
      {loading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <Skeleton className="w-24 h-3 mb-3" />
                <Skeleton className="w-20 h-8" />
              </div>
            ))}
          </div>
          <div className="flex gap-6 flex-col lg:flex-row">
            <div className="w-full lg:w-[380px] flex flex-col gap-6">
              <Skeleton className="w-full h-96 rounded-2xl" />
            </div>
            <div className="flex-1 space-y-6">
              <Skeleton className="w-full h-96 rounded-2xl" />
            </div>
          </div>
        </>
      ) : dashboardData ? (
        <>
          <InventoryKPICards kpis={dashboardData.kpis} />
          
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Details */}
            <div className="w-full lg:w-[380px] flex flex-col gap-6 items-stretch">
              <ProductDetailCard product={dashboardData.product} />
            </div>

            {/* Right Column - Analytics */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">
              <SalesTrendChart 
                data={dashboardData.salesTrend} 
                daysRemaining={dashboardData.forecast.daysRemaining} 
                period={period}
                setPeriod={setPeriod}
              />
            </div>
          </div>
        </>
      ) : (
        !loading && !error && (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500">No products found in inventory.</p>
          </div>
        )
      )}
    </div>
  )
}
