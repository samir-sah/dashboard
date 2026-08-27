const mongoose = require('mongoose');
const generateInvoiceId = require('../utils/generateInvoiceId');
require('./user.model');

// Invoice address schema (includes addressLine1 for unit/flat details)
const addressSchema = new mongoose.Schema({
    fullName: { type: String, trim: true },
    phone: { type: String, trim: true },
    addressLine1: { type: String, trim: true },  // e.g. "Flat 402"
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, required: true }
}, { _id: false });

// Invoice item schema — snapshot of product at time of purchase
const invoiceItemsSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId
        // Optional, no ref — kept for future linkage to product catalog
    },
    productName: { type: String, required: true },
    sku: { type: String },
    hsnCode: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    taxRate: { type: Number, default: 0 },
    total: { type: Number, required: true }
}, { _id: false });

// Payment details schema (snapshot from order payment)
const paymentDetailsSchema = new mongoose.Schema({
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
        enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
        default: 'Pending',
        required: true
    },
    transactionId: String,
    amount: { type: Number, required: true },
    paidAt: Date,
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
    invoiceId: {
        type: String,
        unique: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "device_orders",
        required: true,
        unique: true,
        index: true
    },
    orderDisplayId: {
        type: String  // e.g. "ORD1005" — snapshot for PDF display
    },
    // Complete customer snapshot — historically accurate, no future population needed
    customer: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true
        },
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String },
        shippingAddress: addressSchema,
        billingAddress: addressSchema
    },
    invoiceItems: [invoiceItemsSchema],
    financials: {
        subtotal: { type: Number, required: true },
        taxAmount: { type: Number, default: 0 },
        shippingCharges: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true }
    },
    payment: paymentDetailsSchema,
    status: {
        type: String,
        enum: ['Pending', 'Paid', 'Cancelled'],
        default: 'Pending',
        required: true,
        index: true
    },
    issuedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    dueDate: Date
}, { timestamps: true });

// Auto-generate invoiceId before save — NO inventory or stock logic here
invoiceSchema.pre('save', async function () {
    if (this.isNew && !this.invoiceId) {
        const model = mongoose.models.device_invoices
            || mongoose.model("device_invoices", invoiceSchema);
        this.invoiceId = await generateInvoiceId(model);
    }
});

const invoiceModel = mongoose.model("device_invoices", invoiceSchema);

module.exports = invoiceModel;
