const express = require('express');

// Import sub-routers
const adminOrdersRouter = require('../modules/admin/orders/admin.orders.routes');
const clientOrdersRouter = require('../modules/client/orders/client.orders.routes');
const adminProductsRouter = require('../modules/admin/products/admin.products.routes');
const clientProductsRouter = require('../modules/client/products/client.products.routes');
const adminUsersRouter = require('../modules/admin/users/admin.users.routes');
const clientProfileRouter = require('../modules/client/profile/client.profile.routes');
const adminPaymentsRouter = require('../modules/admin/payments/admin.payments.routes');
const clientPaymentsRouter = require('../modules/client/payments/client.payments.routes');
const clientSupportRouter = require('../modules/client/supportTicket/client.supportTicket.routes');
const adminSupportRouter = require('../modules/admin/supportTicket/admin.supportTicket.route');
const adminRouter = require('../modules/admin/index');
const clientRouter = require('../modules/client/index');

const apiRouter = express.Router();

// 1. Orders Router (/api/orders)
// Merging admin and client order paths
const ordersRouter = express.Router();
ordersRouter.use('/', clientOrdersRouter); // /addorder, /history/:id
ordersRouter.use('/', adminOrdersRouter); // /stats, /search, /cancelorder/:id, /updateorder/:id, /, /:orderId, etc.
apiRouter.use('/orders', ordersRouter);

// 2. Products Router (/api/product)
// Merging admin and client product paths
const productRouter = express.Router();
productRouter.use('/', adminProductsRouter); // /addproduct, /:id, /, patch /:id
productRouter.use('/', clientProductsRouter); // /, /:id (client routes are mostly identical to admin shared routes, we mount both or just admin)
apiRouter.use('/product', productRouter);

// 3. Users Router (/api/user)
// Merging admin user routes and client profile routes
const userRouter = express.Router();
userRouter.use('/', clientProfileRouter); // /profile, /profile-edit, /profile-delete
userRouter.use('/', adminUsersRouter); // /, /:userId, /update-user/:userId
apiRouter.use('/users', userRouter);

// 4. Payments Router (/api/payments)
const paymentsRouter = express.Router();
paymentsRouter.use('/', clientPaymentsRouter); // /create-order, /verify
paymentsRouter.use('/', adminPaymentsRouter); // /, /stats, /:id
apiRouter.use('/payments', paymentsRouter);
// support ticket router (/api/support)
const supportRouter = express.Router();
supportRouter.use('/', adminSupportRouter);
supportRouter.use('/', clientSupportRouter);
apiRouter.use('/support', supportRouter);
// 5. Auth Router (/api/auth)
apiRouter.use('/auth', clientRouter); // Auth routes are mounted on /auth inside clientRouter

// 6. Admin Top-Level Routes (/api/...)
apiRouter.use('/admin', adminRouter); // /admin/auth-dashboard, /admin/dashboard, /admin/invoices, /admin/inventory
// NOTE: Original paths were /api/dashboardLogin, /api/dashboard, /api/invoices, /api/inventory
// To preserve 100% path compatibility, we must mount them at the root level of apiRouter as well, 
// or alias them. Let's alias them to maintain zero path deviation!
const authAdminRoutes = require('../modules/admin/auth/admin.auth.routes');
const dashboardAdminRoutes = require('../modules/admin/dashboard/admin.dashboard.routes');
const invoicesAdminRoutes = require('../modules/admin/invoices/admin.invoices.routes');
const inventoryAdminRoutes = require('../modules/admin/inventory/admin.inventory.routes');
const reportsAdminRoutes = require('../modules/admin/reports/reports.routes');

apiRouter.use('/auth-dashboard', authAdminRoutes);
apiRouter.use('/dashboard', dashboardAdminRoutes);
apiRouter.use('/invoices', invoicesAdminRoutes);
apiRouter.use('/inventory', inventoryAdminRoutes);
apiRouter.use('/reports', reportsAdminRoutes);

module.exports = apiRouter;
