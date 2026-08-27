const express = require('express');
const { createInvoice, getInvoice, getInvoiceByOrder } = require('./admin.invoices.controller');
const { authenticateAdmin, authorize } = require('../../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticateAdmin, authorize('Admin'));

router.post('/create/:orderId', createInvoice);
router.get('/order/:orderId', getInvoiceByOrder);
router.get('/:invoiceId', getInvoice);

module.exports = router;
