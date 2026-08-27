const express = require('express');
const { getProducts, getProductById } = require('./client.products.controller');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);

module.exports = router;
