const userModel = require('../../../models/user.model');
const orderModel = require('../../../models/orders.model');

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const hasAddressContent = (address = {}) => (
    Boolean(
        address.addressLine1?.trim()
        || address.street?.trim()
        || address.city?.trim()
        || address.state?.trim()
        || String(address.pincode || "").trim()
        || address.country?.trim()
    )
);

const buildAddressFromOrderSnapshot = (address, type) => {
    if (!hasAddressContent(address)) return null;

    return {
        type,
        fullName: address.fullName || "",
        phone: address.phone || "",
        addressLine1: address.addressLine1 || "",
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        pincode: address.pincode || "",
        country: address.country || "",
        isDefault: true,
    };
};

const getDisplayAddresses = (user, orders = []) => {
    const savedAddresses = (user.addresses || []).filter(hasAddressContent);
    if (savedAddresses.length) return savedAddresses;

    const latestAddressOrder = [...orders]
        .sort((a, b) => new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt))
        .find((order) => (
            hasAddressContent(order.customer?.shippingAddress)
            || hasAddressContent(order.customer?.billingAddress)
        ));

    if (!latestAddressOrder) return [];

    return [
        buildAddressFromOrderSnapshot(latestAddressOrder.customer?.shippingAddress, "shipping"),
        buildAddressFromOrderSnapshot(latestAddressOrder.customer?.billingAddress, "billing"),
    ].filter(Boolean);
};

const getNewCustomerIds = async () => {
    const cutoff = new Date(Date.now() - THIRTY_DAYS_MS);
    const results = await orderModel.aggregate([
        { $match: { isInCart: false } },
        {
            $group: {
                _id: "$userId",
                orderCount: { $sum: 1 },
                onlyOrderDate: { $max: "$orderDate" },
            },
        },
        {
            $match: {
                orderCount: 1,
                onlyOrderDate: { $gte: cutoff },
            },
        },
        { $project: { _id: 1 } },
    ]);

    return results.map((result) => result._id);
};

const getUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const newCustomerIds = await getNewCustomerIds();
        let filter = {};
        
        if (search) {
            filter = {
                $or: [
                    { firstName: { $regex: search, $options: "i" } },
                    { lastName: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } } // fixed $option to $options
                ]
            };
        }

        if (status && status !== "All") {
            if (status === "Active") {
                filter.isActive = true;
                filter.isInCart = false;
                filter._id = { $nin: newCustomerIds };
            } else if (status === "Inactive") {
                filter.isActive = false;
                filter.isInCart = false;
            } else if (status === "In Cart") {
                filter.isInCart = true;
            } else if (status === "New") {
                filter._id = { $in: newCustomerIds };
            }
        }
    
        const data = await userModel.aggregate([
            { $match: filter },
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: Number(limit) },
            {
                $lookup: {
                    from: "device_orders",
                    let: { userId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$userId", "$$userId"] },
                                isInCart: false,
                            },
                        },
                    ],
                    as: "orders"
                }
            },
            {
                $addFields: {

                    realOrders: {
                        $filter: {
                            input: "$orders",
                            as: "o",
                            cond: { $eq: ["$$o.isInCart", false] }
                        }
                    },
                    netSpendOrders: {
                        $filter: {
                            input: "$orders",
                            as: "o",
                            cond: {
                                $and: [
                                    { $eq: ["$$o.isInCart", false] },
                                    { $eq: ["$$o.payment.status", "Completed"] },
                                    { $not: { $in: [{ $last: "$$o.statusHistory.status" }, ["Cancelled", "Refunded", "Failed"]] } }
                                ]
                            }
                        }
                    },
                    lastOrderDate: { $max: "$orders.orderDate" },
                    isNewCustomer: { $in: ["$_id", newCustomerIds] }
                }
            },
            {
                $addFields: {
                    totalOrders: { $size: "$realOrders" },
                    totalSpend: { $sum: "$netSpendOrders.totalAmount" },
                }
            },
            { $project: { realOrders: 0, netSpendOrders: 0 } },
            { $project: { orders: 0 } }
        ]);
    
        const total = await userModel.countDocuments(filter);
        const newCustomers = newCustomerIds.length;
    
        res.status(200).json({
            total,
            newCustomers,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data
        });
    } catch (error) {
        // preserve existing error format
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getUsersById = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User Not Found",
                success: false
            });
        }

        const order = await orderModel.find({ userId }).lean(); // keeping 'order' as variable name to preserve existing structure
        const userData = user.toObject();
        userData.addresses = getDisplayAddresses(userData, order);
        const realOrders = order.filter((item) => item.isInCart === false);
        const cutoff = new Date(Date.now() - THIRTY_DAYS_MS);
        userData.isNewCustomer = realOrders.length === 1
            && new Date(realOrders[0].orderDate || realOrders[0].createdAt) >= cutoff;
        // Only count paid orders for totalOrders and totalSpend (matches dashboard revenue logic)
        userData.totalOrders = realOrders.filter((o) => o.payment?.status === 'Completed').length;
        userData.totalSpend = realOrders
            .filter((o) => o.payment?.status === 'Completed')
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        res.status(200).json({
            data: {
                user: userData,
                order,
            },
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateUser = async (req, res, next) => {
    try {
        const { firstName, lastName, email, phoneNumber, phone, street, city, state, pincode } = req.body;
        const { userId } = req.params;
        
        const nameRegex = /^[a-zA-Z\s]{1,30}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+?\d{10,15}$/;

        if (firstName !== undefined && !nameRegex.test(firstName)) {
            return res.status(400).json({ error: "Only alphabets and spaces are allowed" });
        }
        if (lastName !== undefined && !nameRegex.test(lastName)) {
            return res.status(400).json({ error: "Only alphabets and spaces are allowed" });
        }
        if (email !== undefined && !emailRegex.test(email)) {
            return res.status(400).json({ error: "Enter valid email id" });
        }
        const phoneValue = phoneNumber ?? phone;
        if (phoneValue !== undefined && !phoneRegex.test(phoneValue)) {
            return res.status(400).json({ error: "Enter valid phone number" });
        }
        const editedInfo = await userModel.findById(userId);
        if (!editedInfo) {
            return res.status(404).json({ message: "User Cannot be Updated" });
        }

        if (firstName !== undefined) editedInfo.firstName = firstName;
        if (lastName !== undefined) editedInfo.lastName = lastName;
        if (email !== undefined) editedInfo.email = email;
        if (phoneValue !== undefined) editedInfo.phone = phoneValue;

        const addressUpdate = {};
        if (street !== undefined) addressUpdate.street = street;
        if (city !== undefined) addressUpdate.city = city;
        if (state !== undefined) addressUpdate.state = state;
        if (pincode !== undefined) addressUpdate.pincode = pincode;

        if (Object.keys(addressUpdate).length) {
            let shippingAddress = editedInfo.addresses.find((address) => address.type === "shipping");
            if (!shippingAddress) {
                shippingAddress = editedInfo.addresses.create({
                    type: "shipping",
                    isDefault: !editedInfo.addresses.some((address) => address.type === "shipping" && address.isDefault),
                });
                editedInfo.addresses.push(shippingAddress);
            }

            Object.assign(shippingAddress, addressUpdate);
        }

        await editedInfo.save();

        res.status(200).json({
            message: "User Info updated successfully",
            data: editedInfo
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { getUsers, getUsersById, updateUser };
