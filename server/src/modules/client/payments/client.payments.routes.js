const express = require('express');
const { authenticate } = require('../../../middlewares/auth.middleware');
const { paymentLimiter } = require('../../../middlewares/rateLimit.middleware');
const {
    createRazorpayOrder,
    verifyPayment,
} = require('./client.payments.controller');

const router = express.Router();

router.post('/create-order', paymentLimiter, authenticate, createRazorpayOrder);
router.post('/verify', paymentLimiter, authenticate, verifyPayment);

module.exports = router;
