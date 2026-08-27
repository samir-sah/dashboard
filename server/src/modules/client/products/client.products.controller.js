const productsService = require('../../../shared/products/product.service');

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
        if (error.statusCode === 404) {
             return res.status(404).json({
                success: false,
                message: error.message
             });
        }
        next(error);
    }
};

module.exports = { getProducts, getProductById };
