const express = require('express');
const { signIn, refreshAccessToken, logout, login, verifyOTP, sendOTP, resendOTP, verifyCaptcha, responseEmail } = require('./client.auth.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');
const { authLimiter } = require('../../../middlewares/rateLimit.middleware');

const router = express.Router();

router.post('/signin', authLimiter, signIn);
router.post('/login', authLimiter, login);
router.post('/refresh-token', authLimiter, refreshAccessToken);
router.post('/verify-otp', authLimiter, verifyOTP);
router.post('/send-otp', authLimiter, sendOTP);
router.post('/resend-otp', authLimiter, resendOTP);
router.post('/verify-captcha', authLimiter, verifyCaptcha);
router.post('/logout', authenticate, logout);
router.post('/response', authLimiter, responseEmail);

module.exports = router;
