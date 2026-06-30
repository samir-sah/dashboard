import { useState, useEffect, useCallback } from 'react';

export function useInventory() {
  const [product, setProduct] = useState(null);
  const [period, setPeriod] = useState(30); // Default to 30 days
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async (days) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:4400/api/inventory/product/dashboard?days=${days}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const data = await res.json();
      setProduct(data.product || null);
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
      setProduct(null);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(() => fetchDashboardData(period));
  }, [period, fetchDashboardData]);

  return {
    product,
    period,
    setPeriod,
    dashboardData,
    loading,
    error,
    refetch: () => {
      fetchDashboardData(period);
    }
  };
}
