'use client'

import { FileText } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { useDashboardRecentOrders } from "../hooks/useDashboard"

const formatDate = (date) => date
  ? new Date(date).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })
  : "-"

const latestStatus = (order) => order.statusHistory?.length
  ? normalizeOrderStatus(order.statusHistory[order.statusHistory.length - 1].status)
  : "Unknown"

const normalizeOrderStatus = (status) => {
  if (status === "Dispatched") return "Shipped"
  return status || "Confirmed"
}

export default function RecentOrders() {
  const query = useDashboardRecentOrders()
  const displayOrders = (query.data?.orders || query.data?.data || []).slice(0, 5).map((order) => {
    const user = order.userId && typeof order.userId === "object" ? order.userId : null
    return {
      id: order.orderId || order._id,
      customer: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown" : "Unknown",
      date: formatDate(order.orderDate || order.createdAt),
      amount: `₹${Number(order.totalAmount || 0).toLocaleString("en-IN")}`,
      status: latestStatus(order),
    }
  })

  return (
    <div className="h-full w-full overflow-hidden rounded-[1.1rem] border border-border bg-card shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="text-lg font-semibold text-ink">Recent Orders</h3>
        <Button asChild variant="outline" size="sm" className="text-xs font-semibold">
          <Link href="/orders">View All</Link>
        </Button>
      </div>

      {query.isLoading ? (
        <div className="space-y-3 p-4">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-9 animate-pulse rounded-full bg-surface-elevated" />)}</div>
      ) : query.error ? (
        <div className="m-4 rounded-[1.1rem] border border-red-100 bg-red-50 p-4 text-sm text-red-700">{query.error.message}</div>
      ) : (
        <div className="w-full">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-surface-2/80 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Order ID</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
                <th className="px-4 py-3 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayOrders.map((order) => {
                let statusStyle = "bg-surface-2 text-muted-foreground border-border"
                if (order.status === "Delivered") statusStyle = "bg-brand-100 text-brand-900 border-brand-300"
                else if (order.status === "Processing") statusStyle = "bg-brand-50 text-brand-800 border-brand-100"
                else if (order.status === "Shipped") statusStyle = "bg-orange-50 text-orange-700 border-orange-200"
                else if (order.status === "Cancelled") statusStyle = "bg-red-50 text-red-700 border-red-200"
                else if (order.status === "Confirmed") statusStyle = "bg-brand-50 text-brand-700 border-brand-100"

                return (
                  <tr key={order.id} className="transition-colors hover:bg-brand-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-brand-50 p-1.5 text-brand-800"><FileText className="w-3 h-3" /></div>
                        <span className="font-semibold text-ink">{order.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{order.customer}</td>
                    <td className="px-4 py-3 text-muted-foreground">{order.date}</td>
                    <td className="px-4 py-3 text-right font-semibold text-ink">{order.amount}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusStyle}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
