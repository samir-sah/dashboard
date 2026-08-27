const express = require('express');
const { sendOTP, verifyAndLogin, refreshAccessToken, resendOTP, logout, demoLogin } = require('./admin.auth.controller');
const { authLimiter } = require('../../../middlewares/rateLimit.middleware');

const router = express.Router();

router.post('/send-otp', authLimiter, sendOTP);
router.post('/verify-login', authLimiter, verifyAndLogin);
router.post('/refresh-token', authLimiter, refreshAccessToken);
router.post('/logout', logout);
router.post('/demo-login', demoLogin);
// resendOTP wasn't mounted in the original route file, but it existed in the controller.
// We'll leave it unmounted to preserve exact existing API paths.

module.exports = router;
