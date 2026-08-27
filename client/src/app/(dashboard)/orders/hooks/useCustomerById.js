'use client'
import { useState, useEffect } from 'react'
import apiFetch from '@/services/api/api.service'

const hasAddressContent = (addr = {}) => Boolean(
  addr.addressLine1 || addr.street || addr.city || addr.state || addr.pincode || addr.country
)

const normalizeAddressType = (type) => {
  if (type === 'shippingAddress' || type === 'shipping') return 'Shipping'
  if (type === 'billingAddress' || type === 'billing') return 'Billing'
  return type || 'Address'
}

const normalizeAddresses = (addresses = []) => (
  (Array.isArray(addresses) ? addresses : Object.entries(addresses || {}).map(([type, addr]) => ({ ...addr, type })))
    .filter(hasAddressContent)
    .map((addr, index) => ({
      ...addr,
      _id: addr._id || `${addr.type || 'address'}-${index}`,
      type: normalizeAddressType(addr.type),
    }))
)

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
        const json = await apiFetch(`/api/users/${userId}`)
        // API returns { success: true, data: { user: {...}, order: [...] } }
        // We extract the user object from the data payload
        {
          const user = json.data?.user || json.data
          setCustomer(user ? { ...user, addresses: normalizeAddresses(user.addresses) } : user)
        }
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
