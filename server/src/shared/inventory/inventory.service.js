const mongoose = require('mongoose');
const productModels = require('../../models/product.model');
const forecastService = require('../forecasting/forecast.service');
const salesService = require('../sales/sales.service');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');

/**
 * Inventory Service
 *
 * Responsible for all stock mutations. Called by the order controller,
 * NEVER by the invoice service.
 *
 * Operations:
 *   validateAndDeductStock — during order creation
 *   restoreStock           — during order cancellation
 */

/**
 * Validate that sufficient stock exists for every order item,
 * then atomically deduct stock, increment totalSold, update outOfStock,
 * and check low stock thresholds.
 *
 * @param {Array} orderItems - Array of { productId, quantity }
 * @returns {Array} Updated product documents (for reference/logging)
 * @throws {Error} If any product is missing, inactive, or has insufficient stock
 */
const validateAndDeductStock = async (orderItems, options = {}) => {
    const updatedProducts = [];
    
    const executeLogic = async (session) => {
        for (const item of orderItems) {
            const product = await productModels.findById(item.productId).session(session);

            if (!product) {
                throw ApiError.notFound(`Product not found: ${item.productId}`);
            }

            if (!product.isActive) {
                throw ApiError.badRequest(`Product "${product.productName}" is not active`);
            }

            if (product.stock < item.quantity) {
                throw ApiError.badRequest(
                    `Insufficient stock for "${product.productName}": requested ${item.quantity}, available ${product.stock}`
                );
            }

            // Deduct stock
            product.stock -= item.quantity;

            // Update outOfStock flag
            product.outOfStock = product.stock <= 0;

            // Low stock warning
            if (product.stock > 0 && product.stock <= product.lowStockThreshold) {
                logger.warn({
                    productId: product._id,
                    sku: product.sku,
                    stock: product.stock,
                    lowStockThreshold: product.lowStockThreshold,
                }, 'Product stock is below low-stock threshold');
            }

            if (product.outOfStock) {
                logger.warn({
                    productId: product._id,
                    sku: product.sku,
                }, 'Product is out of stock');
            }

            await product.save({ session });
            updatedProducts.push(product);
        }
    };

    if (options.session) {
        await executeLogic(options.session);
    } else {
        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async () => executeLogic(session));
        } finally {
            await session.endSession();
        }
    }

    return updatedProducts;
};

/**
 * Atomically increment totalSold for each item.
 * Called only on payment completion.
 *
 * @param {Array} orderItems - Array of { productId, quantity }
 */
const incrementTotalSold = async (orderItems, options = {}) => {
    for (const item of orderItems) {
        const product = await productModels.findById(item.productId).session(options.session || null);
        if (!product) {
            logger.warn({ productId: item.productId }, 'Product not found while incrementing totalSold; skipping');
            continue;
        }
        product.totalSold += item.quantity;
        await product.save(options);
    }
};

/**
 * Restore stock for cancelled order items.
 * Reverses the effects of validateAndDeductStock.
 *
 * @param {Array} orderItems - Array of { productId, quantity }
 * @returns {Array} Updated product documents
 */
const restoreStock = async (orderItems, { decrementTotalSold = false } = {}) => {
    const updatedProducts = [];

    for (const item of orderItems) {
        const product = await productModels.findById(item.productId);

        if (!product) {
            // Product may have been deleted — log and skip
            logger.warn({ productId: item.productId }, 'Product not found while restoring stock; skipping restore');
            continue;
        }

        // Restore stock
        product.stock += item.quantity;

        // Conditionally decrement totalSold
        if (decrementTotalSold) {
            product.totalSold = Math.max(0, product.totalSold - item.quantity);
        }

        // Update outOfStock flag
        product.outOfStock = product.stock <= 0;

        await product.save();
        updatedProducts.push(product);
    }

    return updatedProducts;
};

/**
 * Get the one active product used by the inventory dashboard.
 * @returns {Object|null} Active product
 */
const getActiveProduct = async () => {
    return await productModels.findOne({ isActive: true }).sort({ createdAt: 1 });
};

/**
 * Get comprehensive dashboard data for a single product
 * @param {string} productId 
 * @param {number} days 
 * @returns {Object} Dashboard payload
 */
const getProductDashboardData = async (productId, days = 30) => {
    const product = productId
        ? await productModels.findById(productId)
        : await getActiveProduct();

    if (!product) {
        throw ApiError.notFound(`Product not found: ${productId}`);
    }

    const forecast = await forecastService.calculateForecast(product);
    const salesTrend = await salesService.getSalesTrend(product._id, days);

    const inventoryValue = product.stock * product.price; // price is acting as unitPrice

    return {
        product: {
            id: product._id,
            name: product.productName,
            sku: product.sku,
            category: product.category || 'General',
            supplier: product.supplier || 'Unknown',
            unitPrice: product.price,
            stock: product.stock,
            reorderPoint: product.reorderPoint,
            lowStockThreshold: product.lowStockThreshold,
            maxCapacity: product.maxCapacity,
            inventoryValue: inventoryValue,
            lastRestockedAt: product.lastRestockedAt,
            nextRestockDate: product.nextRestockDate,
            totalSold: product.totalSold,
            outOfStock: product.outOfStock,
            status: forecast.inventoryStatus // Health, Low Stock, etc.
        },
        kpis: {
            currentStock: product.stock,
            inventoryValue: inventoryValue,
            averageDailySales: forecast.averageDailySales,
            daysUntilReorder: forecast.daysRemaining
        },
        salesTrend,
        forecast: {
            daysRemaining: forecast.daysRemaining,
            status: forecast.status // Reorder Soon, etc.
        }
    };
};

module.exports = {
    validateAndDeductStock,
    restoreStock,
    incrementTotalSold,
    getActiveProduct,
    getProductDashboardData
};
