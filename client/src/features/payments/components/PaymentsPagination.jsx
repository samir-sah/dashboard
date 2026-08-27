'use client'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function PaymentsPagination({ currentPage, totalPages, totalItems, PAGE_SIZE, onPageChange }) {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
      <p className="text-sm text-gray-500 m-0">
        Showing <strong className="text-gray-700 font-semibold">{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalItems)}</strong> of <strong className="text-gray-700 font-semibold">{totalItems}</strong> payments
      </p>
      <div className="flex items-center gap-1.5">
        <button 
          onClick={() => onPageChange(p => Math.max(1, p - 1))} 
          disabled={currentPage === 1}
          className={`w-8 h-8 rounded-md flex items-center justify-center border transition-colors ${
            currentPage === 1 
              ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' 
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer'
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
                ? 'bg-indigo-600 border-indigo-600 text-white' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
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
              ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' 
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer'
          }`}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
