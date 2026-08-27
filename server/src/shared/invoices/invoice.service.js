const mongoose = require('mongoose');
const invoiceModel = require('../../models/invoice.model');
const orderModel = require('../../models/orders.model');
const userModel = require('../../models/user.model');
const productModels = require('../../models/product.model');
const generateInvoiceId = require('../../utils/generateInvoiceId');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');
const { resolveCustomerName } = require('../../utils/name.utils');

/**
 * Invoice Service
 *
 * Single entry point for invoice creation. The model only validates and
 * persists data — all business logic lives here.
 *
 * Flow:
 *   Load Order → Validate Payment → Check Duplicate → Build Snapshot → Save Invoice
 */

/**
 * Create an invoice from a completed order.
 *
 * @param {string} orderId - The MongoDB _id of the order
 * @returns {object} The saved invoice document
 * @throws {Error} If order not found, payment not completed, or invoice already exists
 */
const createInvoiceFromOrder = async (orderId, options = {}) => {
    // ── 1. Load the order ────────────────────────────────────────────────
    const order = await orderModel.findById(orderId).session(options.session || null).lean();

    if (!order) {
        throw ApiError.notFound(`Order not found: ${orderId}`);
    }

    // ── 2. Validate payment is completed ─────────────────────────────────
    // Payment history lives in payments; order.payment is the synced current-state
    // cache maintained only by syncOrderPaymentState(orderId).
    if (!order.payment || order.payment.status !== 'Completed') {
        throw ApiError.badRequest(
            `Cannot generate invoice: payment status is "${order.payment?.status || 'missing'}", expected "Completed"`
        );
    }

    // ── 3. Check if invoice already exists for this order ────────────────
    const existingInvoice = await invoiceModel.findOne({ orderId: order._id }).session(options.session || null).lean();

    if (existingInvoice) {
        throw ApiError.conflict(
            `Invoice already exists for order ${orderId}: ${existingInvoice.invoiceId}`
        );
    }

    // ── 4. Load customer data for snapshot ───────────────────────────────
    const user = await userModel.findById(order.userId).lean();

    if (!user) {
        throw ApiError.notFound(`User not found: ${order.userId}`);
    }

    // ── 4b. Validate customer data is sufficient for an invoice ──────────
    const fullName = resolveCustomerName(user, order);
    
    if (!fullName || fullName === 'Unknown Customer') {
        throw ApiError.badRequest(
            'Cannot generate invoice: customer name is missing. Update user profile first.'
        );
    }

    // ── 5. Build customer snapshot ───────────────────────────────────────
    const customerSnapshot = {
        userId: user._id,
        fullName: fullName,
        phone: user.phone,
        email: user.email || '',
        shippingAddress: buildAddressSnapshot(order.customer?.shippingAddress),
        billingAddress: buildAddressSnapshot(order.customer?.billingAddress)
    };

    // ── 6. Build invoice items from order items ──────────────────────────
    //    For backward compatibility: if order items lack sku/hsnCode,
    //    fall back to looking up the product document.
    const invoiceItems = [];

    for (const item of (order.orderItems || [])) {
        let sku = item.sku || '';
        let hsnCode = item.hsnCode || '';
        let taxRate = item.taxRate ?? null;

        // Fallback: look up product if order item is missing sku/hsnCode/taxRate
        if ((!sku || !hsnCode || taxRate === null) && item.productId) {
            try {
                const product = await productModels.findById(item.productId).lean();
                if (product) {
                    sku = sku || product.sku || '';
                    hsnCode = hsnCode || product.hsnCode || '';
                    if (taxRate === null) {
                        taxRate = product.taxRate ?? 0;
                    }
                }
            } catch (lookupErr) {
                // Product may not exist — proceed with empty/default values
                logger.warn({ err: lookupErr, productId: item.productId }, 'Could not look up product for invoice item snapshot');
            }
        }

        // Final default
        taxRate = taxRate ?? 0;

        invoiceItems.push({
            productId: item.productId || undefined,
            productName: item.productName,
            sku,
            hsnCode,
            price: item.price,
            quantity: item.quantity,
            taxRate,
            total: item.price * item.quantity
        });
    }

    // ── 7. Calculate financials ──────────────────────────────────────────
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = invoiceItems.reduce(
        (sum, item) => sum + (item.total * item.taxRate / 100), 0
    );
    const shippingCharges = order.shippingCharges || 0;
    const totalAmount = subtotal + taxAmount + shippingCharges;

    // ── 8. Create invoice document ───────────────────────────────────────
    const invoiceData = {
        orderId: order._id,
        orderDisplayId: order.orderId || '',  // human-readable "ORDxxxx"
        customer: customerSnapshot,
        invoiceItems,
        financials: {
            subtotal,
            taxAmount,
            shippingCharges,
            totalAmount
        },
        payment: {
            method: order.payment.method,
            status: order.payment.status,
            transactionId: order.payment.transactionId || '',
            amount: order.payment.amount,
            paidAt: order.payment.paidAt || new Date()
        },
        status: 'Paid',
        issuedAt: new Date()
    };

    // ── 9. Save with retry on duplicate invoice ID ───────────────────────
    try {
        const invoice = new invoiceModel(invoiceData);
        await invoice.save(options);
        return invoice.toObject();
    } catch (err) {
        // Retry once if duplicate key on invoiceId (race condition safety net)
        if (err.code === 11000 && err.keyPattern?.invoiceId) {
            const invoice = new invoiceModel(invoiceData);
            invoice.invoiceId = await generateInvoiceId(invoiceModel);
            await invoice.save(options);
            return invoice.toObject();
        }
        throw err;
    }
};

/**
 * Get invoice by its human-readable invoiceId (e.g. "INV-2026-0001").
 *
 * @param {string} invoiceId - The human-readable invoice ID
 * @returns {object|null} The invoice document or null
 */
const getInvoiceById = async (invoiceId) => {
    const invoice = await invoiceModel.findOne({ invoiceId }).lean();
    return invoice;
};

/**
 * Get invoice linked to a specific order.
 *
 * @param {string} orderId - The MongoDB _id of the order
 * @returns {object|null} The invoice document or null
 */
const getInvoiceByOrderId = async (orderId) => {
    const invoice = await invoiceModel.findOne({ orderId }).lean();
    return invoice;
};

// ── Helpers ──────────────────────────────────────────────────────────────

/**
 * Build an address snapshot, mapping source address fields and adding
 * addressLine1 (defaults to empty string if source doesn't have it).
 */
function buildAddressSnapshot(sourceAddress) {
    if (!sourceAddress) return undefined;

    return {
        fullName: sourceAddress.fullName || '',
        phone: sourceAddress.phone || '',
        addressLine1: sourceAddress.addressLine1 || '',
        street: sourceAddress.street || '',
        city: sourceAddress.city || '',
        state: sourceAddress.state || '',
        pincode: sourceAddress.pincode || '',
        country: sourceAddress.country || ''
    };
}

module.exports = {
    createInvoiceFromOrder,
    getInvoiceById,
    getInvoiceByOrderId
};
