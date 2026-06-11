'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCustomerById, getCustomerOrders } from "@/features/customers/services/customerService"
import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'
import CustomerProfile from "@/features/customers/components/CustomerProfile"

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id;

  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        setLoading(true);
        const data = await getCustomerById(customerId);
        setCustomer(data);
      } catch (err) {
        console.error(err);
        setError("Customer not found.");
      } finally {
        setLoading(false);
      }
    };

    const loadOrders = async () => {
      try {
        setLoadingOrders(true);
        const data = await getCustomerOrders(customerId);
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOrders(false);
      }
    };

    if (customerId) {
      loadCustomer();
      loadOrders();
    }
  }, [customerId]);

  if (loading) {
    return (
      <div style={{ maxWidth: '1400px' }} className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading customer profile...</div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div style={{ maxWidth: '1400px' }} className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground mb-4">{error || "Something went wrong."}</p>
        <Button variant="outline" onClick={() => router.push('/customers')} className="gap-2">
          <ArrowLeft className="size-4" /> Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px' }}>
      <div className="mb-6">
        <div className="flex items-center gap-4 mt-2">
          <Button variant="ghost" size="icon" onClick={() => router.push('/customers')}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Customer Profile</h1>
            <p className="text-sm text-muted-foreground mt-1">ID: {customer.id}</p>
          </div>
        </div>
      </div>

      <CustomerProfile 
        customer={customer} 
        orders={orders} 
        loadingOrders={loadingOrders} 
      />
    </div>
  )
}
