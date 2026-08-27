'use client'
import { useState, useEffect } from 'react'
import apiFetch from '@/services/api/api.service'

export function useOrderById(id) {
  const [order,   setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!id) return
    const fetchOrder = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiFetch(`/api/orders/${id}`)
        setOrder(data.order ?? data.data ?? data)
      } catch (err) {
        setError(err.message || 'Failed to fetch order')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  return { order, loading, error }
}
