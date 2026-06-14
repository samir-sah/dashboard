'use client'

import { Search, RefreshCw, ChevronDown } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const sortOptions = [
  { value: 'latest',  label: 'Latest First'   },
  { value: 'oldest',  label: 'Oldest First'   },
  { value: 'highest', label: 'Highest Amount' },
  { value: 'lowest',  label: 'Lowest Amount'  },
]

const statusOptions = ['All', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

const getStatusColor = (status) => {
  switch (status) {
    case 'Confirmed': return 'bg-slate-400'
    case 'Processing': return 'bg-indigo-500'
    case 'Shipped': return 'bg-amber-500'
    case 'Delivered': return 'bg-emerald-500'
    case 'Cancelled': return 'bg-red-500'
    default: return 'bg-transparent'
  }
}

export default function OrdersTableControls({
  search, sortBy, statusFilter, loading,
  onSearch, onSort, onStatus, onRefresh,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {/* ── Search ── */}
      <div className="relative flex-1 min-w-[200px]">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search size={15} className="text-muted-foreground" />
        </div>
        <input
          type="text"
          value={search}
          onChange={onSearch}
          placeholder="Search by Order ID"
          className={cn(
            "h-10 w-full rounded-xl border border-border bg-background pl-9 pr-4 text-[13.5px] text-foreground shadow-xs transition-all",
            "outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-500/10",
            "placeholder:text-muted-foreground"
          )}
        />
      </div>

      {/* ── Sort By ── */}
      <div className="relative min-w-[160px]">
        <span className="absolute -top-1.5 left-3 px-1 bg-background text-[9px] font-bold uppercase tracking-wider text-muted-foreground z-10 pointer-events-none">
          Sort By
        </span>
        <Select value={sortBy} onValueChange={onSort}>
          <SelectTrigger className="h-10 text-[13.5px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(o => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Status Filter ── */}
      <div className="relative min-w-[160px]">
        <span className="absolute -top-1.5 left-3 px-1 bg-background text-[9px] font-bold uppercase tracking-wider text-muted-foreground z-10 pointer-events-none">
          Status
        </span>
        <Select value={statusFilter} onValueChange={onStatus}>
          <SelectTrigger className="h-10 text-[13.5px]">
            <SelectValue placeholder="Status Filter">
              <div className="flex items-center gap-2">
                {statusFilter !== 'All' && (
                  <span className={cn("w-2 h-2 rounded-full", getStatusColor(statusFilter))} />
                )}
                {statusFilter === 'All' ? 'All Statuses' : statusFilter}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(s => (
              <SelectItem key={s} value={s}>
                <div className="flex items-center gap-2">
                  {s !== 'All' && <span className={cn("w-2 h-2 rounded-full", getStatusColor(s))} />}
                  {s === 'All' ? 'All Statuses' : s}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Refresh ── */}
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 shrink-0 rounded-xl shadow-xs text-muted-foreground hover:text-foreground"
        onClick={onRefresh}
        disabled={loading}
        title="Refresh"
      >
        <RefreshCw size={15} className={cn(loading && "animate-spin")} />
      </Button>
    </div>
  )
}