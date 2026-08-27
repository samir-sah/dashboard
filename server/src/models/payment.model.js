const mongoose = require('mongoose');

const PAYMENT_STATUSES = [
    'Initiated',
    'Pending',
    'Completed',
    'Failed',
    'Refunded',
    'PartiallyRefunded',
];

const PAYMENT_METHODS = ['UPI', 'Credit Card', 'Debit Card', 'Netbanking', 'Wallet'];

const PAYMENT_GATEWAYS = ['Razorpay'];

const statusHistorySchema = new mongoose.Schema({
    status: {
        type: String,
        enum: PAYMENT_STATUSES,
        required: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    note: {
        type: String,
        trim: true,
        default: '',
    },
}, { _id: false });

const refundSchema = new mongoose.Schema({
    amount: { type: Number, min: 0 },
    reason: { type: String, trim: true },
    razorpayRefundId: { type: String, trim: true },
    initiatedAt: Date,
    completedAt: Date,
}, { _id: false });

const paymentSchema = new mongoose.Schema({
    paymentId: {
        type: String,
        unique: true,
        index: true,
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'device_orders',
        required: true,
        index: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        index: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    currency: {
        type: String,
        default: 'INR',
        trim: true,
    },
    method: {
        type: String,
        enum: PAYMENT_METHODS,
        required: true,
    },
    gateway: {
        type: String,
        enum: PAYMENT_GATEWAYS,
        default: 'Razorpay',
    },
    status: {
        type: String,
        enum: PAYMENT_STATUSES,
        required: true,
        default: 'Pending',
        index: true,
    },
    statusHistory: {
        type: [statusHistorySchema],
        default: [],
    },
    razorpayOrderId: {
        type: String,
        trim: true,
        index: true,
    },
    razorpayPaymentId: {
        type: String,
        trim: true,
        index: true,
    },
    razorpaySignature: {
        type: String,
        trim: true,
    },
    failureReason: {
        type: String,
        trim: true,
    },
    refund: refundSchema,
    attemptNumber: {
        type: Number,
        default: 1,
        min: 1,
    },
}, { timestamps: true });

paymentSchema.pre('validate', async function assignPaymentId() {
    if (this.paymentId) return;

    const year = new Date().getFullYear();
    const prefix = `PAY-${year}-`;
    const latest = await this.constructor
        .findOne({ paymentId: { $regex: `^${prefix}` } })
        .sort({ paymentId: -1 })
        .select('paymentId')
        .lean();

    const nextNumber = latest?.paymentId
        ? Number(latest.paymentId.split('-').pop()) + 1
        : 1;

    this.paymentId = `${prefix}${String(nextNumber).padStart(5, '0')}`;
});

paymentSchema.pre('validate', function ensureHistory() {
    if (!this.statusHistory?.length && this.status) {
        this.statusHistory = [{ status: this.status, updatedAt: new Date(), note: 'Payment record created' }];
    }
});

paymentSchema.index({ orderId: 1, createdAt: -1 });
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('payments', paymentSchema);
module.exports.PAYMENT_STATUSES = PAYMENT_STATUSES;
module.exports.PAYMENT_METHODS = PAYMENT_METHODS;
module.exports.PAYMENT_GATEWAYS = PAYMENT_GATEWAYS;
