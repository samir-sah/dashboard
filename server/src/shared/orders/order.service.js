const orderModel = require("../../models/orders.model");
const productModels = require("../../models/product.model");
const {
  validateAndDeductStock,
  restoreStock,
} = require("../inventory/inventory.service");
const { createPaymentAttempt } = require("../payments/payment.service");
const { PAYMENT_METHODS } = require("../../models/payment.model");
const mongoose = require("mongoose");
const ApiError = require("../../utils/ApiError");
const userModel = require("../../models/user.model");
const logger = require("../../utils/logger");
const {
  normalizeOrderStatus,
  normalizedLatestStatusExpr,
} = require("./orderStatus.utils");
const { resolveCustomerName } = require("../../utils/name.utils");

const getOrders = async (query, user) => {
  const {
    page = 1,
    limit = 7,
    status,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const filter = {};
  if (user?.role === "customer") {
    filter.userId = user.id;
  }

  if (status && status !== "All") {
    if (status === "In Cart") {
      filter.isInCart = true;
    } else {
      filter.isInCart = false;
      filter.$expr = { $eq: [normalizedLatestStatusExpr, status] };
      if (status !== "Cancelled") filter["payment.status"] = "Completed";
    }
  } else {
    filter.isInCart = false;
    filter.$or = [
      { "payment.status": "Completed" },
      { $expr: { $eq: [normalizedLatestStatusExpr, "Cancelled"] } }
    ];
  }

  if (search?.trim()) {
    filter.orderId = { $regex: search.trim(), $options: "i" };
  }

  const SORTABLE_FIELDS = {
    createdAt: "createdAt",
    orderDate: "orderDate",
    totalAmount: "totalAmount",
  };
  const sortField = SORTABLE_FIELDS[sortBy] ?? "createdAt";
  const sortDirection = sortOrder === "asc" ? 1 : -1;

  const [orders, total] = await Promise.all([
    orderModel
      .find(filter)
      .populate("userId", "firstName lastName email phone")
      .sort({ [sortField]: sortDirection })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean(),
    orderModel.countDocuments(filter),
  ]);

  const formattedOrders = orders.map(order => {
    if (order.userId) {
      order.userId.displayName = resolveCustomerName(order.userId, order);
    }
    return order;
  });

  return {
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    orders: formattedOrders,
  };
};

const getOrderById = async (orderId) => {
  const order = await orderModel.findOne({ orderId });
  if (!order) throw ApiError.notFound("Order not found");
  return order;
};

const getOrderStats = async () => {
  const realOrderFilter = { isInCart: false };
  const paymentFilter = { $or: [{ "payment.status": "Completed" }, { latestStatus: "Cancelled" }] };

  const [inCart, statusCounts, unitsAgg] = await Promise.all([
    orderModel.countDocuments({ isInCart: true }),
    orderModel.aggregate([
      { $match: realOrderFilter },
      { $addFields: { latestStatus: normalizedLatestStatusExpr } },
      { $match: paymentFilter },
      { $group: { _id: "$latestStatus", count: { $sum: 1 } } },
    ]),
    orderModel.aggregate([
      { $match: { ...realOrderFilter, "payment.status": "Completed" } },
      { $unwind: "$orderItems" },
      { $group: { _id: null, totalUnits: { $sum: "$orderItems.quantity" } } },
    ]),
  ]);

  const countMap = {};
  statusCounts.forEach((s) => {
    countMap[s._id] = s.count;
  });
  const confirmed = countMap["Confirmed"] || 0;
  const processing = countMap["Processing"] || 0;
  const shipped = countMap["Shipped"] || 0;
  const delivered = countMap["Delivered"] || 0;
  const cancelled = countMap["Cancelled"] || 0;
  const total = confirmed + processing + shipped + delivered;
  const totalUnitsSold = unitsAgg[0] ? unitsAgg[0].totalUnits : 0;

  return {
    total,
    inCart,
    confirmed,
    processing,
    shipped,
    delivered,
    cancelled,
    totalUnitsSold,
  };
};

const getUserOrderHistory = async (userId, userAuth, page = 1, limit = 10) => {
  if (userAuth && userAuth.role === "Customer" && userAuth.id !== userId) {
    throw ApiError.forbidden("Access denied");
  }

  const orders = await orderModel
    .find({ userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .select(
      "orderId orderDate totalAmount statusHistory payment shippingCharges orderItems",
    );

  const total = await orderModel.countDocuments({ userId });

  if (orders.length === 0) {
    throw ApiError.notFound("No orders found for this user");
  }

  return { total, page: Number(page), pages: Math.ceil(total / limit), orders };
};

const getUsersOrderById = async (userId, orderId, userAuth) => {
  if (userAuth && userAuth.role === "Customer" && userAuth.id !== userId) {
    throw ApiError.forbidden("Access denied");
  }

  // const orderId = orderId.toString()
  const order = await orderModel.findOne({ orderId, userId });
  if (!order) throw ApiError.notFound("Order not found");
  return order;
};

const createOrder = async (orderData) => {
  const { userId, productId, quantity } = orderData;
  if (!productId) {
    throw ApiError.badRequest("productId is required");
  }
  const product = await productModels.findById(productId).lean();
  if (!product) {
    throw ApiError.notFound("Product not found");
  }

  const orderItems = [
    {
      productId: productId,
      productName: product.productName,
      sku: product.sku,
      hsnCode: product.hsnCode,
      taxRate: product.taxRate || 0,
      quantity: quantity || 1,
      price: product.price,
    },
  ];
  const newOrder = {
    userId,
    orderItems,
    isInCart: true,
    statusHistory: [{ status: "Pending", updatedAt: new Date() }],
  };
  const addedOrder = await orderModel.create(newOrder);
  return { orderId: addedOrder._id };
};

const checkoutOrder = async (orderData) => {
  const {
    orderId,
    userId,
    fullName,
    phoneNumber,
    shippingAddressLine1,
    shippingStreet,
    shippingCity,
    shippingState,
    shippingPincode,
    shippingCountry,
    billingAddressLine1,
    billingStreet,
    billingCity,
    billingState,
    billingPincode,
    billingCountry,
    productId,
    quantity,
    shippingCharges,
    paymentMethod,
  } = orderData;

  if (!quantity || !paymentMethod || !productId) {
    throw ApiError.badRequest(
      "Product id, Quantity, and payment method are required",
    );
  }

  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    throw ApiError.badRequest(
      `Invalid payment method '${paymentMethod}'. Must be one of: ${PAYMENT_METHODS.join(', ')}`,
    );
  }

  const product = await productModels.findById(productId).lean();
  if (!product) {
    throw ApiError.notFound("Product not found");
  }

  const orderItems = [
    {
      productId: productId,
      productName: product.productName,
      sku: product.sku,
      hsnCode: product.hsnCode,
      taxRate: product.taxRate || 0,
      quantity,
      price: product.price,
    },
  ];

  const total = quantity * product.price;
  const orderDate = new Date();
  const expectedArriveDate = new Date(orderDate);
  expectedArriveDate.setDate(orderDate.getDate() + 7);
  const user = await userModel.findById(userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  if (!user.firstName?.trim() && !fullName?.trim()) {
    throw ApiError.badRequest("Customer full name is required before checkout");
  }

  const address = {
    shippingAddress: {
      fullName: fullName || `${user.firstName} ${user.lastName}`,
      phone: phoneNumber || user.phone,
      addressLine1: shippingAddressLine1 || "",
      street: shippingStreet,
      city: shippingCity,
      state: shippingState,
      pincode: shippingPincode,
      country: shippingCountry,
    },
    billingAddress: {
      addressLine1: billingAddressLine1 || "",
      street: billingStreet,
      city: billingCity,
      state: billingState,
      pincode: billingPincode,
      country: billingCountry,
    },
  };

  const session = await mongoose.startSession();
  try {
    let addedOrder;
    await session.withTransaction(async () => {
      try {
        await validateAndDeductStock(orderItems, { session });
      } catch (stockError) {
        const statusCode = stockError.statusCode || 400;
        throw new ApiError(statusCode, stockError.message);
      }

      // Update order — NO direct payment write; payment state is managed
      // exclusively through the payments collection + syncOrderPaymentState()
      addedOrder = await orderModel.findByIdAndUpdate(
        orderId,
        {
          customer: address,
          quantity,
          totalAmount: total + (shippingCharges || 0),
          expectedArriveDate,
          shippingCharges: shippingCharges || 0,
          isInCart: false,
          $push: {
            statusHistory: { status: "Confirmed", updatedAt: new Date() },
          },
        },
        { new: true, session },
      );

      // Create payment attempt in payments collection;
      // createPaymentAttempt already calls syncOrderPaymentState() internally
      await createPaymentAttempt({
        orderId: addedOrder._id,
        userId,
        amount: addedOrder.totalAmount,
        method: paymentMethod,
        status: 'Pending',
        note: 'Checkout payment initialized',
      }, { session });

      // Save address to user profile
      // user.addresses is an array of { type, fullName, phone, street, ... , isDefault }
      const shippingAddr = {
        type: "shipping",
        fullName: fullName || `${user.firstName} ${user.lastName}`,
        phone: phoneNumber || user.phone,
        addressLine1: shippingAddressLine1 || "",
        street: shippingStreet,
        city: shippingCity,
        state: shippingState,
        pincode: shippingPincode,
        country: shippingCountry,
        isDefault: true,
      };

      const billingAddr = {
        type: "billing",
        fullName: fullName || `${user.firstName} ${user.lastName}`,
        phone: phoneNumber || user.phone,
        addressLine1: billingAddressLine1 || "",
        street: billingStreet,
        city: billingCity,
        state: billingState,
        pincode: billingPincode,
        country: billingCountry,
        isDefault: true,
      };

      // Clear old defaults before pushing new ones
      await userModel.updateOne(
        {
          _id: userId,
          "addresses.type": "shipping",
          "addresses.isDefault": true,
        },
        { $set: { "addresses.$.isDefault": false } },
        { session }
      );

      await userModel.updateOne(
        { _id: userId, "addresses.type": "billing", "addresses.isDefault": true },
        { $set: { "addresses.$.isDefault": false } },
        { session }
      );

      // Push new addresses
      await userModel.findByIdAndUpdate(
        userId,
        { $push: { addresses: { $each: [shippingAddr, billingAddr] } } },
        { new: true, session }
      );
    });
    
    return addedOrder;
  } finally {
    await session.endSession();
  }
};

const cancelOrder = async (orderIdObjId, cancelReason, cancelledByUserId) => {
  const order = await orderModel.findById(orderIdObjId);
  if (!order) throw ApiError.notFound("Order not found");

  const latestStatus = normalizeOrderStatus(
    order.statusHistory[order.statusHistory.length - 1]?.status,
  );
  if (latestStatus === "Delivered" || latestStatus === "Shipped") {
    throw ApiError.badRequest(
      `Cannot cancel a ${latestStatus.toLowerCase()} order`,
    );
  }

  const orderAlreadyCancelled = order.statusHistory.some(
    (item) => item.status === "Cancelled",
  );
  if (orderAlreadyCancelled) {
    return { message: "Order is already cancelled!", data: order };
  }

  const wasPaid = order.payment?.status === 'Completed';
  try {
    await restoreStock(order.orderItems, { decrementTotalSold: wasPaid });
  } catch (stockError) {
    await orderModel.findByIdAndUpdate(orderIdObjId, {
      $set: {
        stockRestoreFailed: true,
        stockRestoreFailureReason: stockError.message,
      },
    });
    logger.error({ err: stockError, orderId: orderIdObjId }, "Stock restore failed during cancellation");
  }

  const updateQuery = {
    $push: { statusHistory: { status: "Cancelled", updatedAt: new Date() } },
  };
  if (cancelReason) updateQuery.$set = { cancellationReason: cancelReason };
  if (cancelledByUserId) {
    updateQuery.$set = updateQuery.$set || {};
    updateQuery.$set.cancelledBy = cancelledByUserId;
  }

  const cancelledOrder = await orderModel.findByIdAndUpdate(
    orderIdObjId,
    updateQuery,
    { new: true },
  );
  return { message: "Order Cancelled successfully!", data: cancelledOrder };
};

const searchOrder = async (searchQuery) => {
  if (!searchQuery || searchQuery.trim() === "") {
    throw ApiError.badRequest("Search query is required");
  }

  const escapedSearch = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pipeline = [
    {
      $lookup: {
        from: "users",
        let: { userId: "$userId" },
        pipeline: [
          { $match: { $expr: { $eq: [{ $toString: "$_id" }, "$$userId"] } } },
          { $project: { firstName: 1, lastName: 1, email: 1 } },
        ],
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $match: {
        $or: [
          { orderId: { $regex: escapedSearch, $options: "i" } },
          { "user.firstName": { $regex: escapedSearch, $options: "i" } },
          { "user.lastName": { $regex: escapedSearch, $options: "i" } },
          { "user.email": { $regex: escapedSearch, $options: "i" } },
        ],
      },
    },
    { $sort: { orderDate: -1 } },
    { $skip: 0 },
    { $limit: 20 },
    {
      $project: {
        orderId: 1,
        orderDate: 1,
        totalAmount: 1,
        "user.firstName": 1,
        "user.lastName": 1,
        "user.email": 1,
        statusHistory: 1,
        "payment.status": 1,
        customer: 1,
      },
    },
  ];

  const orders = await orderModel.aggregate(pipeline);
  if (orders.length === 0) throw ApiError.notFound("No orders found");
  
  const formattedOrders = orders.map(order => {
    if (order.user) {
      order.user.displayName = resolveCustomerName(order.user, order);
    }
    return order;
  });
  
  return formattedOrders;
};

const updateOrderStatus = async (id) => {
  const orderStatus = await orderModel.findById(id);
  if (!orderStatus) throw ApiError.notFound("Order not found");

  const latestStatus = normalizeOrderStatus(
    orderStatus.statusHistory[orderStatus.statusHistory.length - 1]?.status,
  );
  if (latestStatus === "Delivered")
    return { message: "Order already delivered!" };

  if (orderStatus.payment?.status !== "Completed") {
    throw ApiError.badRequest(
      "Cannot advance order: payment has not been completed",
    );
  }

  const status =
    latestStatus === "Confirmed"
      ? "Processing"
      : latestStatus === "Processing"
        ? "Shipped"
        : latestStatus === "Shipped"
          ? "Delivered"
          : "Delivered";
  const changeOrderStatus = await orderModel.findByIdAndUpdate(
    id,
    { $push: { statusHistory: { status, updatedAt: new Date() } } },
    { new: true },
  );
  return { message: "order status changed", changeOrderStatus };
};

const updateOrder = async (orderId, updateData) => {
  const { status, shippingAddress, billingAddress } = updateData;
  const order = await orderModel.findOne({ orderId });
  if (!order) throw ApiError.notFound(`Order '${orderId}' not found`);

  const VALID_STATUSES = ["Confirmed", "Processing", "Shipped", "Delivered"];
  if (status === "Cancelled")
    throw ApiError.badRequest(
      "Use the cancellation endpoint (PUT /cancelorder/:id) to cancel orders",
    );
  if (status && !VALID_STATUSES.includes(status))
    throw ApiError.badRequest(
      `Invalid status '${status}'. Must be one of: ${VALID_STATUSES.join(", ")}`,
    );

  const $set = {};
  const $push = {};

  if (status) {
    if (order.payment?.status !== "Completed") {
      throw ApiError.badRequest(
        "Cannot update order status: payment has not been completed",
      );
    }
    const currentStatus = order.statusHistory?.length
      ? order.statusHistory[order.statusHistory.length - 1].status
      : null;
    if (status !== currentStatus)
      $push.statusHistory = { status, updatedAt: new Date() };
  }

  const REQUIRED_ADDRESS_FIELDS = [
    "street",
    "city",
    "state",
    "pincode",
    "country",
  ];
  const ALL_ADDRESS_FIELDS = ["addressLine1", ...REQUIRED_ADDRESS_FIELDS];

  if (shippingAddress) {
    const missing = REQUIRED_ADDRESS_FIELDS.filter(
      (f) => !shippingAddress[f]?.trim(),
    );
    if (missing.length)
      throw ApiError.badRequest(
        `Shipping address missing: ${missing.join(", ")}`,
      );
    ALL_ADDRESS_FIELDS.forEach((f) => {
      if (shippingAddress[f] !== undefined)
        $set[`customer.shippingAddress.${f}`] = (
          shippingAddress[f] || ""
        ).trim();
    });
  }

  if (billingAddress) {
    const missing = REQUIRED_ADDRESS_FIELDS.filter(
      (f) => !billingAddress[f]?.trim(),
    );
    if (missing.length)
      throw ApiError.badRequest(
        `Billing address missing: ${missing.join(", ")}`,
      );
    ALL_ADDRESS_FIELDS.forEach((f) => {
      if (billingAddress[f] !== undefined)
        $set[`customer.billingAddress.${f}`] = (billingAddress[f] || "").trim();
    });
  }

  if (!Object.keys($set).length && !Object.keys($push).length)
    throw ApiError.badRequest("No valid fields provided to update");

  const updateQuery = {};
  if (Object.keys($set).length) updateQuery.$set = $set;
  if (Object.keys($push).length) updateQuery.$push = $push;

  const updated = await orderModel.findOneAndUpdate({ orderId }, updateQuery, {
    new: true,
    runValidators: true,
  });
  return updated;
};

module.exports = {
  getOrders,
  getOrderById,
  getOrderStats,
  getUserOrderHistory,
  getUsersOrderById,
  createOrder,
  checkoutOrder,
  cancelOrder,
  searchOrder,
  updateOrderStatus,
  updateOrder,
};
