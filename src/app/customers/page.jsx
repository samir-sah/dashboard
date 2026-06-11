'use client'

import { useState, useEffect, useCallback } from 'react'
import { getCustomers, getCustomerStats } from "@/features/customers/services/customerService"
import CustomerStats from "@/features/customers/components/CustomerStats"
import CustomerTable from "@/features/customers/components/CustomerTable"

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Table State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Load stats once on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await getCustomerStats();
        setStats(statsData);
      } catch (error) {
        console.error("Failed to load customer stats:", error);
      }
    };
    loadStats();
  }, []);

  // Fetch customers with debounce
  useEffect(() => {
    const handler = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await getCustomers({
          page: currentPage,
          limit: 7,
          search: searchQuery,
          status: statusFilter
        });
        setCustomers(data.customers);
        setTotalPages(data.pages);
        setTotalCustomers(data.total);
      } catch (error) {
        console.error("Failed to load customers:", error);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [currentPage, searchQuery, statusFilter]);

  // Reset page when search or filter changes
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  return (
    <div style={{ maxWidth: '1400px' }}>
      <CustomerStats stats={stats} />
      
      <div style={{ marginTop: '20px' }}>
        <CustomerTable 
          customers={customers} 
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCustomers={totalCustomers}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onPageChange={setCurrentPage}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  )
}
