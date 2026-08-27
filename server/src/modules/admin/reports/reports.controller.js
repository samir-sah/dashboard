const reportsService = require('./reports.service');

const getOrderReports = async (req, res, next) => {
    try {
        const { period, _from, _to, page, limit } = req.query;
        const result = await reportsService.getOrderReports(period, _from, _to, page, limit);
        return res.status(200).json({
            success: true,
            data: result.data,
            total: result.total,
            page: result.page,
            pages: result.pages,
        });
    } catch (error) {
        next(error);
    }
};

const getRevenueReports = async (req, res, next) => {
    try {
        const { period, _from, _to, page, limit } = req.query;
        const result = await reportsService.getRevenueReports(period, _from, _to, page, limit);
        return res.status(200).json({
            success: true,
            data: result.data,
            total: result.total,
            page: result.page,
            pages: result.pages,
        });
    } catch (error) {
        next(error);
    }
};

const getReportsSummary = async (req, res, next) => {
    try {
        const { _from, _to } = req.query;
        const data = await reportsService.getReportsSummary(_from, _to);
        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getOrderReports, getRevenueReports, getReportsSummary };
