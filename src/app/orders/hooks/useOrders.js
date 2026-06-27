import { useState, useEffect, useCallback } from 'react'

const PAGE_SIZE = 7

const normalizeOrderStatus = (status) => {
  if (status === 'Dispatched') return 'Shipped'
  return status || 'Confirmed'
}

function getSortParams(sort) {
  switch (sort) {
    case 'oldest':  return { sortBy: 'orderDate',   sortOrder: 'asc'  }
    case 'highest': return { sortBy: 'totalAmount', sortOrder: 'desc' }
    case 'lowest':  return { sortBy: 'totalAmount', sortOrder: 'asc'  }
    default:        return { sortBy: 'orderDate',   sortOrder: 'desc' }
  }
}

export function useOrders() {
  const [orders,       setOrders]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [search,       setSearch]       = useState('')
  const [sortBy,       setSortBy]       = useState('latest')
  const [statusFilter, setStatusFilter] = useState('All')
  const [currentPage,  setCurrentPage]  = useState(1)
  const [totalPages,   setTotalPages]   = useState(1)
  const [totalOrders,  setTotalOrders]  = useState(0)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const { sortBy: sortField, sortOrder } = getSortParams(sortBy)
      const params = new URLSearchParams({
        page: currentPage, limit: PAGE_SIZE,
        sortBy: sortField, sortOrder,
        ...(statusFilter !== 'All'  && { status: statusFilter }),
        ...(search.trim()           && { search: search.trim() }),
      })
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders?${params}`,
        { headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) } }
      )
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      setTotalPages(data.pages  || 1)
      setTotalOrders(data.total || 0)

      const raw = Array.isArray(data) ? data : data.orders ?? []
      setOrders(raw.map(o => {
        const latestStatus = o.statusHistory?.length
          ? normalizeOrderStatus(o.statusHistory[o.statusHistory.length - 1].status) : 'Confirmed'
        const user = o.userId
        const customerName = user && typeof user === 'object'
          ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Unknown'
          : 'Unknown'
        const date = o.orderDate
          ? new Date(o.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
          : '—'
        return { id: o.orderId || o._id, date, customer: customerName, amount: o.totalAmount ?? 0, status: latestStatus, _raw: o }
      }))
    } catch (err) {
      setError(err.message || 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }, [currentPage, statusFilter, sortBy, search])

  useEffect(() => { void Promise.resolve().then(fetchOrders) }, [fetchOrders])

  const handleSearchChange = (e) => { setSearch(e.target.value);       setCurrentPage(1) }
  const handleSortChange   = (val) => { setSortBy(val);       setCurrentPage(1) }
  const handleStatusChange = (val) => { setStatusFilter(val); setCurrentPage(1) }

  return {
    orders, loading, error, search, sortBy, statusFilter,
    currentPage, totalPages, totalOrders, PAGE_SIZE,
    fetchOrders, setCurrentPage,
    handleSearchChange, handleSortChange, handleStatusChange,
  }
}
