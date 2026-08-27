const ordersService = require('../../../shared/orders/order.service');

const getOrders = async (req, res, next) => {
    try {
        const data = await ordersService.getOrders(req.query, req.user);
        return res.json({ success: true, ...data });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getOrderById = async (req, res, next) => {
    try {
        const order = await ordersService.getOrderById(req.params.orderId);
        res.json(order);
    } catch (error) {
        if (error.statusCode) return res.status(error.statusCode).json({ message: error.message });
        res.status(500).json({ message: error.message });
    }
};

const getOrderStats = async (req, res, next) => {
    try {
        const stats = await ordersService.getOrderStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserOrderHistory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { page, limit } = req.query;
        const data = await ordersService.getUserOrderHistory(id, req.user, page, limit);
        
        return res.status(200).json({ success: true, ...data, data: data.orders });
    } catch (error) {
        if (error.statusCode === 403) return res.status(403).json({ success: false, message: error.message });
        if (error.statusCode === 404) return res.status(404).json({ success: false, message: error.message });
        return res.status(500).json({ success: false, message: error.message });
    }
};

const cancelOrder = async (req, res, next) => {
    try {
        const { reason } = req.body || {};
        const userId = req.user?.id || req.user?._id;
        const result = await ordersService.cancelOrder(req.params.id, reason, userId);
        if (result.message === "Order is already cancelled!") {
            return res.status(200).json(result);
        }
        res.status(200).json({ message: result.message, data: result.data });
    } catch (error) {
        if (error.statusCode === 404) return res.status(404).json({ message: error.message });
        if (error.statusCode === 400) return res.status(400).json({ success: false, message: error.message });
        res.status(500).json({ Error: "Error at deleting orders", message: error.message });
    }
};

const searchOrder = async (req, res, next) => {
    try {
        const orders = await ordersService.searchOrder(req.query.search);
        return res.status(200).json({ message: "Orders found", data: orders, count: orders.length });
    } catch (error) {
        if (error.statusCode === 400) return res.status(400).json({ message: error.message });
        if (error.statusCode === 404) return res.status(404).json({ message: error.message });
        return res.status(500).json({ message: error.message });
    }
};

const updateOrderStatus = async (req, res, next) => {
    try {
        const result = await ordersService.updateOrderStatus(req.params.id);
        if (result.message === "Order already delivered!") return res.status(200).json(result);
        res.status(200).json(result);
    } catch (error) {
        if (error.statusCode === 404) return res.status(404).json({ message: error.message });
        return res.status(500).json({ message: error.message });
    }
};

const updateOrder = async (req, res, next) => {
    try {
        const updated = await ordersService.updateOrder(req.params.orderId, req.body);
        return res.status(200).json({ success: true, message: 'Order updated successfully', data: updated });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: 'Validation error', errors: Object.values(error.errors).map(e => e.message) });
        }
        if (error.statusCode === 404) return res.status(404).json({ success: false, message: error.message });
        if (error.statusCode === 400) return res.status(400).json({ success: false, message: error.message });
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

module.exports = { getOrders, getOrderById, getOrderStats, getUserOrderHistory, cancelOrder, searchOrder, updateOrderStatus, updateOrder };
