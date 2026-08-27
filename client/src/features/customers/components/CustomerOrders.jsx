'use client'

import Link from 'next/link'

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
      case "Delivered": return "text-brand-800 bg-brand-100";
      case "Processing": return "text-amber-700 bg-amber-100";
      case "Cancelled": return "text-rose-700 bg-rose-100";
      default: return "text-foreground bg-surface-elevated";
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
      <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
        Loading recent orders...
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        No orders found for this customer.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader className="bg-surface-2">
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold text-muted-foreground">Order ID</TableHead>
            <TableHead className="font-semibold text-muted-foreground text-center">Date</TableHead>
            <TableHead className="font-semibold text-muted-foreground text-center">Amount</TableHead>
            <TableHead className="font-semibold text-muted-foreground text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="hover:bg-surface-2/70">
              <TableCell className="p-4 font-medium">
                <Link href={`/orders/${order.id}`} className="text-brand-700 hover:text-brand-900 transition-colors">
                  {order.id}
                </Link>
              </TableCell>
              <TableCell className="p-4 text-muted-foreground text-sm text-center">{formatDate(order.date)}</TableCell>
              <TableCell className="p-4 font-medium text-ink text-center">₹{order.amount.toLocaleString()}</TableCell>
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
