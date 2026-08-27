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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm w-full overflow-hidden h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
        <Button asChild variant="outline" size="sm" className="text-xs font-semibold bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900">
          <Link href="/orders">View All</Link>
        </Button>
      </div>

      {query.isLoading ? (
        <div className="p-4 space-y-3">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-9 bg-muted animate-pulse rounded" />)}</div>
      ) : query.error ? (
        <div className="m-4 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">{query.error.message}</div>
      ) : (
        <div className="w-full">
          <table className="w-full text-left text-xs">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 font-bold tracking-wider">Order ID</th>
                <th className="px-4 py-3 font-bold tracking-wider">Customer</th>
                <th className="px-4 py-3 font-bold tracking-wider">Date</th>
                <th className="px-4 py-3 font-bold tracking-wider text-right">Amount</th>
                <th className="px-4 py-3 font-bold tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayOrders.map((order) => {
                let statusStyle = "bg-gray-100 text-gray-600 border-gray-200"
                if (order.status === "Delivered") statusStyle = "bg-green-50 text-green-700 border-green-200"
                else if (order.status === "Processing") statusStyle = "bg-blue-50 text-blue-700 border-blue-200"
                else if (order.status === "Shipped") statusStyle = "bg-orange-50 text-orange-700 border-orange-200"
                else if (order.status === "Cancelled") statusStyle = "bg-red-50 text-red-700 border-red-200"
                else if (order.status === "Confirmed") statusStyle = "bg-purple-50 text-purple-700 border-purple-200"

                return (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-100 rounded-md text-gray-500"><FileText className="w-3 h-3" /></div>
                        <span className="font-bold text-gray-900">{order.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700">{order.customer}</td>
                    <td className="px-4 py-3 text-gray-500">{order.date}</td>
                    <td className="px-4 py-3 font-bold text-gray-900 text-right">{order.amount}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold rounded-full border ${statusStyle}`}>
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
