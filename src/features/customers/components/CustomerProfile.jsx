'use client'

import Link from 'next/link'
import { Mail, Phone, Calendar, MapPin, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import CustomerOrders from "./CustomerOrders"

const genderOptions = [
  { value: "", label: "Not specified" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
]

export default function CustomerProfile({ customer, orders, loadingOrders, onGenderChange, savingGender }) {
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
      case "Active": return "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-transparent";
      case "Inactive": return "bg-rose-100 text-rose-700 hover:bg-rose-200 border-transparent";
      case "New": return "bg-purple-100 text-purple-700 hover:bg-purple-200 border-transparent";
      default: return "bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent";
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
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gender</span>
                <select
                  value={customer.gender || ""}
                  disabled={savingGender}
                  onChange={(event) => onGenderChange?.(event.target.value)}
                  className="h-9 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-500/10 disabled:opacity-60"
                >
                  {genderOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Addresses Section */}
        <Card className="border-border shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle>Addresses</CardTitle>
            <CardDescription>Saved shipping and billing locations.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            {customer.addresses && customer.addresses.length > 0 ? (
              <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2">
                {customer.addresses.map((addr) => (
                  <div key={addr.id} className="relative rounded-lg border border-border p-4 bg-muted/20">
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
                          <div className="font-medium text-foreground text-sm mb-1">{addr.type} Address</div>
                          <div className="text-sm text-muted-foreground space-y-0.5">
                            <p>{addr.line1}</p>
                            <p>{addr.street}</p>
                            <p>{addr.city}, {addr.state}</p>
                            <p>PIN: {addr.pincode}</p>
                          </div>
                        </div>
                      </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground border border-dashed border-border rounded-lg">
                No addresses saved for this customer.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column: KPIs & Recent Orders */}
      <div className="space-y-6 lg:col-span-2">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="kpi-card bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 justify-center"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s ease, transform 0.2s ease' }}>
            <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase">Total Orders</p>
            <p className="text-3xl font-bold leading-none text-gray-900">{customer.totalOrders}</p>
          </div>
          
          <div className="kpi-card bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 justify-center"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s ease, transform 0.2s ease' }}>
            <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase">Total Spend</p>
            <p className="text-3xl font-bold leading-none text-gray-900">₹{customer.totalSpend.toLocaleString()}</p>
          </div>

          <div className="kpi-card bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 justify-center"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s ease, transform 0.2s ease' }}>
            <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase">Average Order Value</p>
            <p className="text-3xl font-bold leading-none text-gray-900">
              ₹{customer.totalOrders > 0 ? Math.round(customer.totalSpend / customer.totalOrders).toLocaleString() : 0}
            </p>
          </div>
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
              <div className="mt-4 pt-2 text-center border-t border-gray-100">
                <Link href={`/orders?customerId=${customer.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
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
