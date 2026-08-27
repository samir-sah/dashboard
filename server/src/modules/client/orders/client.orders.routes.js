const express = require('express');
const { addOrder, getUserOrderHistory, checkoutOrder, getUsersOrderById } = require('./client.orders.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');

const router = express.Router();

router.post('/addorder', authenticate, addOrder);
router.post('/checkout-order', authenticate, checkoutOrder);
router.get('/history/:id/orders', authenticate, getUserOrderHistory);
router.get('/history/:id/orders/:orderId', authenticate, getUsersOrderById);

module.exports = router;
