'use client'

import { useState, useCallback, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useOrderById } from '../../hooks/useOrderById'
import { useCustomerById } from '../../hooks/useCustomerById'
import PrintHeader from "@/features/orders/components/print/PrintHeader"
import PrintTabs from "@/features/orders/components/print/PrintTabs"
import { Skeleton } from '@/components/ui/Skeleton'
import { Card, CardContent } from '@/components/ui/Card'
import { AlertTriangle, Printer } from 'lucide-react'

const normalizeOrderStatus = (status) => {
  if (status === 'Dispatched') return 'Shipped'
  return status || 'Confirmed'
}

/**
 * Print Center Page — /orders/[id]/print
 *
 * Two modes:
 *   • Shipping Label — 4×6 inch thermal
 *   • Tax Invoice    — A4 GST-compliant
 *
 * Print isolation strategy:
 *   1. Add body class (print-shipping-label / print-tax-invoice)
 *   2. CSS @media print hides everything except the content
 *   3. Remove body class after print dialog closes
 */
export default function PrintCenterPage() {
  const { id } = useParams()
  const { order, loading, error } = useOrderById(id)
  const [activeTab, setActiveTab] = useState('label')

  // Extract customer info
  const userId = order?.userId && typeof order.userId === 'object' ? order.userId._id : order?.userId
  const { customer } = useCustomerById(userId)

  const customerName = customer?.displayName
    || (customer?.firstName || customer?.lastName
          ? `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim()
          : null)
    || order?.userId?.displayName
    || (order?.userId?.firstName || order?.userId?.lastName
          ? `${order.userId.firstName ?? ''} ${order.userId.lastName ?? ''}`.trim()
          : null)
    || null

  const status = normalizeOrderStatus(order?.statusHistory?.at(-1)?.status)
  const orderId = order?.orderId ?? id

  // Inject fetched customer details so the print templates can extract name, email, phone correctly
  const enhancedOrder = order ? {
    ...order,
    userId: customer ? {
      ...(typeof order.userId === 'object' ? order.userId : {}),
      _id: userId,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      email: customer.email,
    } : order.userId,
    customer: customer ? {
      ...(order.customer || {}),
      name: customerName,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      email: customer.email,
    } : order.customer
  } : order

  /**
   * Print handler — adds body class for print CSS scoping,
   * triggers window.print(), then removes the class.
   */
  const handlePrint = useCallback(() => {
    const className = activeTab === 'label' ? 'print-shipping-label' : 'print-tax-invoice'
    document.body.classList.add(className)

    // Small delay to let the class apply before the print dialog opens
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print()
        document.body.classList.remove(className)
      }, 50)
    })
  }, [activeTab])

  // Clean up body class on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('print-shipping-label', 'print-tax-invoice')
    }
  }, [])

  // ── Loading State ───────────────────────────────────
  if (loading) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-card overflow-hidden shadow-sm">
        <div className="print-hide border-b border-neutral-200 bg-card">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="h-5 w-px bg-neutral-200" />
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-28 h-4 rounded" />
                  <Skeleton className="w-16 h-5 rounded" />
                  <Skeleton className="w-16 h-5 rounded-full" />
                </div>
                <Skeleton className="w-20 h-3 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-24 h-8 rounded-lg" />
              <Skeleton className="w-32 h-8 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="print-hide border-b border-neutral-200 bg-card">
          <div className="px-6 flex gap-4">
            <Skeleton className="w-32 h-10 rounded" />
            <Skeleton className="w-28 h-10 rounded" />
          </div>
        </div>
        <div className="px-6 py-6">
          <div className="flex justify-center py-8">
            <div className="bg-card rounded-xl border border-neutral-200 p-10">
              <div className="flex flex-col items-center gap-3 w-80">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center animate-pulse">
                  <Printer size={20} className="text-neutral-300" />
                </div>
                <Skeleton className="w-40 h-4 rounded" />
                <Skeleton className="w-56 h-3 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Error State ─────────────────────────────────────
  if (error) {
    return (
      <div className="px-6 py-12">
        <Card>
          <CardContent className="py-12 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <h2 className="text-base font-semibold text-neutral-900">Failed to load order</h2>
            <p className="text-sm text-neutral-500 max-w-md">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Empty State ─────────────────────────────────────
  if (!order) {
    return (
      <div className="px-6 py-12">
        <Card>
          <CardContent className="py-12 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center">
              <Printer size={24} className="text-neutral-300" />
            </div>
            <h2 className="text-base font-semibold text-neutral-900">No order data</h2>
            <p className="text-sm text-neutral-500">The requested order could not be found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Main Render ─────────────────────────────────────
  return (
    <div className="rounded-2xl border border-neutral-200 bg-card overflow-hidden shadow-sm">
      <PrintHeader
        orderId={orderId}
        customerName={customerName || 'Customer'}
        status={status}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onPrint={handlePrint}
      />

      <div className="px-6 py-5 print:px-0 print:py-0">
        <PrintTabs
          order={enhancedOrder}
          activeTab={activeTab}
          onPrint={handlePrint}
        />
      </div>
    </div>
  )
}
