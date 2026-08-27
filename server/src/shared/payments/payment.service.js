const crypto = require('crypto');
const { resolveCustomerName } = require('../../utils/name.utils');
const orderModel = require('../../models/orders.model');
const paymentModel = require('../../models/payment.model');
const invoiceService = require('../invoices/invoice.service');
const { restoreStock, incrementTotalSold } = require('../inventory/inventory.service');
const logger = require('../../utils/logger');
const ApiError = require('../../utils/ApiError');
const {
    getRazorpayClient,
    getRazorpayKeys,
    getWebhookSecret,
} = require('../../config/razorpay.config');

const CURRENCY = 'INR';

// Map Razorpay's lowercase instrument names to our PAYMENT_METHODS enum.
// Webhook payload: paymentEntity.method → 'upi' | 'card' | 'netbanking' | 'wallet' | 'emi' | 'bank_transfer'
const RAZORPAY_METHOD_MAP = {
    upi: 'UPI',
    card: 'Credit Card',
    netbanking: 'Netbanking',
    wallet: 'Wallet',
    emi: 'Credit Card',
    bank_transfer: 'Netbanking',
};

const mapRazorpayMethod = (rzpMethod, rzpPaymentEntity) => {
    if (!rzpMethod) return null;
    const key = String(rzpMethod).toLowerCase();
    // For 'card', distinguish credit vs debit using card_type from the entity
    if (key === 'card' && rzpPaymentEntity?.card?.type) {
        return rzpPaymentEntity.card.type === 'debit' ? 'Debit Card' : 'Credit Card';
    }
    return RAZORPAY_METHOD_MAP[key] || null;
};

const toPaise = (amount) => Math.round(Number(amount || 0) * 100);

const createSignature = (payload, secret) => crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

const timingSafeEqual = (expected, received) => {
    if (!expected || !received) return false;

    const expectedBuffer = Buffer.from(expected);
    const receivedBuffer = Buffer.from(received);

    if (expectedBuffer.length !== receivedBuffer.length) return false;
    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};

const latestStatusAt = (payment, status) => {
    const item = [...(payment.statusHistory || [])].reverse().find((entry) => entry.status === status);
    return item?.updatedAt || null;
};

const paymentCacheFromRecord = (payment) => ({
    method: payment.method,
    gateway: payment.gateway || 'Razorpay',
    status: payment.status,
    transactionId: payment.razorpayPaymentId || payment.paymentId,
    amount: payment.amount,
    paidAt: payment.status === 'Completed' ? (latestStatusAt(payment, 'Completed') || payment.updatedAt) : undefined,
    failureReason: payment.failureReason || undefined,
    razorpayOrderId: payment.razorpayOrderId || undefined,
    razorpayPaymentId: payment.razorpayPaymentId || undefined,
    razorpaySignature: payment.razorpaySignature || undefined,
});

const syncOrderPaymentState = async (orderId, options = {}) => {
    const latestPayment = await paymentModel
        .findOne({ orderId })
        .session(options.session || null)
        .sort({ createdAt: -1, attemptNumber: -1 })
        .lean();

    if (!latestPayment) {
        await orderModel.findByIdAndUpdate(orderId, { $unset: { payment: '' } }, options);
        return null;
    }

    const paymentCache = paymentCacheFromRecord(latestPayment);
    await orderModel.findByIdAndUpdate(orderId, { $set: { payment: paymentCache } }, options);
    return paymentCache;
};

const appendPaymentStatus = async (payment, status, note = '', extraFields = {}, options = {}) => {
    payment.status = status;
    Object.assign(payment, extraFields);
    payment.statusHistory.push({ status, updatedAt: new Date(), note });
    await payment.save(options);
    await syncOrderPaymentState(payment.orderId, options);
    return payment;
};

const createPaymentAttempt = async ({
    orderId,
    userId,
    amount,
    method,
    status = 'Pending',
    note = 'Payment attempt created',
    razorpayOrderId,
}, options = {}) => {
    const lastAttempt = await paymentModel
        .findOne({ orderId })
        .session(options.session || null)
        .sort({ attemptNumber: -1 })
        .select('attemptNumber')
        .lean();

    const paymentData = {
        orderId,
        userId,
        amount,
        currency: CURRENCY,
        method,
        gateway: 'Razorpay',
        status,
        statusHistory: [{ status, updatedAt: new Date(), note }],
        razorpayOrderId,
        attemptNumber: (lastAttempt?.attemptNumber || 0) + 1,
    };

    let payment;
    try {
        const p = new paymentModel(paymentData);
        payment = await p.save(options);
    } catch (error) {
        if (error.code === 11000 && error.keyPattern?.paymentId) {
            const p = new paymentModel(paymentData);
            payment = await p.save(options);
        } else {
            throw error;
        }
    }

    await syncOrderPaymentState(orderId, options);
    return payment;
};

const getLatestPaymentForOrder = (orderId) => paymentModel
    .findOne({ orderId })
    .sort({ createdAt: -1, attemptNumber: -1 });

const buildPaymentSummary = (payment) => {
    const order = payment.orderId || {};
    const customer = payment.userId || order.userId || {};
    const customerName = resolveCustomerName(customer, order);

    return {
        id: payment.paymentId,
        paymentId: payment.paymentId,
        orderId: order.orderId || payment.orderId,
        orderObjectId: order._id || payment.orderId,
        customer: {
            id: customer._id || payment.userId || null,
            name: customerName || 'Unknown Customer',
            email: customer.email || '',
            phone: customer.phone || '',
        },
        amount: payment.amount || 0,
        currency: payment.currency || CURRENCY,
        method: payment.method || '',
        gateway: payment.gateway || 'Razorpay',
        status: payment.status || 'Pending',
        transactionId: payment.razorpayPaymentId || payment.paymentId,
        paidAt: latestStatusAt(payment, 'Completed'),
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        razorpayOrderId: payment.razorpayOrderId || '',
        razorpayPaymentId: payment.razorpayPaymentId || '',
        failureReason: payment.failureReason || '',
        attemptNumber: payment.attemptNumber,
        refund: payment.refund || null,
        statusHistory: payment.statusHistory || [],
        latestOrderStatus: order.statusHistory?.length
            ? order.statusHistory[order.statusHistory.length - 1].status
            : null,
    };
};

const createRazorpayOrder = async (orderDisplayId) => {
    if (!orderDisplayId) throw ApiError.badRequest('orderId is required');

    const order = await orderModel.findOne({ orderId: orderDisplayId });
    if (!order) throw ApiError.notFound(`Order not found: ${orderDisplayId}`);

    let payment = await getLatestPaymentForOrder(order._id);
    if (payment?.status === 'Completed') {
        throw ApiError.badRequest('Payment is already completed');
    }

    if (!payment || ['Failed', 'Refunded', 'PartiallyRefunded'].includes(payment.status)) {
        const priorMethod = payment?.method;
        if (!priorMethod) {
            throw ApiError.badRequest('Cannot retry payment: no payment instrument on record for this order');
        }
        payment = await createPaymentAttempt({
            orderId: order._id,
            userId: order.userId,
            amount: order.totalAmount,
            method: priorMethod,
            status: 'Pending',
            note: 'Retry payment attempt created',
        });
    }

    const amount = toPaise(payment.amount);
    if (amount <= 0) throw ApiError.badRequest('Order payment amount must be greater than zero');

    const razorpay = getRazorpayClient();
    const { keyId } = getRazorpayKeys();

    const razorpayOrder = await razorpay.orders.create({
        amount,
        currency: payment.currency || CURRENCY,
        receipt: order.orderId,
        notes: {
            orderId: order.orderId,
            mongoOrderId: order._id.toString(),
            paymentId: payment.paymentId,
        },
    });

    await appendPaymentStatus(payment, 'Initiated', 'Razorpay order created', {
        gateway: 'Razorpay',
        razorpayOrderId: razorpayOrder.id,
        failureReason: undefined,
    });

    return {
        orderId: order.orderId,
        paymentId: payment.paymentId,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId,
    };
};

const completePaymentRecord = async (payment, paymentData = {}) => {
    if (payment.status === 'Completed') {
        return { payment, invoice: null, alreadyCompleted: true };
    }

    const mongoose = require('mongoose');
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = await orderModel.findById(payment.orderId).session(session);
        if (order) {
            const latestStatus = order.statusHistory?.length ? order.statusHistory[order.statusHistory.length - 1].status : null;
            if (latestStatus === 'Cancelled') {

                logger.error({
                    orderId: order.orderId,
                    orderObjectId: order._id,
                    paymentId: payment.paymentId,
                    razorpayPaymentId: paymentData.razorpayPaymentId || payment.razorpayPaymentId,
                    razorpayOrderId: payment.razorpayOrderId,
                    amount: payment.amount,
                }, 'PAYMENT_AFTER_CANCELLATION: Payment arrived for an already-cancelled order. Requires manual admin resolution.');

                await orderModel.findByIdAndUpdate(payment.orderId, {
                    $set: {
                        paymentAfterCancellation: true,
                        paymentAfterCancellationDetails: {
                            paymentId: payment.paymentId,
                            razorpayPaymentId: paymentData.razorpayPaymentId || payment.razorpayPaymentId,
                            amount: payment.amount,
                            detectedAt: new Date(),
                        },
                    },
                }, { session });

                await appendPaymentStatus(payment, 'Completed', 'Payment completed but order was already cancelled — flagged for admin review', {
                    razorpayPaymentId: paymentData.razorpayPaymentId || payment.razorpayPaymentId,
                    razorpaySignature: paymentData.razorpaySignature || payment.razorpaySignature,
                }, { session });

                await session.commitTransaction();
                return {
                    payment,
                    invoice: null,
                    invoiceError: null,
                    alreadyCompleted: false,
                    cancelledOrderConflict: true,
                };
            }
        }

        const extraFields = {
            razorpayPaymentId: paymentData.razorpayPaymentId || payment.razorpayPaymentId,
            razorpaySignature: paymentData.razorpaySignature || payment.razorpaySignature,
            failureReason: undefined,
        };

        // Overwrite method with the actual instrument from Razorpay if available
        if (paymentData.resolvedMethod) {
            extraFields.method = paymentData.resolvedMethod;
        }

        await appendPaymentStatus(payment, 'Completed', 'Payment completed', extraFields, { session });

        if (order) {
            await incrementTotalSold(order.orderItems, { session });
        }

        let invoice = null;
        let invoiceError = null;
        try {
            invoice = await invoiceService.createInvoiceFromOrder(payment.orderId, { session });
            await orderModel.findByIdAndUpdate(payment.orderId, {
                $set: { invoiceStatus: 'Generated' },
                $unset: { lastInvoiceError: '' },
            }, { session });
        } catch (error) {
            if (error.statusCode === 409) {
                await orderModel.findByIdAndUpdate(payment.orderId, {
                    $set: { invoiceStatus: 'Generated' },
                    $unset: { lastInvoiceError: '' },
                }, { session });
            } else {
                invoiceError = error.message;
                await orderModel.findByIdAndUpdate(payment.orderId, {
                    $set: {
                        invoiceStatus: 'Failed',
                        lastInvoiceError: invoiceError,
                    },
                }, { session });
            }
        }

        await session.commitTransaction();

        return {
            payment,
            invoice,
            invoiceError,
            alreadyCompleted: false,
            cancelledOrderConflict: false,
        };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
};

const verifyPayment = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw ApiError.badRequest('razorpay_order_id, razorpay_payment_id, and razorpay_signature are required');
    }

    const { keySecret } = getRazorpayKeys();
    const expectedSignature = createSignature(
        `${razorpay_order_id}|${razorpay_payment_id}`,
        keySecret
    );

    if (!timingSafeEqual(expectedSignature, razorpay_signature)) {
        throw ApiError.badRequest('Invalid Razorpay signature');
    }

    const payment = await paymentModel.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) throw ApiError.notFound('Payment not found for Razorpay order');

    const result = await completePaymentRecord(payment, {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
    });

    const order = await orderModel.findById(payment.orderId).lean();

    return {
        orderId: order?.orderId || null,
        paymentId: payment.paymentId,
        paymentStatus: result.payment.status,
        transactionId: result.payment.razorpayPaymentId || result.payment.paymentId,
        invoiceId: result.invoice?.invoiceId || null,
        invoiceError: result.invoiceError || null,
        alreadyCompleted: result.alreadyCompleted,
    };
};

const markPaymentFailed = async (razorpayOrderId, reason) => {
    if (!razorpayOrderId) return null;

    const payment = await paymentModel.findOne({
        razorpayOrderId,
        status: { $ne: 'Completed' },
    });
    if (!payment) return null;

    await appendPaymentStatus(payment, 'Failed', reason || 'Razorpay payment failed', {
        failureReason: reason || 'Razorpay payment failed',
    });

    // Immediately restore held stock on payment failure
    const order = await orderModel.findById(payment.orderId);
    if (order) {
        const alreadyCancelled = order.statusHistory.some(e => e.status === 'Cancelled');
        if (!alreadyCancelled) {
            try {
                await restoreStock(order.orderItems, { decrementTotalSold: false });
            } catch (err) {
                logger.error({ err, orderId: order.orderId }, 'Failed to restore stock on payment failure');
            }
        }
    }

    return payment;
};

const handleWebhook = async (rawBody, signature) => {
    if (!signature) throw ApiError.badRequest('Missing Razorpay webhook signature');

    const payload = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody || '');
    const expectedSignature = createSignature(payload, getWebhookSecret());

    if (!timingSafeEqual(expectedSignature, signature)) {
        throw ApiError.badRequest('Invalid Razorpay webhook signature');
    }

    const event = JSON.parse(payload);
    const paymentEntity = event.payload?.payment?.entity;

    if (!paymentEntity?.order_id) {
        return { processed: false, event: event.event, reason: 'No payment order_id in webhook payload' };
    }

    if (event.event === 'payment.captured') {
        const payment = await paymentModel.findOne({ razorpayOrderId: paymentEntity.order_id });
        if (!payment) return { processed: false, event: event.event, reason: 'Payment not found' };

        const resolvedMethod = mapRazorpayMethod(paymentEntity.method, paymentEntity);

        const result = await completePaymentRecord(payment, {
            razorpayPaymentId: paymentEntity.id,
            resolvedMethod,
        });
        const order = await orderModel.findById(payment.orderId).lean();

        return {
            processed: true,
            event: event.event,
            orderId: order?.orderId || null,
            paymentId: payment.paymentId,
            alreadyCompleted: result.alreadyCompleted,
        };
    }

    if (event.event === 'payment.failed') {
        const payment = await markPaymentFailed(paymentEntity.order_id, paymentEntity.error_description || paymentEntity.error_reason);
        const order = payment ? await orderModel.findById(payment.orderId).lean() : null;
        return {
            processed: Boolean(payment),
            event: event.event,
            orderId: order?.orderId || null,
            paymentId: payment?.paymentId || null,
        };
    }

    return { processed: false, event: event.event, reason: 'Unhandled event' };
};

const getPayments = async (query = {}) => {
    const { page = 1, limit = 10, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const filter = {};

    if (status && status !== 'All') {
        filter.status = status;
    }

    if (search?.trim()) {
        const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const matchingOrderIds = await orderModel
            .find({ orderId: { $regex: escapedSearch, $options: 'i' } })
            .select('_id')
            .lean();
        filter.$or = [
            { paymentId: { $regex: escapedSearch, $options: 'i' } },
            { razorpayOrderId: { $regex: escapedSearch, $options: 'i' } },
            { razorpayPaymentId: { $regex: escapedSearch, $options: 'i' } },
            { orderId: { $in: matchingOrderIds.map((order) => order._id) } },
        ];
    }

    const SORTABLE_FIELDS = {
        createdAt: 'createdAt',
        paidAt: 'updatedAt',
        amount: 'amount',
    };
    const sortField = SORTABLE_FIELDS[sortBy] || 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [payments, total] = await Promise.all([
        paymentModel.find(filter)
            .populate('userId', 'firstName lastName email phone')
            .populate('orderId', 'orderId statusHistory userId customer')
            .sort({ [sortField]: sortDirection })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
            .lean(),
        paymentModel.countDocuments(filter),
    ]);

    return {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        payments: payments.map(buildPaymentSummary),
    };
};

const getPaymentById = async (id) => {
    if (!id) throw ApiError.badRequest('Payment id is required');

    const payment = await paymentModel.findOne({
        $or: [
            { paymentId: id },
            { razorpayOrderId: id },
            { razorpayPaymentId: id },
        ],
    })
        .populate('userId', 'firstName lastName email phone')
        .populate('orderId', 'orderId statusHistory userId customer')
        .lean();

    if (!payment) throw ApiError.notFound(`Payment not found: ${id}`);
    return buildPaymentSummary(payment);
};

const getPaymentHistoryByOrder = async (orderId) => {
    const orderQuery = [{ orderId }];
    if (/^[a-f\d]{24}$/i.test(orderId)) orderQuery.push({ _id: orderId });

    const order = await orderModel.findOne({ $or: orderQuery }).lean();
    if (!order) throw ApiError.notFound(`Order not found: ${orderId}`);

    const payments = await paymentModel.find({ orderId: order._id })
        .sort({ attemptNumber: 1, createdAt: 1 })
        .populate('userId', 'firstName lastName email phone')
        .lean();

    return payments.map((payment) => buildPaymentSummary({ ...payment, orderId: order }));
};

const getPaymentHistoryByUser = async (userId) => {
    const payments = await paymentModel.find({ userId })
        .sort({ createdAt: -1 })
        .populate('userId', 'firstName lastName email phone')
        .populate('orderId', 'orderId statusHistory userId customer')
        .lean();

    return payments.map(buildPaymentSummary);
};

const refundPayment = async (id, { amount, reason } = {}) => {
    if (!id) throw ApiError.badRequest('Payment id is required');

    const payment = await paymentModel.findOne({
        $or: [
            { paymentId: id },
            { razorpayPaymentId: id },
        ],
    });
    if (!payment) throw ApiError.notFound(`Payment not found: ${id}`);
    if (payment.status !== 'Completed') {
        throw ApiError.badRequest(`Only completed payments can be refunded; current status is ${payment.status}`);
    }
    if (!payment.razorpayPaymentId) {
        throw ApiError.badRequest('This payment has no Razorpay payment ID');
    }

    const refundAmount = amount == null ? payment.amount : Number(amount);
    if (!Number.isFinite(refundAmount) || refundAmount <= 0 || refundAmount > payment.amount) {
        throw ApiError.badRequest(`Refund amount must be greater than 0 and no more than ${payment.amount}`);
    }

    const initiatedAt = new Date();
    const razorpay = getRazorpayClient();
    const razorpayRefund = await razorpay.payments.refund(payment.razorpayPaymentId, {
        amount: toPaise(refundAmount),
        notes: {
            paymentId: payment.paymentId,
            reason: reason || 'Admin refund',
        },
    });

    const status = refundAmount < payment.amount ? 'PartiallyRefunded' : 'Refunded';
    await appendPaymentStatus(payment, status, reason || 'Payment refunded', {
        refund: {
            amount: refundAmount,
            reason: reason || 'Admin refund',
            razorpayRefundId: razorpayRefund.id,
            initiatedAt,
            completedAt: razorpayRefund.status === 'processed' ? new Date() : undefined,
        },
    });

    return buildPaymentSummary(payment.toObject());
};

const getPaymentStats = async () => {
    const [statusCounts, revenueAgg] = await Promise.all([
        paymentModel.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        paymentModel.aggregate([
            { $match: { status: 'Completed' } },
            {
                $group: {
                    _id: null,
                    successfulAmount: { $sum: '$amount' },
                    successfulCount: { $sum: 1 },
                },
            },
        ]),
    ]);

    const countMap = {};
    statusCounts.forEach((item) => { countMap[item._id] = item.count; });

    return {
        successful: countMap.Completed || 0,
        failed: countMap.Failed || 0,
        pending: countMap.Pending || 0,
        initiated: countMap.Initiated || 0,
        refunded: countMap.Refunded || 0,
        partiallyRefunded: countMap.PartiallyRefunded || 0,
        successfulAmount: revenueAgg[0]?.successfulAmount || 0,
        successfulCount: revenueAgg[0]?.successfulCount || 0,
    };
};

module.exports = {
    createPaymentAttempt,
    syncOrderPaymentState,
    createRazorpayOrder,
    verifyPayment,
    handleWebhook,
    getPayments,
    getPaymentById,
    getPaymentHistoryByOrder,
    getPaymentHistoryByUser,
    refundPayment,
    getPaymentStats,
    completePaymentRecord,
    markPaymentFailed,
};

