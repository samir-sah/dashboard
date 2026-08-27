const ordersService = require('../../../shared/orders/order.service');

const addOrder = async (req, res, next) => {
    try {
        // Enforce userId to be the logged-in user
        const orderData = { ...req.body, userId: req.user.id };
        const addedOrder = await ordersService.createOrder(orderData);
        res.status(201).json({ message: "Order Added In Cart Successfully!", data: addedOrder });
    } catch (error) {
        if (error.statusCode === 400 || error.statusCode === 404) {
            return res.status(error.statusCode).json({ message: error.message, success: false });
        }
        res.status(500).json({ Error: "error at adding order in cart ", message: error.message });
    }
};
const checkoutOrder = async (req, res, next) => {
    try {
        // Enforce userId to be the logged-in user
        const orderData = { ...req.body, userId: req.user.id };
        const addedOrder = await ordersService.checkoutOrder(orderData);
        res.status(201).json({ message: "Order Added Successfully!", data: addedOrder });
    } catch (error) {
        if (error.statusCode === 400 || error.statusCode === 404) {
            return res.status(error.statusCode).json({ message: error.message, success: false });
        }
        res.status(500).json({ Error: "error at adding order", message: error.message });
    }
};

const getUserOrderHistory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { page, limit } = req.query;
        // The service checks if req.user.role === 'Customer' and req.user.id !== id
        const data = await ordersService.getUserOrderHistory(id, req.user, page, limit);
        
        return res.status(200).json({ success: true, ...data, data: data.orders });
    } catch (error) {
        if (error.statusCode === 403) return res.status(403).json({ success: false, message: error.message });
        if (error.statusCode === 404) return res.status(404).json({ success: false, message: error.message });
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getUsersOrderById = async (req, res) => {
    try {
        const { id,orderId } = req.params;
        // The service checks if req.user.role === 'Customer' and req.user.id !== id
        const data = await ordersService.getUsersOrderById(id, orderId, req.user);
        return res.status(200).json({
            success: true,
            message: "Order fetched successfully",
            data,
        });
        
    }catch (error) {
        if (error.statusCode === 403) return res.status(403).json({ success: false, message: error.message });
        if (error.statusCode === 404) return res.status(404).json({ success: false, message: error.message });
        return res.status(500).json({ success: false, message: error.message });
    }
    
}

module.exports = { addOrder,checkoutOrder, getUserOrderHistory , getUsersOrderById};
