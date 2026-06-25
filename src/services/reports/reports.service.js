import apiFetch from '@/services/api/api.service';
import { API_CONFIG } from '@/config/api.config';

export const reportsService = {
  /**
   * Fetch order reports grouped by period.
   * @param {'daily'|'weekly'|'monthly'} period
   * @param {number} [page=1]
   * @param {number} [limit=10]
   * @returns {{ data: Array, total: number, page: number, pages: number }}
   */
  getOrderReports: async (period = 'daily', page = 1, limit = 10) => {
    const res = await apiFetch(API_CONFIG.endpoints.orderReports(period, page, limit));
    return {
      data: res.data || [],
      total: res.total || 0,
      page: res.page || 1,
      pages: res.pages || 1,
    };
  },

  /**
   * Fetch revenue reports grouped by period.
   * @param {'monthly'|'quarterly'|'yearly'} period
   * @param {number} [page=1]
   * @param {number} [limit=10]
   * @returns {{ data: Array, total: number, page: number, pages: number }}
   */
  getRevenueReports: async (period = 'monthly', page = 1, limit = 10) => {
    const res = await apiFetch(API_CONFIG.endpoints.revenueReports(period, page, limit));
    return {
      data: res.data || [],
      total: res.total || 0,
      page: res.page || 1,
      pages: res.pages || 1,
    };
  },

  /**
   * Fetch ALL order reports (no pagination) for export.
   * Uses a high limit to retrieve all grouped results in one call.
   */
  getAllOrderReports: async (period = 'daily') => {
    const res = await apiFetch(API_CONFIG.endpoints.orderReports(period, 1, 1000));
    return res.data || [];
  },

  /**
   * Fetch ALL revenue reports (no pagination) for export.
   */
  getAllRevenueReports: async (period = 'monthly') => {
    const res = await apiFetch(API_CONFIG.endpoints.revenueReports(period, 1, 1000));
    return res.data || [];
  },
};
