const { connectToDatabase } = require('../config/database');
const { sweepStaleOrders, SWEEP_CRON, STALE_THRESHOLD_MINUTES } = require('./staleOrderSweep.job');
const logger = require('../utils/logger');

module.exports.staleOrderSweep = async (event = {}, context = {}) => {
    if (context) {
        context.callbackWaitsForEmptyEventLoop = false;
    }

    try {
        await connectToDatabase();
        const result = await sweepStaleOrders();

        logger.info(
            { result, schedule: SWEEP_CRON, thresholdMinutes: STALE_THRESHOLD_MINUTES, eventSource: event.source },
            'Stale order sweep completed'
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                data: result,
            }),
        };
    } catch (err) {
        logger.error({ err }, 'Stale order sweep handler failed');

        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                message: 'Stale order sweep failed',
            }),
        };
    }
};
