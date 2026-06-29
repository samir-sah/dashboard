'use client'
import { useState, useEffect } from 'react'

export function useCustomerById(userId) {
  const [customer, setCustomer] = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    if (!userId) return
    const fetchCustomer = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`,
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
        const json = await res.json()
        // API returns { success: true, data: { user: {...}, order: [...] } }
        // We extract the user object from the data payload
        setCustomer(json.data?.user || json.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchCustomer()
  }, [userId])

  return { customer, loading, error }
}
