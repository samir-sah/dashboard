const orderModel = require('../../../models/orders.model');
const { normalizedLatestStatusExpr } = require('../../../shared/orders/orderStatus.utils');

// ── Helpers ──────────────────────────────────────────────────────────────

const TIMEZONE = 'Asia/Kolkata';
const DEFAULT_PAGE_SIZE = 10;

/**
 * Convert an IST date string (YYYY-MM-DD) to a UTC Date object.
 * Mirrors the pattern from admin.dashboard.service.js.
 *
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @param {boolean} isEnd  - If true, set time to 23:59:59.999 IST
 */
const convertISTtoUTC = (dateStr, isEnd = false) => {
    const date = new Date(dateStr);
    if (isEnd) {
        date.setHours(23, 59, 59, 999);
    } else {
        date.setHours(0, 0, 0, 0);
    }
    // IST is UTC+5:30
    return new Date(date.getTime() - 5.5 * 60 * 60 * 1000);
};

/**
 * Build a createdAt date filter from optional from/to strings.
 * When omitted, falls back to the provided defaultFloor date.
 */
const buildDateFilter = (from, to, defaultFloor) => {
    const start = from ? convertISTtoUTC(from) : defaultFloor;
    const end = to ? convertISTtoUTC(to, true) : new Date();

    const filter = {};
    if (start) filter.$gte = start;
    if (end) filter.$lte = end;

    return Object.keys(filter).length ? { createdAt: filter } : {};
};

/**
 * Compute a count via $cond on the derived latestStatus field.
 * Uses $last (current status) rather than $in (any historical status).
 * Consistent with getOrderStats() in order.service.js.
 */
const currentStatusCount = (status) => ({
    $sum: { $cond: [{ $eq: ['$latestStatus', status] }, 1, 0] },
});

/**
 * Normalise pagination params.
 */
const normalisePagination = (page, limit) => ({
    page: Math.max(1, Number(page) || 1),
    limit: Math.max(1, Math.min(100, Number(limit) || DEFAULT_PAGE_SIZE)),
});

// ── Order Reports ────────────────────────────────────────────────────────

/**
 * @param {'daily'|'weekly'|'monthly'} period
 * @param {string} [from] - Optional start date YYYY-MM-DD
 * @param {string} [to]   - Optional end date YYYY-MM-DD
 * @param {number} [page=1]
 * @param {number} [limit=10]
 */
const getOrderReports = async (period, from, to, page, limit) => {
    const pg = normalisePagination(page, limit);
    const now = new Date();
    let defaultFloor;
    let groupId;
    let projectFields;

    switch (period) {
        case 'daily': {
            // Default: last 30 days
            defaultFloor = new Date(now);
            defaultFloor.setDate(defaultFloor.getDate() - 30);

            groupId = {
                $dateToString: { format: '%d/%m/%Y', date: '$createdAt', timezone: TIMEZONE },
            };
            projectFields = {
                _id: 0,
                date: '$_id',
                orders: 1,
                shipped: 1,
                delivered: 1,
                cancelled: 1,
            };
            break;
        }
        case 'weekly': {
            // Default: last 12 weeks
            defaultFloor = new Date(now);
            defaultFloor.setDate(defaultFloor.getDate() - 84);

            groupId = {
                year: { $isoWeekYear: { date: '$createdAt', timezone: TIMEZONE } },
                week: { $isoWeek: { date: '$createdAt', timezone: TIMEZONE } },
            };
            projectFields = {
                _id: 0,
                week: { $concat: ['W', { $toString: '$_id.week' }, ' ', { $toString: '$_id.year' }] },
                orders: 1,
                shipped: 1,
                delivered: 1,
                cancelled: 1,
            };
            break;
        }
        case 'monthly': {
            // Default: last 12 months
            defaultFloor = new Date(now);
            defaultFloor.setMonth(defaultFloor.getMonth() - 12);

            groupId = {
                $dateToString: { format: '%m/%Y', date: '$createdAt', timezone: TIMEZONE },
            };
            projectFields = {
                _id: 0,
                month: '$_id',
                orders: 1,
                shipped: 1,
                delivered: 1,
                cancelled: 1,
            };
            break;
        }
    }

    const dateFilter = buildDateFilter(from, to, defaultFloor);

    const pipeline = [
        { $match: { ...dateFilter, isInCart: false } },
        // Derive current status from the last entry in statusHistory.
        { $addFields: { latestStatus: normalizedLatestStatusExpr } },
        { $match: { $or: [{ "payment.status": "Completed" }, { latestStatus: "Cancelled" }] } },
        {
            $group: {
                _id: groupId,
                orders: { $sum: { $cond: [{ $eq: ['$payment.status', 'Completed'] }, 1, 0] } },
                shipped: currentStatusCount('Shipped'),
                delivered: currentStatusCount('Delivered'),
                cancelled: currentStatusCount('Cancelled'),
            },
        },
        { $sort: { _id: 1 } },
        { $project: projectFields },
        {
            $facet: {
                metadata: [{ $count: 'total' }],
                data: [
                    { $skip: (pg.page - 1) * pg.limit },
                    { $limit: pg.limit },
                ],
            },
        },
    ];

    const [result] = await orderModel.aggregate(pipeline);
    const total = result.metadata[0]?.total || 0;

    return {
        data: result.data,
        total,
        page: pg.page,
        pages: Math.ceil(total / pg.limit),
    };
};

// ── Revenue Reports ──────────────────────────────────────────────────────

/**
 * @param {'monthly'|'quarterly'|'yearly'} period
 * @param {string} [from] - Optional start date YYYY-MM-DD
 * @param {string} [to]   - Optional end date YYYY-MM-DD
 * @param {number} [page=1]
 * @param {number} [limit=10]
 */
const getRevenueReports = async (period, from, to, page, limit) => {
    const pg = normalisePagination(page, limit);
    const now = new Date();
    let defaultFloor;
    let groupId;
    let projectFields;

    switch (period) {
        case 'monthly': {
            // Default: last 12 months
            defaultFloor = new Date(now);
            defaultFloor.setMonth(defaultFloor.getMonth() - 12);

            groupId = {
                $dateToString: { format: '%m/%Y', date: '$createdAt', timezone: TIMEZONE },
            };
            projectFields = {
                _id: 0,
                period: '$_id',
                revenue: 1,
                totalOrders: 1,
                averageOrderValue: { $round: ['$averageOrderValue', 2] },
            };
            break;
        }
        case 'quarterly': {
            // Default: last 8 quarters (~2 years)
            defaultFloor = new Date(now);
            defaultFloor.setMonth(defaultFloor.getMonth() - 24);

            groupId = {
                year: { $year: { date: '$createdAt', timezone: TIMEZONE } },
                quarter: {
                    $ceil: {
                        $divide: [{ $month: { date: '$createdAt', timezone: TIMEZONE } }, 3],
                    },
                },
            };
            projectFields = {
                _id: 0,
                period: {
                    $concat: ['Q', { $toString: '$_id.quarter' }, ' ', { $toString: '$_id.year' }],
                },
                revenue: 1,
                totalOrders: 1,
                averageOrderValue: { $round: ['$averageOrderValue', 2] },
            };
            break;
        }
        case 'yearly': {
            // Default: all time — no date floor
            defaultFloor = null;

            groupId = {
                $year: { date: '$createdAt', timezone: TIMEZONE },
            };
            projectFields = {
                _id: 0,
                period: { $toString: '$_id' },
                revenue: 1,
                totalOrders: 1,
                averageOrderValue: { $round: ['$averageOrderValue', 2] },
            };
            break;
        }
    }

    // Revenue = orders where payment.status === 'Completed'
    const revenueMatch = { 'payment.status': 'Completed' };
    const dateFilter = buildDateFilter(from, to, defaultFloor);
    const matchStage = { $match: { ...revenueMatch, ...dateFilter } };

    const pipeline = [
        matchStage,
        {
            $group: {
                _id: groupId,
                revenue: { $sum: '$totalAmount' },
                totalOrders: { $sum: 1 },
                averageOrderValue: { $avg: '$totalAmount' },
            },
        },
        { $sort: { _id: 1 } },
        { $project: projectFields },
        {
            $facet: {
                metadata: [{ $count: 'total' }],
                data: [
                    { $skip: (pg.page - 1) * pg.limit },
                    { $limit: pg.limit },
                ],
            },
        },
    ];

    const [result] = await orderModel.aggregate(pipeline);
    const total = result.metadata[0]?.total || 0;

    return {
        data: result.data,
        total,
        page: pg.page,
        pages: Math.ceil(total / pg.limit),
    };
};

// ── Reports Summary ──────────────────────────────────────────────────────

/**
 * Returns overall KPI figures for the reports page.
 * Uses a single $facet pipeline for efficiency.
 *
 * @param {string} [from] - Optional start date YYYY-MM-DD
 * @param {string} [to]   - Optional end date YYYY-MM-DD
 */
const getReportsSummary = async (from, to) => {
    const dateFilter = buildDateFilter(from, to, null);

    const pipeline = [
        { $match: { ...dateFilter, isInCart: false } },
        // Derive current status
        { $addFields: { latestStatus: { $last: '$statusHistory.status' } } },
        {
            $facet: {
                totals: [
                    { $match: { 'payment.status': 'Completed' } },
                    { $count: 'totalOrders' },
                ],
                revenue: [
                    { $match: { 'payment.status': 'Completed' } },
                    {
                        $group: {
                            _id: null,
                            totalRevenue: { $sum: '$totalAmount' },
                            paidOrders: { $sum: 1 },
                            averageOrderValue: { $avg: '$totalAmount' },
                        },
                    },
                ],
                delivered: [
                    { $match: { latestStatus: 'Delivered', 'payment.status': 'Completed' } },
                    { $count: 'count' },
                ],
                cancelled: [
                    { $match: { latestStatus: 'Cancelled' } },
                    { $count: 'count' },
                ],
            },
        },
    ];

    const [result] = await orderModel.aggregate(pipeline);

    return {
        totalOrders: result.totals[0]?.totalOrders || 0,
        totalRevenue: result.revenue[0]?.totalRevenue || 0,
        averageOrderValue: Math.round((result.revenue[0]?.averageOrderValue || 0) * 100) / 100,
        deliveredOrders: result.delivered[0]?.count || 0,
        cancelledOrders: result.cancelled[0]?.count || 0,
    };
};

module.exports = { getOrderReports, getRevenueReports, getReportsSummary };
