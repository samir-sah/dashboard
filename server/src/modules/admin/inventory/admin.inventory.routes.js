const express = require('express');
const inventoryController = require('./admin.inventory.controller');
const { authenticateAdmin, authorize } = require('../../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticateAdmin, authorize('Admin'));

router.get('/product', inventoryController.getProduct);
router.get('/product/dashboard', inventoryController.getProductDashboard);

module.exports = router;
