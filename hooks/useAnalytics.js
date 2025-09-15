import { useState, useEffect, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || 'a81106b0-256d-478e-a528-e049103b404d';

export const useAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = {
        'x-tenant-id': TENANT_ID,
        'Content-Type': 'application/json',
      };

      const [dashboard, customers, trends] = await Promise.all([
        fetch(`${API_BASE}/api/analytics/dashboard`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/api/analytics/top-customers`, { headers }).then(r => r.json()),
        fetch(`${API_BASE}/api/analytics/revenue-trends`, { headers }).then(r => r.json())
      ]);

      setData({
        dashboard: dashboard.data,
        customers: customers.data,
        trends: trends.data
      });
    } catch (err) {
      setError(err.message);
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerSync = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/sync/trigger`, {
        method: 'POST',
        headers: {
          'x-tenant-id': TENANT_ID,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        await fetchData(); // Refresh data after sync
        return { success: true };
      }
    } catch (err) {
      console.error('Sync error:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    triggerSync
  };
};