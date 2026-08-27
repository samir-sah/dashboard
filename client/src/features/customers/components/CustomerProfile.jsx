'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Phone, Calendar, MapPin, CheckCircle2, ShoppingBag, IndianRupee, TrendingUp, User, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import CustomerOrders from "./CustomerOrders"


export default function CustomerProfile({ customer, orders, loadingOrders }) {
  if (!customer) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Active": return "default";
      case "Inactive": return "destructive";
      case "New": return "secondary";
      default: return "outline";
    }
  };

  const getCustomBadgeStyle = (status) => {
    switch (status) {
      case "Active": return "bg-brand-100 text-brand-800 hover:bg-brand-100 border-transparent";
      case "Inactive": return "bg-rose-100 text-rose-700 hover:bg-rose-200 border-transparent";
      case "New": return "bg-brand-100 text-brand-800 hover:bg-brand-100 border-transparent";
      default: return "bg-surface-elevated text-foreground hover:bg-surface-elevated border-transparent";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column: Profile Info & Addresses */}
      <div className="space-y-6 lg:col-span-1">
        {/* Customer Information */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="size-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4 border-2 border-background shadow-sm">
                <span className="text-2xl font-bold">
                  {customer.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground">{customer.name}</h2>
              <div className="mt-2">
                <Badge className={getCustomBadgeStyle(customer.status)} variant={getStatusBadgeVariant(customer.status)}>
                  {customer.status}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="size-4 shrink-0" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Calendar className="size-4 shrink-0" />
                <span>Joined {formatDate(customer.joinedDate)}</span>
              </div>
              <div className="flex flex-col gap-1.5 text-left">
                <span className="text-xs font-semibold uppercase  text-muted-foreground">Gender</span>
                <span className="text-sm font-medium text-foreground">{customer.genderLabel || "Not Specified"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Addresses Carousel */}
        <AddressCarousel addresses={customer.addresses} />
      </div>

      {/* Right Column: KPIs & Recent Orders */}
      <div className="space-y-6 lg:col-span-2">
        {/* Summary Cards — icon-left style matching dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Orders', value: customer.totalOrders, icon: ShoppingBag, iconColor: 'text-brand-700', bg: 'bg-brand-50' },
            { label: 'Total Spend', value: `₹${customer.totalSpend.toLocaleString()}`, icon: IndianRupee, iconColor: 'text-brand-700', bg: 'bg-brand-50' },
            { label: 'Avg Order Value', value: `₹${customer.totalOrders > 0 ? Math.round(customer.totalSpend / customer.totalOrders).toLocaleString() : 0}`, icon: TrendingUp, iconColor: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(item => {
            const Icon = item.icon
            return (
              <div key={item.label} className="bg-card rounded-xl border border-border p-5 flex items-center gap-3 shadow-sm">
                <div className={`p-2.5 rounded-xl ${item.bg} ${item.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-faint  uppercase">{item.label}</p>
                  <p className="text-2xl font-bold leading-none text-ink">{item.value}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Orders Section */}
        <Card className="border-border shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest transactions from this customer.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <CustomerOrders orders={orders ? orders.slice(0, 5) : []} loading={loadingOrders} />
            {orders && orders.length > 5 && (
              <div className="mt-4 pt-2 text-center border-t border-border">
                <Link href={`/orders?customerId=${customer.id}`} className="text-sm font-medium text-brand-700 hover:text-brand-900 transition-colors">
                  View All Orders &rarr;
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}

function AddressCarousel({ addresses }) {
  const [idx, setIdx] = useState(0)

  if (!addresses || addresses.length === 0) {
    return (
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Addresses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6 text-muted-foreground border border-dashed border-border rounded-lg">
            No addresses saved.
          </div>
        </CardContent>
      </Card>
    )
  }

  const addr = addresses[idx]
  const total = addresses.length
  const prev = () => setIdx(i => (i - 1 + total) % total)
  const next = () => setIdx(i => (i + 1) % total)

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">Addresses</CardTitle>
            <CardDescription className="text-xs">{idx + 1} of {total}</CardDescription>
          </div>
          {total > 1 && (
            <div className="flex items-center gap-1">
              <button onClick={prev} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <ChevronLeft className="size-4" />
              </button>
              <button onClick={next} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative rounded-lg border border-border p-4 bg-muted/20">
          {addr.isDefault && (
            <div className="absolute top-0 right-0 bg-primary/10 text-primary px-2.5 py-1 text-xs font-semibold rounded-bl-lg rounded-tr-lg flex items-center gap-1">
              <CheckCircle2 className="size-3" />
              Default
            </div>
          )}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-background border border-border shadow-sm rounded-full shrink-0">
              <MapPin className="size-4 text-muted-foreground" />
            </div>
            <div>
              <div className="font-medium text-foreground text-sm mb-1">{addr.type === "Address" ? "Address" : `${addr.type} Address`}</div>
              <div className="text-sm text-muted-foreground space-y-0.5">
                {addr.line1 && <p>{addr.line1}</p>}
                {addr.street && <p>{addr.street}</p>}
                {(addr.city || addr.state) && <p>{[addr.city, addr.state].filter(Boolean).join(', ')}</p>}
                {addr.pincode && <p>PIN: {addr.pincode}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        {total > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {addresses.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-brand-500 w-4' : 'bg-surface-elevated hover:bg-brand-300'}`}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
