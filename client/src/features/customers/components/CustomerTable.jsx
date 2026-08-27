'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { Eye, Search, ChevronLeft, ChevronRight } from "lucide-react"

export default function CustomerTable({ 
  customers, 
  loading,
  currentPage,
  totalPages,
  totalCustomers,
  searchQuery,
  statusFilter,
  onPageChange,
  onSearchChange,
  onStatusChange
}) {
  const router = useRouter();



  const handleRowClick = (id) => {
    router.push(`/customers/${id}`);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Active": return "default"; // or custom color classes if badge variant doesn't fit
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

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-border flex flex-wrap items-center gap-4 justify-between bg-card">
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search size={15} className="text-muted-foreground" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search customers..."
            className={cn(
              "h-10 w-full rounded-xl border border-border bg-background pl-9 pr-4 text-[13.5px] text-foreground shadow-xs transition-all",
              "outline-none focus:border-brand-300 focus:ring-3 focus:ring-ring/30",
              "placeholder:text-muted-foreground"
            )}
          />
        </div>
        <div className="relative min-w-[160px] sm:w-48">
          <span className="absolute -top-1.5 left-3 px-1 bg-card text-[9px] font-bold uppercase  text-muted-foreground z-10 pointer-events-none">
            Status
          </span>
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="h-10 text-[13.5px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="New">New</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-semibold text-left pl-4">Customer</TableHead>
              <TableHead className="font-semibold text-center">City</TableHead>
              <TableHead className="font-semibold text-center">Gender</TableHead>
              <TableHead className="font-semibold text-center">Status</TableHead>
              <TableHead className="font-semibold text-center">Orders</TableHead>
              <TableHead className="font-semibold text-center">Total Spend</TableHead>
              <TableHead className="font-semibold text-center">Last Order</TableHead>
              <TableHead className="font-semibold text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="p-4"><div className="h-10 bg-muted animate-pulse rounded-md w-48"></div></TableCell>
                  <TableCell className="p-4"><div className="h-6 bg-muted animate-pulse rounded-full w-16"></div></TableCell>
                  <TableCell className="p-4"><div className="h-4 bg-muted animate-pulse rounded w-10"></div></TableCell>
                  <TableCell className="p-4"><div className="h-4 bg-muted animate-pulse rounded w-20"></div></TableCell>
                  <TableCell className="p-4"><div className="h-4 bg-muted animate-pulse rounded w-24"></div></TableCell>
                  <TableCell className="p-4 text-right"><div className="h-8 bg-muted animate-pulse rounded-md w-8 ml-auto"></div></TableCell>
                </TableRow>
              ))
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  No customers found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow 
                  key={customer.id} 
                  className="cursor-pointer group"
                  onClick={() => handleRowClick(customer.id)}
                >
                  <TableCell className="p-4 text-left">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{customer.name}</span>
                      <span className="text-xs text-muted-foreground mt-0.5">{customer.email}</span>
                      <span className="text-xs text-muted-foreground/70">{customer.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="p-4 text-sm text-muted-foreground text-center">
                    {customer.city}
                  </TableCell>
                  <TableCell className="p-4 text-sm text-muted-foreground text-center">
                    {customer.gender || '—'}
                  </TableCell>
                  <TableCell className="p-4 text-center">
                    <Badge className={getCustomBadgeStyle(customer.status)} variant={getStatusBadgeVariant(customer.status)}>
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-4 font-medium text-muted-foreground text-center">
                    {customer.totalOrders != null ? customer.totalOrders : 'N/A'}
                  </TableCell>
                  <TableCell className="p-4 font-medium text-foreground text-center">
                    {customer.totalSpend != null ? `₹${customer.totalSpend.toLocaleString()}` : 'N/A'}
                  </TableCell>
                  <TableCell className="p-4 text-sm text-muted-foreground text-center">
                    {formatDate(customer.lastOrderDate)}
                  </TableCell>
                  <TableCell className="p-4 text-center">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(customer.id);
                      }}
                    >
                      <Eye className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination UI */}
      {totalCustomers > 0 && (
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing <span className="font-medium text-foreground">{(currentPage - 1) * 7 + 1}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * 7, totalCustomers)}</span> of <span className="font-medium text-foreground">{totalCustomers}</span> results
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="icon" 
              disabled={currentPage === 1}
              onClick={() => onPageChange(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))
              .map(pageNum => (
                <Button 
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "ghost"} 
                  size="icon" 
                  className="w-8 h-8"
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              ))
            }

            <Button 
              variant="outline" 
              size="icon" 
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
