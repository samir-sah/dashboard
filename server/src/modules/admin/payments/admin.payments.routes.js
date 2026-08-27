const express = require('express');
const {
    getPayments,
    getPaymentStats,
    getPaymentById,
    getPaymentHistoryByOrder,
    getPaymentHistoryByUser,
    refundPayment,
} = require('./admin.payments.controller');
const { authenticateAdmin, authorize } = require('../../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticateAdmin, authorize('Admin'));

router.get('/', getPayments);
router.get('/stats', getPaymentStats);
router.get('/history/order/:orderId', getPaymentHistoryByOrder);
router.get('/history/user/:userId', getPaymentHistoryByUser);
router.post('/:id/refund', refundPayment);
router.get('/:id', getPaymentById);

module.exports = router;
