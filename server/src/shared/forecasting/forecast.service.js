const salesService = require('../sales/sales.service');

/**
 * Forecast Service
 * Calculates inventory forecasting metrics.
 */

/**
 * Calculates the forecast for a given product
 * @param {Object} product - Product document
 * @returns {Object} forecast metrics
 */
const calculateForecast = async (product) => {
    // Calculate average daily sales over the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalSoldLast30Days = await salesService.getConfirmedUnitsSold(product._id, thirtyDaysAgo);
    
    // Average Daily Sales (units per day)
    const averageDailySales = Math.ceil(totalSoldLast30Days / 30);

    // Days Remaining
    let daysRemaining = 0;
    if (averageDailySales > 0) {
        daysRemaining = Math.floor(product.stock / averageDailySales);
    } else if (product.stock > 0) {
        daysRemaining = 999; // If we have stock but no sales, it will last a long time
    }

    // Status
    let status = 'Healthy';
    if (product.stock <= 0) {
        status = 'Out Of Stock';
    } else if (daysRemaining < 15) {
        status = 'Immediate Reorder Required';
    } else if (daysRemaining <= 30) {
        status = 'Restock Soon';
    }

    // Also update basic status based on stock thresholds for UI badges
    let inventoryStatus = 'Healthy';
    if (product.stock <= 0) {
        inventoryStatus = 'Out Of Stock';
    } else if (product.stock <= product.lowStockThreshold) {
        inventoryStatus = 'Critical';
    } else if (product.stock <= product.reorderPoint) {
        inventoryStatus = 'Low Stock';
    }

    return {
        averageDailySales,
        daysRemaining,
        status,
        inventoryStatus
    };
};

module.exports = {
    calculateForecast
};
