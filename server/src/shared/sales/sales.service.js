const mongoose = require('mongoose');
const orderModel = require('../../models/orders.model');
const { normalizedLatestStatusExpr } = require('../orders/orderStatus.utils');

const TIMEZONE = 'Asia/Kolkata';

const confirmedOrderMatch = {
    isInCart: false,
    latestStatus: { $ne: 'Cancelled' },
    'payment.status': 'Completed',
};

const confirmedAtExpr = {
    $let: {
        vars: {
            confirmedEntries: {
                $filter: {
                    input: '$statusHistory',
                    as: 'entry',
                    cond: { $eq: ['$$entry.status', 'Confirmed'] },
                },
            },
        },
        in: {
            $ifNull: [
                { $arrayElemAt: ['$$confirmedEntries.updatedAt', -1] },
                '$orderDate',
            ],
        },
    },
};

const buildDateBuckets = (startDate, days, rows) => {
    const trend = [];
    for (let i = 0; i < days; i += 1) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        
        // Format as YYYY-MM-DD using timezone explicitly
        const dateString = new Intl.DateTimeFormat('en-CA', { 
            timeZone: TIMEZONE, 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        }).format(d);
        
        const saleRecord = rows.find((row) => row._id === dateString);
        trend.push({
            date: dateString,
            unitsSold: saleRecord ? saleRecord.unitsSold : 0,
        });
    }
    return trend;
};

const getSalesTrend = async (productId, days = 30) => {
    const safeDays = Math.max(1, Number(days) || 30);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - safeDays + 1);
    startDate.setHours(0, 0, 0, 0);

    const sales = await orderModel.aggregate([
        { $addFields: { latestStatus: normalizedLatestStatusExpr, confirmedAt: confirmedAtExpr } },
        { $match: { ...confirmedOrderMatch, confirmedAt: { $gte: startDate } } },
        { $unwind: '$orderItems' },
        { $match: { 'orderItems.productId': new mongoose.Types.ObjectId(productId) } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$confirmedAt', timezone: TIMEZONE } },
                unitsSold: { $sum: '$orderItems.quantity' },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    return buildDateBuckets(startDate, safeDays, sales);
};

const getConfirmedUnitsSold = async (productId, sinceDate) => {
    const match = { ...confirmedOrderMatch };
    if (sinceDate) match.confirmedAt = { $gte: sinceDate };

    const rows = await orderModel.aggregate([
        { $addFields: { latestStatus: normalizedLatestStatusExpr, confirmedAt: confirmedAtExpr } },
        { $match: match },
        { $unwind: '$orderItems' },
        { $match: { 'orderItems.productId': new mongoose.Types.ObjectId(productId) } },
        { $group: { _id: null, totalUnits: { $sum: '$orderItems.quantity' } } },
    ]);

    return rows[0]?.totalUnits || 0;
};

module.exports = {
    getSalesTrend,
    getConfirmedUnitsSold,
};
