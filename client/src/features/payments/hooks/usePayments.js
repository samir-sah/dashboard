'use client'
import { useState, useEffect, useCallback } from 'react'
import { paymentService } from '@/features/payments/services'

export function usePayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const PAGE_SIZE = 10

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const res = await paymentService.getPayments({
        page: currentPage,
        limit: PAGE_SIZE,
        search,
        status: statusFilter
      })

      if (res.success) {
        setPayments(res.data)
        setTotalPages(res.pages || 1)
        setTotalItems(res.total || res.data.length)
      } else {
        setError(res.message || 'Failed to fetch payments')
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [currentPage, search, statusFilter])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value)
    setCurrentPage(1)
  }

  return {
    payments,
    loading,
    error,
    search,
    statusFilter,
    currentPage,
    totalPages,
    totalItems,
    PAGE_SIZE,
    fetchPayments,
    setCurrentPage,
    handleSearchChange,
    handleStatusChange
  }
}
