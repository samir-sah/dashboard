const orderModel = require('../models/orders.model');
const { restoreStock } = require('../shared/inventory/inventory.service');
const logger = require('../utils/logger');

const STALE_THRESHOLD_MINUTES = 30;
const SWEEP_CRON = '*/5 * * * *'; // every 5 minutes

const sweepStaleOrders = async () => {
    const cutoff = new Date(Date.now() - STALE_THRESHOLD_MINUTES * 60 * 1000);

    const staleOrders = await orderModel.find({
        isInCart: false,
        'payment.status': { $in: ['Pending', 'Initiated'] },
        createdAt: { $lte: cutoff },
        'statusHistory.status': { $ne: 'Cancelled' },
    });

    const result = {
        scanned: staleOrders.length,
        cancelled: 0,
        failed: 0,
    };

    if (!staleOrders.length) return result;

    logger.info({ count: staleOrders.length }, 'Stale order sweep: found orders to cancel');

    for (const order of staleOrders) {
        try {
            await restoreStock(order.orderItems, { decrementTotalSold: false });
            await orderModel.findByIdAndUpdate(order._id, {
                $push: { statusHistory: { status: 'Cancelled', updatedAt: new Date() } },
                $set: { cancellationReason: 'Auto-cancelled: payment not completed within 30 minutes' },
            });
            result.cancelled += 1;
            logger.info({ orderId: order.orderId, _id: order._id }, 'Stale order auto-cancelled');
        } catch (err) {
            result.failed += 1;
            logger.error({ err, orderId: order.orderId }, 'Failed to auto-cancel stale order');
        }
    }

    return result;
};

module.exports = {
    STALE_THRESHOLD_MINUTES,
    SWEEP_CRON,
    sweepStaleOrders,
};
