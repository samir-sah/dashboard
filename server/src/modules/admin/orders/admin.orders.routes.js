const express = require('express');
const { getOrders, getOrderStats, searchOrder, getOrderById, updateOrder, cancelOrder, updateOrderStatus } = require('./admin.orders.controller');
const { authenticateAdmin, authorize } = require('../../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticateAdmin, authorize('Admin'));

router.get('/stats', getOrderStats);
router.get('/search', searchOrder);
router.put('/cancelorder/:id', cancelOrder);
router.put('/updateorder/:id', updateOrderStatus);

// These will be mounted under /api/orders/ in the final router aggregation
router.get('/', getOrders);
router.get('/:orderId', getOrderById);
router.patch('/:orderId', updateOrder);

module.exports = router;
