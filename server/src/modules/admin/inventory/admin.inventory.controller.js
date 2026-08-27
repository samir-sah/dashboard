const inventoryService = require('../../../shared/inventory/inventory.service');

const getProduct = async (req, res, next) => {
    try {
        const product = await inventoryService.getActiveProduct();
        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
};

const getProductDashboard = async (req, res, next) => {
    try {
        const { id } = req.params;
        const days = parseInt(req.query.days) || 30;
        const dashboardData = await inventoryService.getProductDashboardData(id || null, days);
        res.status(200).json(dashboardData);
    } catch (error) {
        if (error.statusCode) {
             return res.status(error.statusCode).json({ message: error.message });
        }
        next(error);
    }
};

module.exports = {
    getProduct,
    getProductDashboard
};
