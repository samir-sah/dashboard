const paymentService = require('../../../shared/payments/payment.service');

const createRazorpayOrder = async (req, res, next) => {
    try {
        const data = await paymentService.createRazorpayOrder(req.body.orderId);
        return res.status(201).json({
            success: true,
            message: 'Razorpay order created successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
};

const verifyPayment = async (req, res, next) => {
    try {
        const data = await paymentService.verifyPayment(req.body);
        return res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
};

const handleWebhook = async (req, res, next) => {
    try {
        const data = await paymentService.handleWebhook(
            req.body,
            req.headers['x-razorpay-signature']
        );

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createRazorpayOrder,
    verifyPayment,
    handleWebhook,
};
