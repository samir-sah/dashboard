'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useOrderById } from '../../hooks/useOrderById'
import { ArrowLeft, Save, Loader, CheckCircle } from 'lucide-react'
import { Button }    from '@/components/ui/Button'
import { Input }     from '@/components/ui/Input'
import { Label }     from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Separator } from '@/components/ui/separator'

const STATUS_OPTIONS = ['Confirmed','Processing','Shipped','Delivered']

const statusStyles = {
  Confirmed:  'bg-slate-100 text-slate-700 border-slate-200',
  Processing: 'bg-brand-50 text-brand-800 border-brand-100',
  Shipped:    'bg-amber-50 text-amber-700 border-amber-200',
  Delivered:  'bg-brand-100 text-brand-800 border-brand-100',
  Cancelled:  'bg-red-100 text-red-600 border-red-200',
}

function Field({ label, id, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs font-semibold text-muted-foreground uppercase ">{label}</Label>
      {children}
    </div>
  )
}

function AddressFields({ values, onChange, disabled }) {
  const f = (field) => ({
    id: field,
    value: values[field],
    onChange: e => onChange(field, e.target.value),
    disabled,
    className: 'text-[13.5px]',
  })
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <Field label="Address Line 1" id="addressLine1"><Input placeholder="Flat / Unit / Building" {...f('addressLine1')} /></Field>
      </div>
      <div className="col-span-2">
        <Field label="Street" id="street"><Input placeholder="Street address" {...f('street')} /></Field>
      </div>
      <Field label="City"    id="city">   <Input placeholder="City"    {...f('city')}    /></Field>
      <Field label="State"   id="state">  <Input placeholder="State"   {...f('state')}   /></Field>
      <Field label="Pincode" id="pincode"><Input placeholder="Pincode" {...f('pincode')} /></Field>
      <Field label="Country" id="country"><Input placeholder="Country" {...f('country')} /></Field>
    </div>
  )
}

export default function EditOrderPage() {
  const { id } = useParams()
  const router = useRouter()
  const { order, loading: orderLoading } = useOrderById(id)

  const [status,    setStatus]    = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [phone,     setPhone]     = useState('')
  const [shipping,  setShipping]  = useState({ addressLine1: '', street: '', city: '', state: '', pincode: '', country: '' })
  const [billing,   setBilling]   = useState({ addressLine1: '', street: '', city: '', state: '', pincode: '', country: '' })
  const [sameAsShipping, setSameAsShipping] = useState(false)

  const [customerLoading, setCustomerLoading] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saved,    setSaved]    = useState(false)

  const orderId = order?.orderId ?? id
  const userId  = typeof order?.userId === 'string' ? order?.userId : order?.userId?._id ?? null
  const isLoading = orderLoading || customerLoading

  useEffect(() => {
    if (!order) return
    void Promise.resolve().then(() => {
      const latest = order.statusHistory?.length
        ? order.statusHistory[order.statusHistory.length - 1].status
        : 'Confirmed'
      setStatus(latest)
      const sa = order.customer?.shippingAddress ?? {}
      const ba = order.customer?.billingAddress  ?? {}
      setShipping({ addressLine1: sa.addressLine1 ?? '', street: sa.street ?? '', city: sa.city ?? '', state: sa.state ?? '', pincode: sa.pincode ?? '', country: sa.country ?? '' })
      setBilling({  addressLine1: ba.addressLine1 ?? '', street: ba.street ?? '', city: ba.city ?? '', state: ba.state ?? '', pincode: ba.pincode ?? '', country: ba.country ?? '' })
    })
  }, [order])

  useEffect(() => {
    if (!userId) return
    const load = async () => {
      setCustomerLoading(true)
      try {
        const res   = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
        if (!res.ok) return
        // ✅ AFTER — parse once, then check for .data wrapper
        const json = await res.json()
        const c    = json.data ?? json
        setFirstName(c.firstName ?? '')
        setLastName(c.lastName   ?? '')
        setPhone(String(c.phone  ?? ''))
      } catch (_) {}
      finally { setCustomerLoading(false) }
    }
    load()
  }, [userId])

  useEffect(() => {
    if (sameAsShipping) void Promise.resolve().then(() => setBilling({ ...shipping }))
  }, [sameAsShipping, shipping])

  const handleSave = async () => {
    setSaving(true); setSaveError(null); setSaved(false)
    try {
      const headers = {
        'Content-Type': 'application/json',
      }

      // Call 1 — update order: status + addresses (all live on the order document)
      const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          status,
          shippingAddress: shipping,
          billingAddress:  sameAsShipping ? shipping : billing,
        }),
      })
      if (!orderRes.ok) {
        const err = await orderRes.json().catch(() => ({}))
        throw new Error(err.message || `Failed (${orderRes.status})`)
      }
      
      setSaved(true)
      setTimeout(() => router.push(`/orders/${orderId}`), 1200)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-[1400px]">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5 text-[13px]">
        <span onClick={() => router.push('/orders')} className="text-brand-700 cursor-pointer font-medium hover:underline">Orders</span>
        <span className="text-faint">›</span>
        <span onClick={() => router.push(`/orders/${orderId}`)} className="text-brand-700 cursor-pointer font-medium hover:underline">{orderId}</span>
        <span className="text-faint">›</span>
        <span className="text-muted-foreground font-medium">Edit</span>
      </div>

      {/* Header */}
      <Card className="mb-6">
        <CardContent className="flex items-center justify-between py-4 px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/orders/${orderId}`)}>
              <ArrowLeft size={18} />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-ink">Edit Order</h1>
              <p className="text-xs text-faint">{isLoading ? 'Loading...' : `Order #${orderId}`}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {saveError && <span className="text-[13px] text-red-600">⚠ {saveError}</span>}
            <Button variant="outline" onClick={() => router.push(`/orders/${orderId}`)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || saved || isLoading}
              className={saved ? 'bg-brand-700 hover:bg-brand-800' : ''}>
              {saved    ? <><CheckCircle size={15} /> Saved</>
              : saving  ? <><Loader size={15} className="animate-spin" /> Saving...</>
              :           <><Save size={15} /> Save Changes</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Row 1: Customer Info + Order Status side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 mb-5">
        {/* Customer Information — read only */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Customer Information</CardTitle>
            <p className="text-xs text-faint">Managed by the customer</p>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5 grid grid-cols-3 gap-4">
            <Field label="First Name" id="firstName">
              <Input id="firstName" value={firstName} disabled className="text-[13.5px] bg-surface-2 text-faint cursor-not-allowed" />
            </Field>
            <Field label="Last Name" id="lastName">
              <Input id="lastName" value={lastName} disabled className="text-[13.5px] bg-surface-2 text-faint cursor-not-allowed" />
            </Field>
            <Field label="Phone" id="phone">
              <Input id="phone" value={phone} disabled className="text-[13.5px] bg-surface-2 text-faint cursor-not-allowed" />
            </Field>
          </CardContent>
        </Card>

        {/* Order Status */}
        <Card className="sticky top-6 h-fit">
          <CardHeader>
            <CardTitle className="text-sm">Order Status</CardTitle>
            <p className="text-xs text-faint">Select the current status</p>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5 flex flex-col gap-2">
            {STATUS_OPTIONS.map(s => {
              const active = status === s
              return (
                <button key={s} onClick={() => setStatus(s)} disabled={isLoading}
                  className={`w-full px-4 py-2.5 rounded-xl text-[13px] font-semibold text-left flex items-center justify-between border-[1.5px] transition-all cursor-pointer
                    ${active ? statusStyles[s] : 'bg-surface-2 text-faint border-border hover:bg-surface-elevated'}`}>
                  {s}
                  {active && <span>✓</span>}
                </button>
              )
            })}
            {saved && (
              <div className="mt-2 px-3 py-2.5 bg-brand-50 border border-brand-100 rounded-lg text-brand-800 text-[13px]">
                ✓ Saved — redirecting...
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Shipping + Billing side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Shipping Address */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Shipping Address</CardTitle></CardHeader>
          <Separator />
          <CardContent className="pt-5">
            <AddressFields values={shipping} onChange={(f, v) => setShipping(p => ({ ...p, [f]: v }))} disabled={isLoading} />
          </CardContent>
        </Card>

        {/* Billing Address */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Billing Address</CardTitle>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={sameAsShipping} onChange={e => setSameAsShipping(e.target.checked)} className="w-4 h-4 accent-brand-700" />
                <span className="text-[13px] text-muted-foreground">Same as shipping</span>
              </label>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5">
            {sameAsShipping
              ? <p className="text-[13px] text-faint text-center py-2">Billing address matches shipping address.</p>
              : <AddressFields values={billing} onChange={(f, v) => setBilling(p => ({ ...p, [f]: v }))} disabled={isLoading} />
            }
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
