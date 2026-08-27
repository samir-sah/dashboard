'use client'
import { useOrders }            from '@/app/(dashboard)/orders/hooks/useOrders'
import OrdersTableControls      from './OrdersTableControls'
import OrderRow                 from './OrderRow'
import SkeletonRow              from './SkeletonRow'
import OrdersPagination         from './OrdersPagination'

const columns = ['ORDER ID', 'DATE', 'CUSTOMER', 'AMOUNT', 'STATUS', 'ACTIONS']
const PAGE_SIZE = 7

export default function OrdersTable() {
  const {
    orders, loading, error, search, sortBy, statusFilter,
    currentPage, totalPages, totalOrders,
    fetchOrders, setCurrentPage,
    handleSearchChange, handleSortChange, handleStatusChange,
  } = useOrders()

  return (
    <>
      <style>{`
        @keyframes shimmer { 0%{opacity:1} 50%{opacity:0.4} 100%{opacity:1} }
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .order-row:hover   { background-color: #fafafa; }
      `}</style>

      <OrdersTableControls
        search={search} sortBy={sortBy} statusFilter={statusFilter} loading={loading}
        onSearch={handleSearchChange} onSort={handleSortChange}
        onStatus={handleStatusChange} onRefresh={fetchOrders}
      />

      {error && (
        <div style={{ marginBottom: '14px', padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', fontSize: '13.5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>⚠ {error}</span>
          <button onClick={fetchOrders} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: '600', fontSize: '13px', fontFamily: 'inherit' }}>Retry</button>
        </div>
      )}

      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '680px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {columns.map(col => (
                  <th key={col} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#9ca3af', letterSpacing: '0.08em', whiteSpace: 'nowrap', width: col === 'ACTIONS' ? '120px' : 'auto' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonRow key={i} columns={columns} />)}
              {!loading && orders.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                  {error ? 'Could not load orders.' : 'No orders found'}
                </td></tr>
              )}
              {!loading && orders.map((order, idx) => (
                <OrderRow key={order.id} order={order} isLast={idx === orders.length - 1} />
              ))}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 1 && (
          <OrdersPagination
            currentPage={currentPage} totalPages={totalPages}
            totalOrders={totalOrders} PAGE_SIZE={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </>
  )
}