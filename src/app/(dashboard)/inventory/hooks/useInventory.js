import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to fetch multi-product inventory dashboard data.
 */
export function useInventory() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [period, setPeriod] = useState(30); // Default to 30 days
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch product list
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:4400/api/inventory/products', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
      
      // Auto-select the first product if none selected
      if (data.length > 0 && !selectedProductId) {
        setSelectedProductId(data[0]._id);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [selectedProductId]);

  // Fetch dashboard data for the selected product and period
  const fetchDashboardData = useCallback(async (productId, days) => {
    if (!productId) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:4400/api/inventory/products/${productId}/dashboard?days=${days}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchProducts);
  }, [fetchProducts]);

  useEffect(() => {
    if (selectedProductId) {
      void Promise.resolve().then(() => fetchDashboardData(selectedProductId, period));
    }
  }, [selectedProductId, period, fetchDashboardData]);

  return {
    products,
    selectedProductId,
    setSelectedProductId,
    period,
    setPeriod,
    dashboardData,
    loading,
    error,
    refetch: () => {
      fetchProducts();
      if (selectedProductId) fetchDashboardData(selectedProductId, period);
    }
  };
}
