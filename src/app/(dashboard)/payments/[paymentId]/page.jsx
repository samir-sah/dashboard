'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CreditCard, User, ShoppingBag, Receipt, AlertCircle } from 'lucide-react'
import { paymentService } from '@/features/payments/services'
import StatusBadge from '@/components/shared/StatusBadge'
import RefundHistory from '@/features/payments/components/RefundHistory'
import { getSimplifiedStatus } from '@/features/payments/utils'

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
      <div className="max-w-4xl w-full pb-10 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="h-48 bg-gray-200 rounded-xl"></div>
          <div className="h-48 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="h-64 bg-gray-200 rounded-xl"></div>
      </div>
    )
  }

  if (error || !payment) {
    return (
      <div className="max-w-4xl w-full pb-10">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors">
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
    <div className="max-w-[1000px] w-full pb-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Back to Payments
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">{payment.paymentId || payment.orderId}</h1>
            <StatusBadge status={getSimplifiedStatus(payment.status)} />
          </div>
          <p className="text-gray-500 text-sm mt-1">Created on {formatDate(payment.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-indigo-600">
            <CreditCard size={20} />
            <h2 className="font-semibold text-gray-900">Payment Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Amount</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Method</p>
                <p className="text-sm font-medium text-gray-900">{payment.paymentMethod}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Paid At</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(payment.paidAt)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-emerald-600">
              <User size={20} />
              <h2 className="font-semibold text-gray-900">Customer</h2>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{payment.customerName}</p>
              <p className="text-sm text-gray-500 mt-1">ID: {payment.customerId || '-'}</p>
              {payment.customerId && (
                <Link href={`/customers/${payment.customerId}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-2 inline-block">
                  View Customer Profile -&gt;
                </Link>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col max-h-[300px]">
            <div className="flex items-center gap-2 mb-4 text-blue-600 shrink-0">
              <ShoppingBag size={20} />
              <h2 className="font-semibold text-gray-900">Linked Order</h2>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{payment.orderId}</p>
              <Link href={`/orders/${payment.orderId}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-2 inline-block">
                View Order Details -&gt;
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4 text-gray-700">
          <Receipt size={20} />
          <h2 className="font-semibold text-gray-900">Gateway Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Razorpay Order ID</p>
            <p className="text-sm font-mono text-gray-900 bg-gray-50 p-2 rounded border border-gray-100 break-all">{payment.razorpayOrderId || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Razorpay Payment ID</p>
            <p className="text-sm font-mono text-gray-900 bg-gray-50 p-2 rounded border border-gray-100 break-all">{payment.razorpayPaymentId || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Transaction ID</p>
            <p className="text-sm font-mono text-gray-900 bg-gray-50 p-2 rounded border border-gray-100 break-all">{payment.transactionId || '-'}</p>
          </div>
        </div>
      </div>

      <RefundHistory refunds={payment.refunds || []} />
    </div>
  )
}
