'use client'

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"

export default function CustomerOrders({ orders, loading }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return "text-emerald-700 bg-emerald-100";
      case "Processing": return "text-amber-700 bg-amber-100";
      case "Cancelled": return "text-rose-700 bg-rose-100";
      default: return "text-gray-700 bg-gray-100";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-gray-500 animate-pulse">
        Loading recent orders...
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-gray-500">
        No orders found for this customer.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold text-gray-600">Order ID</TableHead>
            <TableHead className="font-semibold text-gray-600 text-center">Date</TableHead>
            <TableHead className="font-semibold text-gray-600 text-center">Amount</TableHead>
            <TableHead className="font-semibold text-gray-600 text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="hover:bg-gray-50/50">
              <TableCell className="p-4 font-medium text-gray-900">{order.id}</TableCell>
              <TableCell className="p-4 text-gray-600 text-sm text-center">{formatDate(order.date)}</TableCell>
              <TableCell className="p-4 font-medium text-gray-900 text-center">₹{order.amount.toLocaleString()}</TableCell>
              <TableCell className="p-4 text-center">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
