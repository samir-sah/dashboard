'use client'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function PaymentsPagination({ currentPage, totalPages, totalItems, PAGE_SIZE, onPageChange }) {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-surface-2/70">
      <p className="text-sm text-muted-foreground m-0">
        Showing <strong className="text-foreground font-semibold">{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalItems)}</strong> of <strong className="text-foreground font-semibold">{totalItems}</strong> payments
      </p>
      <div className="flex items-center gap-1.5">
        <button 
          onClick={() => onPageChange(p => Math.max(1, p - 1))} 
          disabled={currentPage === 1}
          className={`w-8 h-8 rounded-md flex items-center justify-center border transition-colors ${
            currentPage === 1 
              ? 'bg-surface-2 border-border text-faint cursor-not-allowed' 
              : 'bg-card border-border text-muted-foreground hover:bg-surface-2 cursor-pointer'
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
                : 'bg-card border-border text-muted-foreground hover:bg-surface-2'
            }`}
          >
            {page}
          </button>
        ))}

        <button 
          onClick={() => onPageChange(p => Math.min(totalPages, p + 1))} 
          disabled={currentPage === totalPages}
          className={`w-8 h-8 rounded-md flex items-center justify-center border transition-colors ${
            currentPage === totalPages 
              ? 'bg-surface-2 border-border text-faint cursor-not-allowed' 
              : 'bg-card border-border text-muted-foreground hover:bg-surface-2 cursor-pointer'
          }`}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
