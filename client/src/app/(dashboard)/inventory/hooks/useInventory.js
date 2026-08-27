import { useState, useEffect, useCallback } from 'react';
import apiFetch from '@/services/api/api.service';

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
      const data = await apiFetch(`/api/inventory/product/dashboard?days=${days}`);
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
