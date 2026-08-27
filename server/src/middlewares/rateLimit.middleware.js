const rateLimit = require('express-rate-limit');

const buildLimiter = ({ windowMs, max, message }) => rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message,
    },
});

const authLimiter = buildLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many authentication attempts. Please try again later.',
});

const paymentLimiter = buildLimiter({
    windowMs: 10 * 60 * 1000,
    max: 30,
    message: 'Too many payment attempts. Please try again later.',
});

module.exports = {
    authLimiter,
    paymentLimiter,
};
