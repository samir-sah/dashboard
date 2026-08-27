const express = require('express');
const authRoutes = require('./auth/client.auth.routes');
// The rest (orders, products, profile) will be merged in the top-level aggregator
// However, the task says "Create client/index.js route aggregator"
// Profile routes were originally under /api/user, so we can group them here or at top level.

const clientRouter = express.Router();

clientRouter.use('/', authRoutes);

module.exports = clientRouter;
