'use client'
import Link from 'next/link'
import { Search, Filter, Eye } from 'lucide-react'
import { usePayments } from '../hooks/usePayments'
import StatusBadge from '@/components/shared/StatusBadge'
import PaymentsPagination from './PaymentsPagination'
import { getSimplifiedStatus } from '../utils'

const columns = ['PAYMENT ID', 'CUSTOMER', 'ORDER', 'AMOUNT', 'METHOD', 'STATUS', 'DATE', 'ACTIONS']

export default function PaymentsTable() {
  const {
    payments, loading, error, search, statusFilter,
    currentPage, totalPages, totalItems, PAGE_SIZE,
    handleSearchChange, handleStatusChange, setCurrentPage
  } = usePayments()

  const formatCurrency = (val) => `Rs. ${Number(val || 0).toLocaleString('en-IN')}`
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : '-'

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between bg-surface-2/70">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" size={18} />
          <input
            type="text"
            placeholder="Search payment or order ID..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-faint" size={18} />
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="pl-3 pr-8 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-card"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-sm border-b border-red-100 flex justify-between items-center">
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left border-collapse">
          <thead>
            <tr className="bg-surface-2/80 border-b border-border text-xs font-semibold text-muted-foreground ">
              {columns.map(col => (
                <th key={col} className="px-6 py-4">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map(col => (
                    <td key={col} className="px-6 py-4">
                      <div className="h-4 bg-surface-elevated rounded w-full max-w-[120px]"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-muted-foreground text-sm">
                  No payments found matching your criteria.
                </td>
              </tr>
            ) : (
              payments.map(payment => {
                const detailId = payment.id || payment.paymentId || payment.orderId
                return (
                  <tr key={detailId} className="hover:bg-surface-2/70 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-ink">{payment.paymentId || '-'}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{payment.customerName}</td>
                    <td className="px-6 py-4 text-sm text-brand-700 hover:text-brand-900">
                      <Link href={`/orders/${payment.orderId}`}>{payment.orderId}</Link>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-ink">{formatCurrency(payment.amount)}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{payment.paymentMethod}</td>
                    <td className="px-6 py-4"><StatusBadge status={getSimplifiedStatus(payment.status)} /></td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(payment.paidAt || payment.createdAt)}</td>
                    <td className="px-6 py-4">
                      <Link href={`/payments/${detailId}`} className="p-2 text-faint hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors inline-flex">
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <PaymentsPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        PAGE_SIZE={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
