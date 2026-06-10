'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
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

export default function CustomerTable({ customers, loading }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredCustomers = useMemo(() => {
    let result = customers;
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(lower) || 
        c.email.toLowerCase().includes(lower) || 
        c.phone.includes(searchQuery)
      );
    }
    if (statusFilter !== "All") {
      result = result.filter(c => c.status === statusFilter);
    }
    return result;
  }, [customers, searchQuery, statusFilter]);

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
      case "Active": return "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-transparent";
      case "Inactive": return "bg-rose-100 text-rose-700 hover:bg-rose-200 border-transparent";
      case "New": return "bg-purple-100 text-purple-700 hover:bg-purple-200 border-transparent";
      default: return "bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="relative w-full sm:w-80 flex items-center">
          <Search size={16} className="absolute left-3 text-muted-foreground" />
          <Input 
            className="pl-9 h-10" 
            placeholder="Search customers..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10">
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
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  No customers found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
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
                    {customer.gender}
                  </TableCell>
                  <TableCell className="p-4 text-center">
                    <Badge className={getCustomBadgeStyle(customer.status)} variant={getStatusBadgeVariant(customer.status)}>
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-4 font-medium text-muted-foreground text-center">
                    {customer.totalOrders}
                  </TableCell>
                  <TableCell className="p-4 font-medium text-foreground text-center">
                    ₹{customer.totalSpend.toLocaleString()}
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

      {/* Pagination UI - Mocked */}
      <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing <span className="font-medium text-foreground">1</span> to <span className="font-medium text-foreground">{filteredCustomers.length}</span> of <span className="font-medium text-foreground">{filteredCustomers.length}</span> results
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" disabled>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="default" size="icon" className="w-8">
            1
          </Button>
          <Button variant="outline" size="icon" disabled>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
