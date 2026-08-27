require('dotenv').config();

const { connectToDatabase, disconnectFromDatabase } = require('../src/config/database');
const { sweepStaleOrders } = require('../src/jobs/staleOrderSweep.job');
const logger = require('../src/utils/logger');

(async () => {
    try {
        await connectToDatabase();
        const result = await sweepStaleOrders();
        logger.info({ result }, 'Manual stale order sweep completed');
    } catch (err) {
        logger.error({ err }, 'Manual stale order sweep failed');
        process.exitCode = 1;
    } finally {
        await disconnectFromDatabase();
    }
})();
