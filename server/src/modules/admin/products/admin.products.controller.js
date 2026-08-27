const productsService = require('../../../shared/products/product.service');

const addProduct = async (req, res, next) => {
    try {
        const product = await productsService.addProduct(req.body);
        
        // Exact original response
        res.status(200).json({
            message: "Product added successfully!",
            data: product
        });
    } catch (error) {
        if (error.isOperational && error.statusCode === 400) {
            return res.status(400).json({ message: error.message });
        }
        // Preserve exact old error response structure for unexpected errors
        if (!error.isOperational) {
            return res.status(500).json({
                error: "Error while adding order", // Keeping original typo for compatibility
                message: error.message
            });
        }
        next(error);
    }
};

const getProducts = async (req, res, next) => {
    try {
        const products = await productsService.getProducts();
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        next(error);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await productsService.getProductById(id);
        
        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        if (error.isOperational && error.statusCode === 404) {
             return res.status(404).json({
                success: false,
                message: error.message
             });
        }
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await productsService.updateProduct(id, req.body);
        
        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        if (error.isOperational && (error.statusCode === 404 || error.statusCode === 400)) {
             return res.status(error.statusCode).json({
                success: false,
                message: error.message
             });
        }
        next(error);
    }
};

module.exports = { addProduct, getProducts, getProductById, updateProduct };
