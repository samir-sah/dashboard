import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboardService";

const useDashboardQuery = (key, queryFn, params = {}) => useQuery({
  queryKey: ["dashboard", key, params],
  queryFn: () => queryFn(params),
});

export const useDashboardKPIs = (params) => useDashboardQuery("kpis", dashboardService.getKPIs, params);
export const useDashboardInsightKPIs = (params) => useDashboardQuery("insight-kpis", dashboardService.getInsightKPIs, params);
export const useDashboardOrderStatus = (params) => useDashboardQuery("order-status", dashboardService.getOrderStatus, params);
export const useDashboardOrdersVsUnits = (params) => useDashboardQuery("orders-vs-units", dashboardService.getOrdersVsUnits, params);
export const useDashboardCustomerGrowth = (params) => useDashboardQuery("customer-growth", dashboardService.getCustomerGrowth, params);
export const useDashboardRevenueForecast = (params) => useDashboardQuery("revenue-forecast", dashboardService.getRevenueForecast, params);
export const useDashboardCustomerStats = (params) => useDashboardQuery("customer-stats", dashboardService.getCustomerStats, params);
export const useDashboardBusinessGrowth = (params) => useDashboardQuery("business-growth", dashboardService.getBusinessGrowth, params);
export const useDashboardLowStockProducts = (params) => useDashboardQuery("low-stock-products", dashboardService.getLowStockProducts, params);
export const useDashboardStateOrders = (params) => useDashboardQuery("state-orders", dashboardService.getStateOrders, params);
export const useDashboardGenderOrders = (params) => useDashboardQuery("gender-orders", dashboardService.getGenderOrders, params);

export const useDashboardRecentOrders = () => useQuery({
  queryKey: ["dashboard", "recent-orders"],
  queryFn: dashboardService.getRecentOrders,
});
