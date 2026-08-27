import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function OrdersPagination({ currentPage, totalPages, totalOrders, PAGE_SIZE, onPageChange }) {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid #f3f4f6', backgroundColor: '#fafafa' }}>
      <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
        Showing <strong style={{ color: '#374151' }}>{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalOrders)}</strong> of <strong style={{ color: '#374151' }}>{totalOrders}</strong> orders
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button onClick={() => onPageChange(p => Math.max(1, p - 1))} disabled={currentPage === 1}
          style={{ width: '32px', height: '32px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: currentPage === 1 ? '#f9fafb' : '#ffffff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentPage === 1 ? '#d1d5db' : '#374151' }}>
          <ChevronLeft size={15} />
        </button>
        {pageNumbers.map(page => (
          <button key={page} onClick={() => onPageChange(page)}
            style={{ width: '32px', height: '32px', border: page === currentPage ? '1px solid #4f46e5' : '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: page === currentPage ? '#4f46e5' : '#ffffff', color: page === currentPage ? '#ffffff' : '#374151', fontSize: '13px', fontWeight: page === currentPage ? '600' : '400', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
            {page}
          </button>
        ))}
        <button onClick={() => onPageChange(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
          style={{ width: '32px', height: '32px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: currentPage === totalPages ? '#f9fafb' : '#ffffff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentPage === totalPages ? '#d1d5db' : '#374151' }}>
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}