'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CreditCard, User, ShoppingBag, Receipt, AlertCircle, Clock, ExternalLink } from 'lucide-react'
import { paymentService } from '@/features/payments/services'
import StatusBadge from '@/components/shared/StatusBadge'
import RefundHistory from '@/features/payments/components/RefundHistory'
import { getSimplifiedStatus } from '@/features/payments/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Separator } from '@/components/ui/separator'

export default function PaymentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPaymentDetail = async () => {
      try {
        const res = await paymentService.getPaymentById(params.paymentId)
        if (res.success) {
          setPayment(res.data)
        } else {
          setError(res.message || 'Failed to fetch payment details')
        }
      } catch (err) {
        setError(err.message || 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (params.paymentId) {
      fetchPaymentDetail()
    }
  }, [params.paymentId])

  if (loading) {
    return (
      <div className="max-w-[1400px] w-full pb-10 animate-pulse">
        <div className="h-8 bg-surface-elevated rounded w-48 mb-8"></div>
        <div className="h-24 bg-surface-elevated rounded-xl mb-5"></div>
        <div className="grid grid-cols-5 gap-4 mb-5">{[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-surface-elevated rounded-xl" />)}</div>
        <div className="h-40 bg-surface-elevated rounded-xl"></div>
      </div>
    )
  }

  if (error || !payment) {
    return (
      <div className="max-w-[1400px] w-full pb-10">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-muted-foreground hover:text-ink mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Payments
        </button>
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 flex items-center gap-3">
          <AlertCircle size={20} />
          <p>{error || 'Payment not found'}</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (val) => `Rs. ${Number(val || 0).toLocaleString('en-IN')}`
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : '-'

  return (
    <div className="max-w-[1400px] w-full pb-10">
      {/* Back button */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-brand-700 hover:text-brand-800 mb-5 transition-colors text-sm font-medium">
        <ArrowLeft size={16} /> Back to Payments
      </button>

      {/* Header */}
      <Card className="mb-5">
        <CardContent className="py-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArrowLeft size={18} className="text-muted-foreground cursor-pointer hover:text-ink" onClick={() => router.back()} />
            <h1 className="text-xl font-bold text-ink">{payment.paymentId || payment.orderId}</h1>
            <StatusBadge status={getSimplifiedStatus(payment.status)} />
            <span className="text-muted-foreground/40">·</span>
            <span className="text-sm text-muted-foreground">{formatDate(payment.createdAt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* KPI Strip — all key info at a glance */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-5">
        {[
          { label: 'Amount', value: formatCurrency(payment.amount), icon: CreditCard, iconColor: 'text-brand-700', bg: 'bg-brand-50' },
          { label: 'Method', value: payment.paymentMethod || '-', icon: Receipt, iconColor: 'text-brand-700', bg: 'bg-brand-50' },
          { label: 'Paid At', value: payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-', icon: Clock, iconColor: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Customer', value: payment.customerName || '-', icon: User, iconColor: 'text-brand-700', bg: 'bg-brand-50', link: payment.customerId ? `/customers/${payment.customerId}` : null },
          { label: 'Order', value: payment.orderId || '-', icon: ShoppingBag, iconColor: 'text-brand-700', bg: 'bg-brand-50', link: payment.orderId ? `/orders/${payment.orderId}` : null },
        ].map(item => {
          const Icon = item.icon
          const content = (
            <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow min-h-[80px]">
              <div className={`p-2.5 rounded-xl ${item.bg} ${item.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-faint uppercase ">{item.label}</p>
                <p className="text-sm font-bold text-ink truncate">{item.value}</p>
                {item.link && (
                  <span className="text-[11px] text-brand-700 font-medium flex items-center gap-0.5 mt-0.5">
                    View <ExternalLink className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>
          )
          return item.link ? (
            <Link key={item.label} href={item.link} className="block">
              {content}
            </Link>
          ) : (
            <div key={item.label}>{content}</div>
          )
        })}
      </div>

      {/* Gateway + Timeline side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Gateway Information */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Receipt size={16} className="text-muted-foreground" />
              <CardTitle className="text-[15px]">Gateway Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                ['Razorpay Order ID', payment.razorpayOrderId],
                ['Razorpay Payment ID', payment.razorpayPaymentId],
                ['Transaction ID', payment.transactionId],
              ].map(([label, value]) => (
                <div key={label} className="p-3 rounded-xl border border-border bg-surface-2/70">
                  <p className="text-[11px] text-faint font-bold uppercase  mb-1.5">{label}</p>
                  <p className="text-[13px] font-mono font-medium text-ink break-all">{value || '-'}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Timeline */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-muted-foreground" />
              <CardTitle className="text-[15px]">Payment Timeline</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {(payment.statusHistory || []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No payment status history available.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {payment.statusHistory.map((entry, index) => (
                  <div key={`${entry.status}-${entry.updatedAt}-${index}`} className="py-3 flex items-start justify-between gap-4 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-semibold text-ink">{entry.status}</p>
                      {entry.note && <p className="text-xs text-muted-foreground mt-0.5">{entry.note}</p>}
                    </div>
                    <p className="text-xs text-faint whitespace-nowrap">{formatDate(entry.updatedAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Refund History */}
      <RefundHistory refunds={payment.refunds || []} />
    </div>
  )
}
