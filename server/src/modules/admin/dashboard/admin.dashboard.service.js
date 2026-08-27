const orderModel = require("../../../models/orders.model");
const userModel = require("../../../models/user.model");
const productModel = require("../../../models/product.model");
const ApiError = require("../../../utils/ApiError");
const {
    normalizedLatestStatusExpr,
    REAL_ORDER_FILTER,
} = require("../../../shared/orders/orderStatus.utils");

const TIMEZONE = 'Asia/Kolkata';
const STATUS_COLORS = {
    "In Cart": "#64748b",
    Confirmed: "#3b82f6",
    Processing: "#a855f7",
    Shipped: "#f97316",
    Delivered: "#22c55e",
    Cancelled: "#ef4444",
};
const GENDER_COLORS = {
    Male: "#3b82f6",
    Female: "#ec4899",
    Other: "#8b5cf6",
    "Prefer not to say": "#64748b",
    Unknown: "#94a3b8",
};

const convertISTtoUTC = (dateStr, isEnd = false) => {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) throw ApiError.badRequest("Invalid date format");
    if (isEnd) date.setHours(23, 59, 59, 999);
    else date.setHours(0, 0, 0, 0);
    return new Date(date.getTime() - 5.5 * 60 * 60 * 1000);
};

const startOfDay = (date) => {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
};

const addMonths = (date, count) => {
    const copy = new Date(date);
    copy.setMonth(copy.getMonth() + count);
    return copy;
};

const parseRange = (query = {}) => {
    const now = new Date();
    let start;
    let end;

    if (query.from || query.to) {
        start = query.from ? convertISTtoUTC(query.from) : null;
        end = query.to ? convertISTtoUTC(query.to, true) : now;
    } else {
        const range = query.range || "12m";
        end = now;
        start = startOfDay(now);

        if (range === "7d") start.setDate(start.getDate() - 6);
        else if (range === "30d") start.setDate(start.getDate() - 29);
        else if (range === "90d") start.setDate(start.getDate() - 89);
        else if (range === "12m") start = addMonths(start, -11);
        else throw ApiError.badRequest("range must be one of: 7d, 30d, 90d, 12m");
    }

    if (start && end && start > end) throw ApiError.badRequest("from/start date cannot be after to/end date");
    const filter = {};
    if (start || end) {
        filter.createdAt = {};
        if (start) filter.createdAt.$gte = start;
        if (end) filter.createdAt.$lte = end;
    }

    const duration = start ? Math.max(1, end.getTime() - start.getTime()) : 30 * 24 * 60 * 60 * 1000;
    const previousEnd = start ? new Date(start.getTime() - 1) : null;
    const previousStart = previousEnd ? new Date(previousEnd.getTime() - duration) : null;
    const previousFilter = previousStart && previousEnd
        ? { createdAt: { $gte: previousStart, $lte: previousEnd } }
        : {};

    return { start, end, filter, previousFilter };
};

const percentChange = (current, previous) => {
    if (!previous && !current) return 0;
    if (!previous) return null;
    return ((current - previous) / previous) * 100;
};

const formatPercent = (value) => {
    if (value === null) return "";
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
};

const formatINRShort = (value) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
    return `₹${Math.round(value || 0).toLocaleString("en-IN")}`;
};

const monthId = {
    $dateToString: { format: "%Y-%m", date: "$createdAt", timezone: TIMEZONE },
};

const monthProject = {
    month: {
        $dateToString: { format: "%b", date: { $dateFromString: { dateString: { $concat: ["$_id", "-01"] } } } },
    },
};

const revenueMatch = { "payment.status": "Completed" };

const getRevenueAndOrders = async (dateFilter = {}) => {
    const [result] = await orderModel.aggregate([
        { $match: { ...REAL_ORDER_FILTER, ...dateFilter } },
        {
            $facet: {
                orders: [{ $count: "count" }],
                revenue: [
                    { $match: revenueMatch },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$totalAmount" },
                            count: { $sum: 1 },
                            avg: { $avg: "$totalAmount" },
                        },
                    },
                ],
                units: [
                    { $unwind: "$orderItems" },
                    { $group: { _id: null, total: { $sum: "$orderItems.quantity" } } },
                ],
            },
        },
    ]);

    return {
        orders: result?.revenue?.[0]?.count || 0,
        revenue: result?.revenue?.[0]?.total || 0,
        paidOrders: result?.revenue?.[0]?.count || 0,
        averageOrderValue: result?.revenue?.[0]?.avg || 0,
        units: result?.units?.[0]?.total || 0,
    };
};

const countLatestStatuses = async (dateFilter = {}, statuses = []) => {
    const [result] = await orderModel.aggregate([
        { $match: { ...REAL_ORDER_FILTER, ...dateFilter } },
        { $addFields: { latestStatus: normalizedLatestStatusExpr } },
        { $match: { latestStatus: { $in: statuses } } },
        { $count: "count" },
    ]);

    return result?.count || 0;
};

const getMonthlyRevenue = async (dateFilter = {}) => orderModel.aggregate([
    { $match: { ...REAL_ORDER_FILTER, ...dateFilter, ...revenueMatch } },
    { $group: { _id: monthId, actualRevenue: { $sum: "$totalAmount" } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, key: "$_id", ...monthProject, actualRevenue: 1 } },
]);

const buildSparkline = (items, key) => {
    const values = items.map((item) => ({ value: item[key] || 0 }));
    return values.length ? values : [{ value: 0 }];
};

const getKpis = async (query) => {
    const { filter } = parseRange(query);
    const [summary, customers, monthly] = await Promise.all([
        getRevenueAndOrders(filter),
        userModel.countDocuments(),
        orderModel.aggregate([
            { $match: { ...REAL_ORDER_FILTER, ...filter } },
            {
                $group: {
                    _id: monthId,
                    revenue: { $sum: { $cond: [{ $eq: ["$payment.status", "Completed"] }, "$totalAmount", 0] } },
                    orders: { $sum: 1 },
                    customers: { $addToSet: "$userId" },
                },
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    revenue: 1,
                    orders: 1,
                    customers: { $size: "$customers" },
                    averageOrderValue: { $cond: [{ $gt: ["$orders", 0] }, { $divide: ["$revenue", "$orders"] }, 0] },
                },
            },
        ]),
    ]);

    return [
        {
            id: "total-revenue",
            label: "Total Revenue",
            value: formatINRShort(summary.revenue),
            comparisonText: "Selected Range Revenue",
            sparklineData: buildSparkline(monthly, "revenue"),
        },
        {
            id: "total-orders",
            label: "Total Orders",
            value: summary.orders.toLocaleString("en-IN"),
            comparisonText: "Selected Range Orders",
            sparklineData: buildSparkline(monthly, "orders"),
        },
        {
            id: "total-customers",
            label: "Total Customers",
            value: customers.toLocaleString("en-IN"),
            comparisonText: "Registered Customers",
            sparklineData: buildSparkline(monthly, "customers"),
        },
        {
            id: "avg-order-value",
            label: "Avg. Order Value",
            value: formatINRShort(summary.averageOrderValue),
            comparisonText: "Completed Payments",
            sparklineData: buildSparkline(monthly, "averageOrderValue"),
        },
    ];
};

const getInsightKpis = async (query) => {
    const { filter, previousFilter } = parseRange(query);
    const [current, previous, currentDelivered, previousDelivered, activeDeliveries, monthly] = await Promise.all([
        getRevenueAndOrders(filter),
        getRevenueAndOrders(previousFilter),
        countLatestStatuses(filter, ["Delivered"]),
        countLatestStatuses(previousFilter, ["Delivered"]),
        countLatestStatuses(filter, ["Confirmed", "Processing", "Shipped"]),
        orderModel.aggregate([
            { $match: { ...REAL_ORDER_FILTER, ...filter } },
            { $addFields: { latestStatus: normalizedLatestStatusExpr } },
            {
                $group: {
                    _id: monthId,
                    revenue: { $sum: { $cond: [{ $eq: ["$payment.status", "Completed"] }, "$totalAmount", 0] } },
                    orders: { $sum: 1 },
                    delivered: { $sum: { $cond: [{ $eq: ["$latestStatus", "Delivered"] }, 1, 0] } },
                    pendingDeliveries: {
                        $sum: { $cond: [{ $in: ["$latestStatus", ["Confirmed", "Processing", "Shipped"]] }, 1, 0] },
                    },
                },
            },
            { $sort: { _id: 1 } },
        ]),
    ]);

    const revenueGrowth = percentChange(current.revenue, previous.revenue);
    const orderGrowth = percentChange(current.orders, previous.orders);
    const deliveredGrowth = percentChange(currentDelivered, previousDelivered);

    return [
        {
            id: "todays-revenue",
            label: "Monthly Revenue",
            value: formatINRShort(current.revenue),
            trend: formatPercent(revenueGrowth),
            trendDirection: revenueGrowth >= 0 ? "up" : "down",
            comparisonText: "Selected Range",
            sparklineData: buildSparkline(monthly, "revenue"),
        },
        {
            id: "todays-orders",
            label: "Monthly Orders",
            value: current.orders.toLocaleString("en-IN"),
            trend: formatPercent(orderGrowth),
            trendDirection: orderGrowth >= 0 ? "up" : "down",
            comparisonText: "Selected Range",
            sparklineData: buildSparkline(monthly, "orders"),
        },
        {
            id: "active-deliveries-insight",
            label: "Active Deliveries",
            value: activeDeliveries.toLocaleString("en-IN"),
            comparisonText: "Current Active Deliveries",
            sparklineData: buildSparkline(monthly, "pendingDeliveries"),
        },
        {
            id: "delivered-orders-insight",
            label: "Delivered Orders",
            value: currentDelivered.toLocaleString("en-IN"),
            trend: formatPercent(deliveredGrowth),
            trendDirection: deliveredGrowth >= 0 ? "up" : "down",
            comparisonText: "Selected Range",
            sparklineData: buildSparkline(monthly, "delivered"),
        },
    ];
};

const getOrderStatus = async (query) => {
    const { filter } = parseRange(query);
    const rows = await orderModel.aggregate([
        { $match: filter },
        {
            $addFields: {
                bucket: { $cond: ["$isInCart", "In Cart", normalizedLatestStatusExpr] },
            },
        },
        { $match: { $or: [{ "payment.status": "Completed" }, { bucket: "Cancelled" }, { bucket: "In Cart" }] } },
        { $group: { _id: "$bucket", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
    ]);
    const total = rows.reduce((sum, row) => sum + row.count, 0);

    return {
        metric: total ? "Current Distribution" : "No Orders",
        data: rows.map((row) => ({
            name: row._id || "Unknown",
            count: row.count,
            value: total ? Math.round((row.count / total) * 100) : 0,
            fill: STATUS_COLORS[row._id] || "#64748b",
        })),
    };
};

const getOrdersVsUnits = async (query) => {
    const { filter } = parseRange(query);
    const data = await orderModel.aggregate([
        { $match: { ...REAL_ORDER_FILTER, ...filter, "payment.status": "Completed" } },
        { $unwind: { path: "$orderItems", preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: monthId,
                ordersSet: { $addToSet: "$_id" },
                units: { $sum: { $ifNull: ["$orderItems.quantity", 0] } },
            },
        },
        {
            $project: {
                _id: 0,
                key: "$_id",
                date: { $dateToString: { format: "%b", date: { $dateFromString: { dateString: { $concat: ["$_id", "-01"] } } } } },
                orders: { $size: "$ordersSet" },
                units: 1,
            },
        },
        { $sort: { key: 1 } },
    ]);
    const last = data[data.length - 1] || { orders: 0, units: 0 };
    const avg = last.orders ? (last.units / last.orders).toFixed(1) : "0.0";

    return {
        metric: `${last.units.toLocaleString("en-IN")} Units / ${last.orders.toLocaleString("en-IN")} Orders`,
        growth: `Avg ${avg} Units/Order`,
        data,
    };
};

const getCustomerGrowth = async (query) => {
    const { filter, previousFilter } = parseRange(query);
    const [data, currentCount, previousCount] = await Promise.all([
        userModel.aggregate([
            { $match: filter },
            { $group: { _id: monthId, newCustomers: { $sum: 1 } } },
            {
                $project: {
                    _id: 0,
                    key: "$_id",
                    month: { $dateToString: { format: "%b", date: { $dateFromString: { dateString: { $concat: ["$_id", "-01"] } } } } },
                    newCustomers: 1,
                },
            },
            { $sort: { key: 1 } },
        ]),
        userModel.countDocuments(filter),
        userModel.countDocuments(previousFilter),
    ]);
    const growth = percentChange(currentCount, previousCount);
    const last = data[data.length - 1]?.newCustomers || 0;
    return {
        metric: `${last.toLocaleString("en-IN")} New Customers`,
        growth: formatPercent(growth),
        isPositive: growth >= 0,
        data,
    };
};

const getRevenueForecast = async (query) => {
    const { filter } = parseRange(query);
    const forecastMonths = Math.max(1, Math.min(12, Number(query.forecastMonths) || 3));
    const history = await getMonthlyRevenue(filter);

    const growthRates = [];
    for (let i = 1; i < history.length; i += 1) {
        const prev = history[i - 1].actualRevenue;
        const current = history[i].actualRevenue;
        if (prev > 0) growthRates.push((current - prev) / prev);
    }
    // Explainable forecast: average month-over-month growth from recent history, capped
    // to avoid one sparse month producing unrealistic projections.
    const avgGrowth = Math.max(-0.5, Math.min(0.5, growthRates.length ? growthRates.reduce((a, b) => a + b, 0) / growthRates.length : 0));
    const data = history.map((item) => ({ ...item, forecastRevenue: null, isProjected: false }));
    const last = history[history.length - 1];
    let baseRevenue = last?.actualRevenue || 0;
    let baseDate = last ? new Date(`${last.key}-01T00:00:00.000Z`) : new Date();

    if (last) {
        data.push({ key: last.key, month: last.month, actualRevenue: last.actualRevenue, forecastRevenue: last.actualRevenue, isProjected: false });
    }

    for (let i = 1; i <= forecastMonths; i += 1) {
        baseDate = addMonths(baseDate, 1);
        baseRevenue = Math.round(baseRevenue * (1 + avgGrowth));
        data.push({
            key: new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE, year: "numeric", month: "2-digit" }).format(baseDate).slice(0, 7),
            month: baseDate.toLocaleString("en-US", { month: "short" }),
            actualRevenue: null,
            forecastRevenue: baseRevenue,
            isProjected: true,
        });
    }

    return {
        metric: `${formatINRShort(last?.actualRevenue || 0)} Current`,
        growth: `Projected ${formatINRShort(data[data.length - 1]?.forecastRevenue || 0)}`,
        avgGrowthRate: avgGrowth,
        data,
    };
};

const getCustomerStats = async (query) => {
    const { filter, previousFilter } = parseRange(query);
    const [newCustomers, previousNewCustomers, returningAgg, totalCustomersWithOrders] = await Promise.all([
        userModel.countDocuments(filter),
        userModel.countDocuments(previousFilter),
        orderModel.aggregate([
            { $match: REAL_ORDER_FILTER },
            { $group: { _id: "$userId", orders: { $sum: 1 } } },
            {
                $facet: {
                    returning: [{ $match: { orders: { $gt: 1 } } }, { $count: "count" }],
                    purchasers: [{ $count: "count" }],
                },
            },
        ]),
        orderModel.distinct("userId"),
    ]);
    const returningCustomers = returningAgg[0]?.returning?.[0]?.count || 0;
    const purchasers = returningAgg[0]?.purchasers?.[0]?.count || totalCustomersWithOrders.length || 0;
    const repeatPurchaseRate = purchasers ? (returningCustomers / purchasers) * 100 : 0;
    const growth = percentChange(newCustomers, previousNewCustomers);

    return {
        newCustomers: { value: newCustomers, trend: formatPercent(growth) },
        returningCustomers: { value: returningCustomers, trend: "" },
        repeatPurchaseRate: { value: `${repeatPurchaseRate.toFixed(1)}%`, trend: "" },
    };
};

const getBusinessGrowth = async (query) => {
    const { filter, previousFilter } = parseRange(query);
    const [current, previous, trend] = await Promise.all([
        getRevenueAndOrders(filter),
        getRevenueAndOrders(previousFilter),
        getMonthlyRevenue(filter),
    ]);
    const revenueGrowth = percentChange(current.revenue, previous.revenue);
    const orderGrowth = percentChange(current.orders, previous.orders);
    
    let overallGrowth = null;
    if (revenueGrowth !== null || orderGrowth !== null) {
        overallGrowth = ((revenueGrowth || 0) + (orderGrowth || 0)) / 2;
    }

    return {
        overallGrowth: formatPercent(overallGrowth),
        revenueGrowth: formatPercent(revenueGrowth),
        orderGrowth: formatPercent(orderGrowth),
        trendData: trend.map((item) => ({ date: item.month, value: item.actualRevenue })),
    };
};

const getLowStockProducts = async (query) => {
    const limit = Math.max(1, Math.min(20, Number(query.limit) || 3));
    const products = await productModel.aggregate([
        { $match: { isActive: true, $expr: { $lte: ["$stock", "$lowStockThreshold"] } } },
        { $sort: { stock: 1 } },
        { $limit: limit },
        {
            $project: {
                _id: 0,
                id: "$_id",
                name: "$productName",
                remaining: "$stock",
                total: "$maxCapacity",
                status: { $cond: [{ $eq: ["$stock", 0] }, "out_of_stock", "critical"] },
            },
        },
    ]);
    return products;
};

const getStateOrders = async (query) => {
    const { filter, previousFilter } = parseRange(query);
    const limit = Math.max(1, Math.min(30, Number(query.limit) || 6));
    const [current, previous] = await Promise.all([
        orderModel.aggregate([
            { $match: { ...REAL_ORDER_FILTER, ...filter } },
            {
                $group: {
                    _id: { $ifNull: ["$customer.shippingAddress.state", "Unknown"] },
                    orders: { $sum: 1 },
                    revenue: { $sum: { $cond: [{ $eq: ["$payment.status", "Completed"] }, "$totalAmount", 0] } },
                },
            },
            { $sort: { orders: -1 } },
            { $limit: limit },
        ]),
        orderModel.aggregate([
            { $match: { ...REAL_ORDER_FILTER, ...previousFilter } },
            {
                $group: {
                    _id: { $ifNull: ["$customer.shippingAddress.state", "Unknown"] },
                    orders: { $sum: 1 },
                },
            },
        ]),
    ]);
    const previousMap = new Map(previous.map((item) => [item._id, item.orders]));

    return current.map((item, index) => {
        const growth = percentChange(item.orders, previousMap.get(item._id) || 0);
        return {
            rank: index + 1,
            state: item._id || "Unknown",
            orders: item.orders,
            revenueValue: item.revenue,
            revenue: formatINRShort(item.revenue),
            growth: formatPercent(growth),
        };
    });
};

const getGenderOrders = async (query) => {
    const { filter } = parseRange(query);
    const labels = {
        male: "Male",
        female: "Female",
        other: "Other",
        prefer_not_to_say: "Prefer not to say",
    };
    const rows = await orderModel.aggregate([
        { $match: { ...REAL_ORDER_FILTER, ...filter } },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "customer",
            },
        },
        { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
        { $group: { _id: { $ifNull: ["$customer.gender", "unknown"] }, value: { $sum: 1 } } },
        { $sort: { value: -1 } },
    ]);

    return rows.map((row) => {
        const name = labels[row._id] || "Unknown";
        return { name, value: row.value, fill: GENDER_COLORS[name] || "#94a3b8" };
    });
};

// Backwards-compatible legacy endpoints.
const getDashboardKpis = async (startDate, endDate) => {
    const data = await getRevenueAndOrders({
        ...(startDate || endDate ? parseRange({ from: startDate, to: endDate }).filter : {}),
    });
    return [{
        totalOrders: data.orders,
        shippedOrders: 0,
        deliveredOrders: 0,
        inTransitOrders: 0,
        cancelledOrders: 0,
        inCart: 0,
        totalRevenue: data.revenue,
    }];
};

const getDashboardCharts = async (startDate, endDate) => {
    const query = startDate || endDate ? { from: startDate, to: endDate } : { range: "30d" };
    const [status, summary] = await Promise.all([getOrderStatus(query), getRevenueAndOrders(parseRange(query).filter)]);
    return [{
        totalMonthlyOrders: summary.orders,
        orderStatus: status.data.reduce((acc, item) => ({ ...acc, [item.name]: item.count }), {}),
        totalMonthlyRevenue: summary.revenue,
    }];
};

module.exports = {
    getDashboardKpis,
    getDashboardCharts,
    getKpis,
    getInsightKpis,
    getOrderStatus,
    getOrdersVsUnits,
    getCustomerGrowth,
    getRevenueForecast,
    getCustomerStats,
    getBusinessGrowth,
    getLowStockProducts,
    getStateOrders,
    getGenderOrders,
};
