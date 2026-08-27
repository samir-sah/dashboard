const express = require('express');
const authRoutes = require('./auth/admin.auth.routes');
const dashboardRoutes = require('./dashboard/admin.dashboard.routes');
const invoiceRoutes = require('./invoices/admin.invoices.routes');
const inventoryRoutes = require('./inventory/admin.inventory.routes');
const paymentRoutes = require('./payments/admin.payments.routes');
const reportRoutes = require('./reports/reports.routes');

const adminRouter = express.Router();

// Mount modules that have entirely distinct prefixes
adminRouter.use('/auth-dashboard', authRoutes);
adminRouter.use('/dashboard', dashboardRoutes);
adminRouter.use('/invoices', invoiceRoutes);
adminRouter.use('/inventory', inventoryRoutes);
adminRouter.use('/payments', paymentRoutes);
adminRouter.use('/reports', reportRoutes);

module.exports = adminRouter;
