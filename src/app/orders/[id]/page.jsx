'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useOrderById } from '../hooks/useOrderById'
import { useCustomerById } from '../hooks/useCustomerById'
import { ArrowLeft, Package, MapPin, Truck, Calendar, Pencil, X, AlertCircle, CreditCard } from 'lucide-react'
import StatusBadge from "@/components/shared/StatusBadge"
import { cn } from '@/lib/utils'
// REPLACE lines 8-14 with these corrected imports:
import { Button }                                   from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge }                                    from '@/components/ui/Badge'
import { Skeleton }                                 from '@/components/ui/Skeleton'
import { Separator }                                from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'

const getLatestStatus = (order) => order?.statusHistory?.at(-1)?.status ?? 'Confirmed'
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'
const formatAddr = (a) =>
  a ? [a.addressLine1, a.street, a.city, a.state, a.pincode, a.country].filter(Boolean).join(', ') : 'Not provided'

const STEPS = ['Confirmed', 'Processing', 'Shipped', 'Delivered']
const STEP_MAP = { Confirmed:1, Processing:2, Shipped:3, Delivered:4, Cancelled:1 }

function OrderStepper({ status, order }) {
  const isCancelled = status === 'Cancelled'
  let activeStatus = status
  if (isCancelled && order?.statusHistory?.length >= 2) {
    activeStatus = order.statusHistory[order.statusHistory.length - 2].status
  }
  const done = STEP_MAP[activeStatus] ?? 1

  return (
    <div className="flex flex-col gap-4">
      {isCancelled && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-red-600" />
            <span className="text-sm font-bold text-red-700">Order Cancelled</span>
          </div>
          <p className="text-xs text-red-600/80 mb-1">
            <strong>Reason:</strong> {order.cancellationReason || 'No reason provided'}
          </p>
        </div>
      )}
      <Card className="sticky top-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Order Processing</CardTitle>
          <p className="text-xs text-muted-foreground">{done} of {STEPS.length} steps completed</p>
        </CardHeader>
        <CardContent>
          <div className="h-1.5 bg-muted rounded-full mb-5 overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${(done / STEPS.length) * 100}%` }} />
          </div>
          <div className="flex flex-col gap-2">
            {STEPS.map((step, i) => (
              <div key={step} className={cn('flex items-center gap-3 px-3.5 py-3 rounded-xl border', i < done ? 'bg-green-50 border-green-200' : 'bg-muted/40 border-muted')}>
                <div className={cn('w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[11px] font-black', i < done ? 'bg-green-600 text-white' : 'bg-muted')}>
                  {i < done ? '✓' : ''}
                </div>
                <span className={cn('text-[13.5px] flex-1', i < done ? 'font-semibold text-green-700' : 'text-muted-foreground')}>{step}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function OrderItemsCard({ order }) {
  const items = order?.orderItems ?? []
  const total = order?.totalAmount ?? 0
  const ship  = order?.shippingCharges ?? 0
  const sub   = total - ship
  return (
    <Card className="mb-5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[15px]">Order Items</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
          <span className="text-[15px] font-bold">Total: ₹{total.toLocaleString('en-IN')}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {items.length === 0
            ? <p className="text-center text-muted-foreground text-sm py-6">No items found</p>
            : items.map((item, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl border border-muted bg-muted/30">
                <div className="w-18 h-18 rounded-xl shrink-0 bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <Package size={28} className="text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold mb-1">{item.productName ?? 'Product'}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.sku && <span className="text-[11px] text-muted-foreground">SKU: <strong>{item.sku}</strong></span>}
                    {item.hsnCode && <><span className="text-muted-foreground/40 text-[11px]">·</span><span className="text-[11px] text-muted-foreground">HSN: <strong>{item.hsnCode}</strong></span></>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground mb-1">{item.quantity ?? 1} × ₹{(item.price ?? 0).toLocaleString('en-IN')}</p>
                  <p className="text-[15px] font-bold">₹{((item.price ?? 0) * (item.quantity ?? 1)).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))
          }
        </div>
        <Separator className="my-5" />
        {(() => {
          const taxRate = items[0]?.taxRate ?? 0
          const taxAmt = Math.round(sub * (taxRate / 100))
          return [
            ['Subtotal',  `₹${sub.toLocaleString('en-IN')}`,                         false],
            [`GST (${taxRate}%)`, `₹${taxAmt.toLocaleString('en-IN')}`,               false],
            ['Shipping',  ship === 0 ? 'FREE' : `₹${ship.toLocaleString('en-IN')}`,  ship === 0],
          ].map(([label, val, green]) => (
            <div key={label} className="flex justify-between py-1.5 text-[13.5px]">
              <span className="text-muted-foreground">{label}</span>
              <span className={cn('font-medium', green && 'text-green-600')}>{val}</span>
            </div>
          ))
        })()}
        <Separator className="my-2" />
        <div className="flex justify-between text-[15px] font-bold pt-1">
          <span>Total</span>
          <span className="text-indigo-600">₹{total.toLocaleString('en-IN')}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function DeliveryInfo({ order, onEdit }) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[15px]">Delivery Information</CardTitle>
          <Button variant="outline" size="sm" onClick={onEdit} className="h-8 text-xs gap-1.5 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50">
            <Pencil size={12} /> Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent>

        <div className="flex flex-col gap-3">
          {[['Shipping Address', order?.customer?.shippingAddress], ['Billing Address', order?.customer?.billingAddress]].map(([label, addr]) => (
            <div key={label} className="p-4 rounded-xl border border-muted bg-muted/30">
              <div className="flex items-center gap-1.5 mb-2">
                <MapPin size={13} className="text-muted-foreground" />
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
              </div>
              <p className="text-[13.5px] text-foreground/80 leading-relaxed">{formatAddr(addr)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function PaymentInfoCard({ order }) {
  const payment = order?.payment || {}
  const rows = [
    ['Payment Status', payment.status || 'Pending'],
    ['Payment Method', payment.method || '-'],
    ['Transaction ID', payment.transactionId || '-'],
    ['Amount', `Rs. ${Number(payment.amount || order?.totalAmount || 0).toLocaleString('en-IN')}`],
    ['Paid At', payment.paidAt ? new Date(payment.paidAt).toLocaleString('en-IN') : '-'],
    ['Razorpay Order ID', payment.razorpayOrderId || '-'],
    ['Razorpay Payment ID', payment.razorpayPaymentId || '-'],
  ]

  return (
    <Card className="mb-5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-indigo-600" />
            <CardTitle className="text-[15px]">Payment Information</CardTitle>
          </div>
          <StatusBadge status={payment.status || 'Pending'} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rows.map(([label, value]) => (
            <div key={label} className="p-3.5 rounded-xl border border-muted bg-muted/30 min-w-0">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
              <p className="text-[13.5px] font-semibold text-foreground/80 break-words">{value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function CustomerInfo({ order, onEdit }) {
  const { customer, loading, error } = useCustomerById(order?.userId)
  const fullName = customer ? `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim() : '—'
  const initials = customer ? `${customer.firstName?.[0] ?? ''}${customer.lastName?.[0] ?? ''}`.toUpperCase() : '?'

  if (loading) return (
    <Card><CardContent className="pt-6 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-13 h-13 rounded-full" />
        <div className="flex-1 flex flex-col gap-2"><Skeleton className="w-2/5 h-5" /><Skeleton className="w-1/3 h-3" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
    </CardContent></Card>
  )

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[15px]">Customer Information</CardTitle>
            <Button variant="outline" size="sm" onClick={onEdit} className="h-8 text-xs gap-1.5 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50">
              <Pencil size={12} /> Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && <div className="px-3.5 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-4">⚠ {error}</div>}
          <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-xl border border-muted mb-5">
            <div className="w-13 h-13 rounded-full bg-indigo-50 flex items-center justify-center text-[18px] font-bold text-indigo-600 shrink-0">{initials}</div>
            <div>
              <p className="text-base font-bold mb-0.5">{fullName}</p>
              <p className="text-xs text-muted-foreground">{customer?.customerId ?? '—'} · {customer?.role ?? '—'}</p>
            </div>
            <Badge className={cn('ml-auto text-xs font-semibold border-0', customer?.isActive ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-red-100 text-red-600 hover:bg-red-100')}>
              {customer?.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Full Name',      fullName],
              ['Email',          customer?.email ?? '—'],
              ['Phone',          customer?.phone ? `${customer.phone}` : '—'],
              ['Customer Since', formatDate(customer?.createdAt)],
            ].map(([label, value]) => (
              <div key={label} className="p-3.5 rounded-xl border border-muted bg-muted/30">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
                <p className="text-[13.5px] font-semibold text-foreground/80">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-4"><CardTitle className="text-[15px]">Address Details</CardTitle></CardHeader>
        <CardContent>
          {!customer?.addresses?.length
            ? <p className="text-muted-foreground text-sm text-center py-5">No addresses saved</p>
            : <div className="flex flex-col gap-3">
                {customer.addresses.map((addr, i) => (
                  <div key={addr._id ?? i} className={cn('p-3.5 rounded-xl border', addr.isDefault ? 'bg-indigo-50/60 border-indigo-100' : 'bg-muted/30 border-muted')}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-muted-foreground" />
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Address {i + 1}</span>
                      </div>
                      {addr.isDefault && <Badge className="text-[11px] bg-indigo-50 text-indigo-600 border-0 hover:bg-indigo-50">Default</Badge>}
                    </div>
                    <p className="text-[13.5px] text-foreground/80 leading-relaxed">{formatAddr(addr)}</p>
                  </div>
                ))}
              </div>
          }
        </CardContent>
      </Card>
    </div>
  )
}

export default function OrderDetailPage() {
  const { id }                    = useParams()
  const router                    = useRouter()
  const { order, loading, error } = useOrderById(id)
  const [tab, setTab]             = useState('order')
  const status  = order ? getLatestStatus(order) : '—'
  const orderId = order?.orderId ?? id
  const goToEdit = () => router.push(`/orders/${orderId}/edit`)

  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReasonCategory, setCancelReasonCategory] = useState('')
  const [cancelReasonNote, setCancelReasonNote] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelError, setCancelError] = useState(null)

  const handleCancelOrder = async () => {
    if (!cancelReasonCategory) {
      setCancelError('Please select a cancellation reason')
      return
    }
    
    const finalReason = cancelReasonCategory === 'Other' 
      ? `Other: ${cancelReasonNote}`.trim()
      : (cancelReasonNote ? `${cancelReasonCategory} - ${cancelReasonNote}` : cancelReasonCategory)

    setCancelLoading(true)
    setCancelError(null)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/cancelorder/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ reason: finalReason })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to cancel order')
      
      setCancelModalOpen(false)
      window.location.reload()
    } catch (err) {
      setCancelError(err.message)
    } finally {
      setCancelLoading(false)
    }
  }

  return (
    <div className="max-w-325">
      <nav className="flex items-center gap-2 mb-5 text-[13px]">
        <span onClick={() => router.push('/orders')} className="text-indigo-600 cursor-pointer font-medium hover:text-indigo-700">Orders</span>
        <span className="text-muted-foreground">›</span>
        <span className="font-medium">{orderId}</span>
      </nav>

      <Card className="mb-5">
        <CardContent className="py-5 px-7 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <Button variant="ghost" size="icon" onClick={() => router.push('/orders')} className="h-8 w-8 text-muted-foreground">
                <ArrowLeft size={18} />
              </Button>
              {loading ? <Skeleton className="w-50 h-7" /> : <h1 className="text-[22px] font-bold">Order {orderId}</h1>}
            </div>
            <div className="flex items-center gap-2.5 pl-7">
              {loading
                ? <Skeleton className="w-65 h-4" />
                : <><span className="text-[13px] text-muted-foreground">{formatDate(order?.orderDate)}</span><span className="text-muted-foreground/50">·</span><StatusBadge status={status} /></>
              }
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {(status === 'Confirmed' || status === 'Processing') && (
              <Button variant="outline" size="sm" onClick={() => setCancelModalOpen(true)} className="gap-1.5 text-[13px] text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                <X size={14} /> Cancel Order
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={goToEdit} className="gap-1.5 text-[13px] hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50">
              <Pencil size={14} /> Edit Order
            </Button>
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-muted bg-muted/40 text-[13px] text-muted-foreground">
              <Truck size={15} /> Delivery
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="px-4 py-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-5">
          ⚠ {error} — <span onClick={() => router.push('/orders')} className="cursor-pointer underline">Go back</span>
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <div className="bg-background rounded-t-2xl border border-b-0 px-6">
          <TabsList className="bg-transparent h-auto p-0 gap-0 rounded-none">
            {[['order','Order Details'],['customer','Customer Details']].map(([key, label]) => (
              <TabsTrigger key={key} value={key} className="px-5 py-4 text-sm bg-transparent shadow-none rounded-none border-b-2 -mb-px data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:font-semibold data-[state=active]:bg-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:border-transparent">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <Separator className="mb-5" />

        <div className="flex gap-5 items-start">
          <div className="flex-1 min-w-0">
            {loading
              ? <Card><CardContent className="pt-6 flex flex-col gap-4">
                  <Skeleton className="w-2/5 h-5" />
                  {[1,2].map(i => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl border border-muted">
                      <Skeleton className="w-18 h-18 rounded-xl shrink-0" />
                      <div className="flex-1 flex flex-col gap-2"><Skeleton className="w-3/5 h-4" /><Skeleton className="w-2/5 h-3" /></div>
                      <Skeleton className="w-20 h-5 shrink-0" />
                    </div>
                  ))}
                </CardContent></Card>
              : <>
                  <TabsContent value="order" className="mt-0"><OrderItemsCard order={order} /><PaymentInfoCard order={order} /><DeliveryInfo order={order} onEdit={goToEdit} /></TabsContent>
                  <TabsContent value="customer" className="mt-0"><CustomerInfo order={order} onEdit={goToEdit} /></TabsContent>
                </>
            }
          </div>
          <div className="w-75 shrink-0">
            {loading
              ? <Card><CardContent className="pt-6 flex flex-col gap-3">
                  <Skeleton className="w-3/5 h-5" /><Skeleton className="w-2/5 h-3" /><Skeleton className="w-full h-2 rounded-full" />
                  {STEPS.map((_,i) => <Skeleton key={i} className="w-full h-12 rounded-xl" />)}
                </CardContent></Card>
              : <OrderStepper status={status} order={order} />
            }
          </div>
        </div>
      </Tabs>

      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-[400px] shadow-xl">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertCircle size={18} /> Cancel Order
              </CardTitle>
              <p className="text-[13.5px] text-muted-foreground mt-1">
                Are you sure you want to cancel this order?<br/>
                This action will restore inventory and mark the order as cancelled. Note: Payment refunds must be handled manually.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">Cancellation Reason <span className="text-red-500">*</span></label>
                <select 
                  value={cancelReasonCategory} 
                  onChange={e => setCancelReasonCategory(e.target.value)} 
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-[13.5px] outline-none focus:border-red-400 focus:ring-3 focus:ring-red-500/10"
                >
                  <option value="" disabled>Select a reason...</option>
                  <option value="Customer Request">Customer Request</option>
                  <option value="Out of Stock">Out of Stock</option>
                  <option value="Duplicate Order">Duplicate Order</option>
                  <option value="Fraud Suspected">Fraud Suspected</option>
                  <option value="Admin Error">Admin Error</option>
                  <option value="Other">Other</option>
                </select>
                {(cancelReasonCategory === 'Other' || cancelReasonCategory) && (
                  <textarea 
                    value={cancelReasonNote} 
                    onChange={e => setCancelReasonNote(e.target.value)} 
                    placeholder="Optional details..."
                    className="w-full mt-2 min-h-[60px] p-3 rounded-xl border border-border bg-background text-[13.5px] outline-none focus:border-red-400 focus:ring-3 focus:ring-red-500/10 resize-none"
                  />
                )}
              </div>
              {cancelError && <p className="text-[13px] text-red-600 font-medium">⚠ {cancelError}</p>}
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => { setCancelModalOpen(false); setCancelError(null); setCancelReasonCategory(''); setCancelReasonNote('') }} disabled={cancelLoading}>Go Back</Button>
                <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleCancelOrder} disabled={cancelLoading}>
                  {cancelLoading ? 'Cancelling...' : 'Cancel Order'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}