'use client'

import { useState, useEffect } from 'react'
import { getCustomers, getCustomerStats } from "@/features/customers/services/customerService"
import CustomerStats from "@/features/customers/components/CustomerStats"
import CustomerTable from "@/features/customers/components/CustomerTable"
export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [customersData, statsData] = await Promise.all([
          getCustomers(),
          getCustomerStats()
        ]);
        setCustomers(customersData);
        setStats(statsData);
      } catch (error) {
        console.error("Failed to load customers data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full h-full">

      <CustomerStats stats={stats} />
      
      <div className="mt-6">
        <CustomerTable customers={customers} loading={loading} />
      </div>
    </div>
  )
}
