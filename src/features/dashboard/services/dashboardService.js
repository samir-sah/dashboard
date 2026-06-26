import apiFetch from "@/services/api/api.service";
import { API_CONFIG } from "@/config/api.config";

const withParams = (endpoint, params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
  const query = new URLSearchParams(cleanParams).toString();
  return query ? `${endpoint}?${query}` : endpoint;
};

const getData = async (endpoint, params) => {
  const response = await apiFetch(withParams(endpoint, params));
  return response.data;
};

export const dashboardService = {
  getKPIs: (params) => getData(API_CONFIG.endpoints.dashboardKPIs, params),
  getInsightKPIs: (params) => getData(API_CONFIG.endpoints.dashboardInsightKPIs, params),
  getOrderStatus: (params) => getData(API_CONFIG.endpoints.dashboardOrderStatus, params),
  getOrdersVsUnits: (params) => getData(API_CONFIG.endpoints.dashboardOrdersVsUnits, params),
  getCustomerGrowth: (params) => getData(API_CONFIG.endpoints.dashboardCustomerGrowth, params),
  getRevenueForecast: (params) => getData(API_CONFIG.endpoints.dashboardRevenueForecast, params),
  getCustomerStats: (params) => getData(API_CONFIG.endpoints.dashboardCustomerStats, params),
  getBusinessGrowth: (params) => getData(API_CONFIG.endpoints.dashboardBusinessGrowth, params),
  getLowStockProducts: (params) => getData(API_CONFIG.endpoints.dashboardLowStockProducts, params),
  getStateOrders: (params) => getData(API_CONFIG.endpoints.dashboardStateOrders, params),
  getGenderOrders: (params) => getData(API_CONFIG.endpoints.dashboardGenderOrders, params),
  getRecentOrders: () => apiFetch(withParams(API_CONFIG.endpoints.orders, {
    page: 1,
    limit: 5,
    sortBy: "orderDate",
    sortOrder: "desc",
  })),
};
