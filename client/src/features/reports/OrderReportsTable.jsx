import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/Skeleton';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const PERIOD_LABELS = {
  daily: 'Date',
  weekly: 'Week',
  monthly: 'Month',
};

const SKELETON_ROWS = 5;

export default function OrderReportsTable({
  data = [],
  loading = false,
  error = null,
  period = 'daily',
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
}) {
  const periodKey = period === 'daily' ? 'date' : period === 'weekly' ? 'week' : 'month';
  const periodLabel = PERIOD_LABELS[period] || 'Period';

  if (loading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{periodLabel}</TableHead>
            <TableHead className="text-right">Orders</TableHead>
            <TableHead className="text-right">Shipped</TableHead>
            <TableHead className="text-right">Delivered</TableHead>
            <TableHead className="text-right">Cancelled</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 5 }).map((_, j) => (
                <TableCell key={j} className={j > 0 ? 'text-right' : ''}>
                  <Skeleton className="h-4 w-16 inline-block" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm font-medium">Failed to load order reports</p>
        <p className="text-xs">{error}</p>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <p className="text-sm">No report data available</p>
      </div>
    );
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2));

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{periodLabel}</TableHead>
            <TableHead className="text-right">Orders</TableHead>
            <TableHead className="text-right">Shipped</TableHead>
            <TableHead className="text-right">Delivered</TableHead>
            <TableHead className="text-right">Cancelled</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row[periodKey]}>
              <TableCell className="font-medium text-primary">{row[periodKey]}</TableCell>
              <TableCell className="text-right">{row.orders.toLocaleString('en-IN')}</TableCell>
              <TableCell className="text-right">{(row.shipped ?? row.dispatched ?? 0).toLocaleString('en-IN')}</TableCell>
              <TableCell className="text-right">{row.delivered.toLocaleString('en-IN')}</TableCell>
              <TableCell className="text-right text-destructive font-medium">{row.cancelled.toLocaleString('en-IN')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing <strong className="text-foreground font-semibold">{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalItems)}</strong> of <strong className="text-foreground font-semibold">{totalItems}</strong>
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`w-8 h-8 rounded-md flex items-center justify-center border transition-colors ${
                currentPage === 1
                  ? 'bg-muted border-border text-muted-foreground cursor-not-allowed'
                  : 'bg-background border-border text-foreground hover:bg-muted cursor-pointer'
              }`}
            >
              <ChevronLeft size={16} />
            </button>

            {pageNumbers.map(page => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 rounded-md text-sm font-medium transition-colors border ${
                  page === currentPage
                    ? 'bg-brand-700 border-brand-700 text-white'
                    : 'bg-background border-border text-foreground hover:bg-muted'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`w-8 h-8 rounded-md flex items-center justify-center border transition-colors ${
                currentPage === totalPages
                  ? 'bg-muted border-border text-muted-foreground cursor-not-allowed'
                  : 'bg-background border-border text-foreground hover:bg-muted cursor-pointer'
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
