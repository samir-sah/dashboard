'use client'
import { useState, useEffect } from 'react'

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
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}`,
          {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.message || `Error ${res.status}`)
        }
        const data = await res.json()
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
