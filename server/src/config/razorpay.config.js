const Razorpay = require('razorpay');
const ApiError = require('../utils/ApiError');

const requireEnv = (name) => {
    const value = process.env[name];
    if (!value) {
        throw ApiError.internal(`${name} is not configured`);
    }
    return value;
};

const getRazorpayClient = () => {
    const keyId = requireEnv('RAZORPAY_KEY_ID');
    const keySecret = requireEnv('RAZORPAY_KEY_SECRET');

    return new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });
};

const getRazorpayKeys = () => ({
    keyId: requireEnv('RAZORPAY_KEY_ID'),
    keySecret: requireEnv('RAZORPAY_KEY_SECRET'),
});

const getWebhookSecret = () => requireEnv('RAZORPAY_WEBHOOK_SECRET');

module.exports = {
    getRazorpayClient,
    getRazorpayKeys,
    getWebhookSecret,
};
