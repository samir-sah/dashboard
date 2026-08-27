const express = require('express');
const {
    getdashboardKpis,
    getdashboardCharts,
    getKpis,
    getInsightKpis,
    getOrderStatus,
    getOrdersVsUnits,
    getCustomerGrowth,
    getRevenueForecast,
    getCustomerStats,
    getBusinessGrowth,
    getLowStockProducts,
    getStateOrders,
    getGenderOrders,
} = require('./admin.dashboard.controller');
const { authenticateAdmin, authorize } = require('../../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticateAdmin, authorize('Admin'));

router.get('/summary', getdashboardKpis);
router.get('/charts', getdashboardCharts);
router.get('/kpis', getKpis);
router.get('/insight-kpis', getInsightKpis);
router.get('/order-status', getOrderStatus);
router.get('/orders-vs-units', getOrdersVsUnits);
router.get('/customer-growth', getCustomerGrowth);
router.get('/revenue-forecast', getRevenueForecast);
router.get('/customer-stats', getCustomerStats);
router.get('/business-growth', getBusinessGrowth);
router.get('/low-stock-products', getLowStockProducts);
router.get('/state-orders', getStateOrders);
router.get('/gender-orders', getGenderOrders);

module.exports = router;
