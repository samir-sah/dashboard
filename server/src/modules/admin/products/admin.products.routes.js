const express = require('express');
const { addProduct, updateProduct } = require('./admin.products.controller');
const { authenticateAdmin, authorize } = require('../../../middlewares/auth.middleware');

const router = express.Router();
const requireAdmin = [authenticateAdmin, authorize('Admin')];

// Note: These will be mounted under /api/product/ in the final router aggregation
router.post('/addproduct', requireAdmin, addProduct);
router.patch('/:id', requireAdmin, updateProduct);

module.exports = router;
