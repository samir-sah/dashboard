const mongoose = require('mongoose');
const { generateOrderId } = require('../utils/generateId');
require('./user.model');

// address schema
const addressSchema = new mongoose.Schema({
    fullName: { type: String, trim: true },
    phone: { type: String, trim: true },
    alternatePhone: { type: String, trim: true },
    addressLine1: { type: String, trim: true },  // e.g. "Flat 402"
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, required: true }
}, { _id: false });

// order item schema — snapshot of product at time of purchase
const orderItemsSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "devices",
        required: true
    },
    productName: { type: String, required: true },
    sku: { type: String, trim: true },
    hsnCode: { type: String, trim: true },
    taxRate: { type: Number, default: 0 },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    serialNumber: { type: String, trim: true, default: null },
    warrantyStatus: { type: String, default: "Not Available" },
    warrantyValidTill: { type: Date, default: null }
}, { _id: false });

// payment schema
const paymentSchema = new mongoose.Schema({
    method: {
        type: String,
        enum: ['UPI', 'Credit Card', 'Debit Card', 'Netbanking', 'Wallet'],
        required: true
    },
    gateway: {
        type: String,
        enum: ['Razorpay'],
        default: 'Razorpay',
    },
    status: {
        type: String,
        enum: ['Initiated', 'Pending', 'Completed', 'Failed', 'Refunded', 'PartiallyRefunded'],
        default: 'Pending',
        required: true
    },
    transactionId: String,
    amount: { type: Number, required: true },
    paidAt: Date,
    failureReason: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
}, { _id: false });

// order schema
const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
        index: true
    },
    orderId: {
        type: String,
        unique: true
    },
    orderDate: {
        type: Date,
        default: Date.now,
        index: true
    },
    customer: {
        addressId: mongoose.Schema.Types.ObjectId,
        shippingAddress: addressSchema,
        billingAddress: addressSchema
    },
    orderItems: [orderItemsSchema],
    statusHistory: [{
        status: {
            type: String,
            enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
            default: "Pending",
            required: true
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }],
    expectedArriveDate: Date,
    isInCart: { type: Boolean, default: true },
    shippingCharges: { type: Number, default: 0 },
    payment: paymentSchema,
    totalAmount: { type: Number },
    cancellationReason: { type: String },
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    stockRestoreFailed: { type: Boolean, default: false },
    stockRestoreFailureReason: { type: String },
    invoiceStatus: {
        type: String,
        enum: ['Pending', 'Generated', 'Failed'],
        default: 'Pending',
        index: true
    },
    lastInvoiceError: { type: String },
    paymentAfterCancellation: { type: Boolean },
    paymentAfterCancellationDetails: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

// ✅ auto-generate orderId before every save
orderSchema.pre('save', async function () {
    if (!this.orderId) {
        this.orderId = await generateOrderId(this.constructor);
    }
    if (this.isNew && this.statusHistory.length === 0) {
        this.statusHistory.push({ status: "Confirmed" });
    }
    // next();
});

orderSchema.index({ "statusHistory.status": 1 });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ "payment.status": 1 });
orderSchema.index({ "payment.razorpayOrderId": 1 });
orderSchema.index({ "payment.razorpayPaymentId": 1 });
orderSchema.index({ createdAt: 1 });
orderSchema.index({ createdAt: -1, 'payment.status': 1 });

const orderModel = mongoose.model("device_orders", orderSchema);

module.exports = orderModel;
