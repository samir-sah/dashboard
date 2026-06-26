'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableHeader, TableBody,
  TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import { Package, MapPin, ClipboardCheck, FileText, Clock, Hash } from 'lucide-react'

/* ─── Helpers ─────────────────────────────────────────── */
const fmt     = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const fmtTime = d => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '—'
const money   = n => `₹${(n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const STATUS_STYLE = {
  Confirmed:    'bg-slate-100 text-slate-700',
  Processing:   'bg-indigo-50 text-indigo-700',
  Shipped:      'bg-amber-50 text-amber-700',
  Delivered:    'bg-emerald-50 text-emerald-700',
  Cancelled:    'bg-red-50 text-red-600',
}

const normalizeOrderStatus = status => {
  if (status === 'Pending') return 'Confirmed'
  if (status === 'Dispatched') return 'Shipped'
  return status || 'Confirmed'
}

/* ─── Data mapper ─────────────────────────────────────── */
export function extractOrderData(order) {
  const raw      = order?._raw ?? order
  const user     = raw?.userId && typeof raw.userId === 'object' ? raw.userId : null
  const shipping = raw?.customer?.shippingAddress ?? null
  const items    = raw?.orderItems ?? []
  const status   = normalizeOrderStatus(raw?.statusHistory?.at(-1)?.status)

  let extractedName = 'Unknown'
  if (user) {
    extractedName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Unknown'
  } else if (order?.customer) {
    if (typeof order.customer === 'string') {
      extractedName = order.customer
    } else {
      extractedName = order.customer.name || `${order.customer.firstName ?? ''} ${order.customer.lastName ?? ''}`.trim() || 'Unknown'
    }
  }
  const name = extractedName

  const total    = raw?.totalAmount ?? order?.amount ?? 0
  const shipCost = raw?.shippingCharges ?? 0
  const disc     = raw?.discount ?? 0

  return {
    orderId: raw?.orderId ?? order?.id ?? '—',
    orderDate: raw?.orderDate,
    status,
    customer: {
      name,
      phone: user?.phone,
      email: user?.email,
      address: shipping ? {
        addressLine1: shipping.addressLine1,
        street: shipping.street, city: shipping.city,
        state: shipping.state, pincode: shipping.pincode,
        country: shipping.country ?? 'India',
      } : null,
    },
    summary: {
      totalItems: items.length,
      totalQty: items.reduce((s, i) => s + (i.quantity ?? 1), 0),
      paymentMethod: raw?.paymentMethod ?? raw?.payment?.method ?? 'N/A',
      paymentStatus: raw?.paymentStatus ?? raw?.payment?.status ?? 'Pending',
      total, shipCost, disc,
      subtotal: total - shipCost + disc,
    },
    items: items.map(i => ({
      image:     i.image ?? i.productImage ?? null,
      name:      i.productName ?? i.name ?? 'Product',
      sku:       i.sku ?? i.productId ?? '—',
      hsnCode:   i.hsnCode ?? '—',
      taxRate:   i.taxRate ?? 0,
      variant:   i.variant ?? i.size ?? i.color ?? '—',
      qty:       i.quantity ?? 1,
      price:     i.price ?? 0,
      lineTotal: (i.price ?? 0) * (i.quantity ?? 1),
    })),
    notes: {
      customer: raw?.customerNotes ?? raw?.notes ?? null,
      admin:    raw?.adminNotes ?? null,
      special:  raw?.specialInstructions ?? null,
    },
    printedAt: new Date().toISOString(),
    ref: `REF-${(raw?.orderId ?? order?.id ?? '').toString().slice(-8)}-${Date.now().toString(36).toUpperCase()}`,
  }
}

/* ─── Tiny reusable label ─────────────────────────────── */
const Label = ({ children }) => (
  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">{children}</p>
)
const Val = ({ children, className }) => (
  <p className={cn('text-[13px] font-medium text-foreground leading-snug', className)}>{children}</p>
)

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  MAIN COMPONENT                                        */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const OrderLabel = forwardRef(function OrderLabel({ order, className }, ref) {
  const d   = extractOrderData(order)
  const now = fmtTime(d.printedAt)
  const addr = d.customer.address
    ? [d.customer.address.addressLine1, d.customer.address.street, d.customer.address.city, d.customer.address.state, d.customer.address.pincode, d.customer.address.country].filter(Boolean).join(', ')
    : null

  const hasNotes = d.notes.customer || d.notes.admin || d.notes.special

  return (
    <div ref={ref} className={cn('w-full max-w-[210mm] mx-auto bg-background font-sans print:max-w-none print:p-0 print:m-0 print:shadow-none', className)}>

      {/* ── HEADER ────────────────────────────────── */}
      <Card className="mb-3 print:rounded-none print:border-black print:border-[1.5px]">
        <CardContent className="py-4 px-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0 print:bg-white print:border print:border-black">
                <Package size={20} className="text-muted-foreground print:text-black" />
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight leading-none mb-0.5">PACKING SLIP</h1>
                <p className="text-xs text-muted-foreground">Order #{d.orderId}</p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-1 shrink-0">
              <Badge className={cn('text-[11px] font-bold print:bg-white print:text-black print:border-black', STATUS_STYLE[d.status] ?? STATUS_STYLE.Confirmed)}>
                {d.status}
              </Badge>
              <p className="text-[11px] text-muted-foreground"><span className="font-semibold text-foreground/70">Date:</span> {fmt(d.orderDate)}</p>
              <p className="text-[10px] text-muted-foreground/60">Printed: {now}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── CUSTOMER INFO ─────────────────────────── */}
      <Card className="mb-3 print:rounded-none print:border-black print:border-[1.5px] print:break-inside-avoid">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs flex items-center gap-1.5"><MapPin size={13} className="text-muted-foreground" /> Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
            <div><Label>Customer Name</Label><Val>{d.customer.name}</Val></div>
            {d.customer.phone && <div><Label>Phone</Label><Val>{d.customer.phone}</Val></div>}
            {d.customer.email && <div><Label>Email</Label><Val>{d.customer.email}</Val></div>}
            {addr && <div className="col-span-2"><Label>Shipping Address</Label><Val>{addr}</Val></div>}
          </div>
        </CardContent>
      </Card>

      {/* ── ORDER SUMMARY ─────────────────────────── */}
      <Card className="mb-3 print:rounded-none print:border-black print:border-[1.5px] print:break-inside-avoid">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs flex items-center gap-1.5"><ClipboardCheck size={13} className="text-muted-foreground" /> Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {[
              ['Total Items', d.summary.totalItems],
              ['Total Qty',   d.summary.totalQty],
              ['Payment',     d.summary.paymentMethod],
              ['Pay Status',  d.summary.paymentStatus],
            ].map(([l, v]) => (
              <div key={l} className="bg-muted/50 rounded-md px-3 py-2 print:bg-white print:border print:border-black/20">
                <Label>{l}</Label>
                <p className="text-sm font-bold">{v}</p>
              </div>
            ))}
          </div>
          <Separator className="my-2.5 print:bg-black/20" />
          <div className="space-y-1 text-xs">
            {[
              ['Subtotal',         money(d.summary.subtotal)],
              ['Shipping Charges', d.summary.shipCost === 0 ? 'FREE' : money(d.summary.shipCost)],
              ['Discount',         d.summary.disc > 0 ? `- ${money(d.summary.disc)}` : '—'],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between">
                <span className="text-muted-foreground">{l}</span>
                <span className={cn('font-semibold', (l === 'Shipping Charges' && d.summary.shipCost === 0) && 'text-emerald-600 print:text-black')}>{v}</span>
              </div>
            ))}
          </div>
          <Separator className="my-2 print:bg-black/20" />
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Final Amount</span>
            <span className="text-base font-extrabold">{money(d.summary.total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* ── PRODUCTS TABLE ────────────────────────── */}
      <Card className="mb-3 print:rounded-none print:border-black print:border-[1.5px] print:break-inside-avoid">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs flex items-center gap-1.5"><Package size={13} className="text-muted-foreground" /> Ordered Products</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40 print:bg-muted">
                <TableHead className="w-10 pl-5 text-[10px] font-bold uppercase tracking-wider">#</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Product</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">SKU</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Variant</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-center">Qty</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right">Price</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right pr-5">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">No items</TableCell>
                </TableRow>
              ) : d.items.map((item, i) => (
                <TableRow key={i} className={cn(i % 2 === 1 && 'bg-muted/20 print:bg-muted/30')}>
                  <TableCell className="pl-5 text-xs text-muted-foreground font-mono">{i + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-md bg-muted border flex items-center justify-center shrink-0 overflow-hidden print:border-black/30">
                        {item.image
                          ? <img src={item.image} alt={item.name} className="size-full object-cover rounded-md" />
                          : <Package size={12} className="text-muted-foreground" />}
                      </div>
                      <span className="text-[12.5px] font-semibold leading-tight">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{item.sku}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{item.variant}</TableCell>
                  <TableCell className="text-center text-[13px] font-bold">{item.qty}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground font-mono">{money(item.price)}</TableCell>
                  <TableCell className="text-right pr-5 text-[13px] font-bold font-mono">{money(item.lineTotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── PACKING CHECKLIST ─────────────────────── */}
      <Card className="mb-3 print:rounded-none print:border-black print:border-[1.5px] print:break-inside-avoid">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs flex items-center gap-1.5"><ClipboardCheck size={13} className="text-muted-foreground" /> Packing Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
            {['Items verified', 'Packaging completed', 'Invoice included', 'Quality check completed', 'Ready for dispatch'].map(item => (
              <label key={item} className="flex items-center gap-2.5 py-1 cursor-default">
                <span className="size-4 rounded-[3px] border-2 border-muted-foreground/30 shrink-0 print:border-black print:border-[1.5px]" />
                <span className="text-[12.5px] text-foreground/80">{item}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── NOTES (conditional) ───────────────────── */}
      {hasNotes && (
        <Card className="mb-3 print:rounded-none print:border-black print:border-[1.5px] print:break-inside-avoid">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1.5"><FileText size={13} className="text-muted-foreground" /> Internal Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              ['Customer Notes',      d.notes.customer, 'bg-amber-50 border-amber-100 print:bg-white'],
              ['Admin Notes',         d.notes.admin,    'bg-blue-50 border-blue-100 print:bg-white'],
              ['Special Instructions', d.notes.special, 'bg-violet-50 border-violet-100 print:bg-white'],
            ].map(([label, val, cls]) => val && (
              <div key={label} className={cn('rounded-md border px-3 py-2 print:border-black/20', cls)}>
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-0.5 print:text-black">{label}</p>
                <p className="text-xs text-foreground/80 leading-relaxed">{val}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── FOOTER ────────────────────────────────── */}
      <Card className="print:rounded-none print:border-black print:border-[1.5px] print:break-inside-avoid">
        <CardContent className="py-4 px-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Clock size={11} /> Generated: {now}</div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Hash size={11} /> Ref: {d.ref}</div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="border-b border-muted-foreground/30 h-7 print:border-black" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">Warehouse Staff Signature</p>
              </div>
              <div>
                <div className="border-b border-muted-foreground/30 h-7 print:border-black" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">Supervisor Signature</p>
              </div>
            </div>
          </div>
          <Separator className="my-3 print:bg-black/20" />
          <p className="text-[10px] text-muted-foreground text-center">System-generated packing slip · For internal warehouse use only</p>
        </CardContent>
      </Card>
    </div>
  )
})

export default OrderLabel
