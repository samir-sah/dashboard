const express = require('express');
const { getOrderReports, getRevenueReports, getReportsSummary } = require('./reports.controller');
const { validateOrderPeriod, validateRevenuePeriod, validateDateRange } = require('./reports.validator');
const { authenticateAdmin, authorize } = require('../../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticateAdmin, authorize('Admin'));

router.get('/orders', validateDateRange, validateOrderPeriod, getOrderReports);
router.get('/revenue', validateDateRange, validateRevenuePeriod, getRevenueReports);
router.get('/summary', validateDateRange, getReportsSummary);

module.exports = router;
