const paymentService = require('../../../shared/payments/payment.service');

const getPayments = async (req, res, next) => {
    try {
        const data = await paymentService.getPayments(req.query);
        return res.status(200).json({
            success: true,
            ...data,
            data: data.payments,
        });
    } catch (error) {
        next(error);
    }
};

const getPaymentStats = async (req, res, next) => {
    try {
        const data = await paymentService.getPaymentStats();
        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

const getPaymentById = async (req, res, next) => {
    try {
        const data = await paymentService.getPaymentById(req.params.id);
        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

const getPaymentHistoryByOrder = async (req, res, next) => {
    try {
        const data = await paymentService.getPaymentHistoryByOrder(req.params.orderId);
        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

const getPaymentHistoryByUser = async (req, res, next) => {
    try {
        const data = await paymentService.getPaymentHistoryByUser(req.params.userId);
        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

const refundPayment = async (req, res, next) => {
    try {
        const data = await paymentService.refundPayment(req.params.id, req.body);
        return res.status(200).json({
            success: true,
            message: 'Refund initiated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPayments,
    getPaymentStats,
    getPaymentById,
    getPaymentHistoryByOrder,
    getPaymentHistoryByUser,
    refundPayment,
};
