const dashboardService = require('./admin.dashboard.service');

const sendDashboardResponse = (res, message, data) => (
    res.status(200).json({ success: true, message, data })
);

const sendDashboardError = (res, error) => (
    res.status(error.statusCode || 500).json({ success: false, message: error.message })
);

const getdashboardKpis = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await dashboardService.getDashboardKpis(startDate, endDate);
        
        res.status(200).json({
            message: "Dashboard KPIs",
            data,
        });
    } catch (error) {
        if (error.isOperational && error.statusCode === 404) {
             // Preserving the old specific error response shape for this 404
             return res.status(404).json({
                error: "No data found for the specified date range",
                details: {
                  // extracting the dates from the error message we threw for compatibility
                  startDate: req.query.startDate || "Not specified",
                  endDate: req.query.endDate || "Not specified",
                },
             });
        }
        next(error);
    }
};

const getdashboardCharts = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const data = await dashboardService.getDashboardCharts(startDate, endDate);
        
        res.status(200).json({
            message: "Dashboard  Monthly Chart Data",
            data,
        });
    } catch (error) {
        if (error.isOperational && error.statusCode === 404) {
            // Preserving old specific error response shape
            return res.status(404).json({
                error: "No data found for the current month",
                details: {
                  month: req.query.startDate || null,
                  year: req.query.endDate || null,
                },
            });
        }
        if (error.isOperational && error.statusCode === 400) {
            return res.status(400).json({ error: error.message });
        }
        next(error);
    }
};

const getKpis = async (req, res) => {
    try {
        const data = await dashboardService.getKpis(req.query);
        return sendDashboardResponse(res, "Dashboard KPIs fetched successfully", data);
    } catch (error) {
        return sendDashboardError(res, error);
    }
};

const getInsightKpis = async (req, res) => {
    try {
        const data = await dashboardService.getInsightKpis(req.query);
        return sendDashboardResponse(res, "Dashboard insight KPIs fetched successfully", data);
    } catch (error) {
        return sendDashboardError(res, error);
    }
};

const getOrderStatus = async (req, res) => {
    try {
        const data = await dashboardService.getOrderStatus(req.query);
        return sendDashboardResponse(res, "Order status chart fetched successfully", data);
    } catch (error) {
        return sendDashboardError(res, error);
    }
};

const getOrdersVsUnits = async (req, res) => {
    try {
        const data = await dashboardService.getOrdersVsUnits(req.query);
        return sendDashboardResponse(res, "Orders vs units chart fetched successfully", data);
    } catch (error) {
        return sendDashboardError(res, error);
    }
};

const getCustomerGrowth = async (req, res) => {
    try {
        const data = await dashboardService.getCustomerGrowth(req.query);
        return sendDashboardResponse(res, "Customer growth chart fetched successfully", data);
    } catch (error) {
        return sendDashboardError(res, error);
    }
};

const getRevenueForecast = async (req, res) => {
    try {
        const data = await dashboardService.getRevenueForecast(req.query);
        return sendDashboardResponse(res, "Revenue forecast fetched successfully", data);
    } catch (error) {
        return sendDashboardError(res, error);
    }
};

const getCustomerStats = async (req, res) => {
    try {
        const data = await dashboardService.getCustomerStats(req.query);
        return sendDashboardResponse(res, "Customer stats fetched successfully", data);
    } catch (error) {
        return sendDashboardError(res, error);
    }
};

const getBusinessGrowth = async (req, res) => {
    try {
        const data = await dashboardService.getBusinessGrowth(req.query);
        return sendDashboardResponse(res, "Business growth fetched successfully", data);
    } catch (error) {
        return sendDashboardError(res, error);
    }
};

const getLowStockProducts = async (req, res) => {
    try {
        const data = await dashboardService.getLowStockProducts(req.query);
        return sendDashboardResponse(res, "Low stock products fetched successfully", data);
    } catch (error) {
        return sendDashboardError(res, error);
    }
};

const getStateOrders = async (req, res) => {
    try {
        const data = await dashboardService.getStateOrders(req.query);
        return sendDashboardResponse(res, "State orders fetched successfully", data);
    } catch (error) {
        return sendDashboardError(res, error);
    }
};

const getGenderOrders = async (req, res) => {
    try {
        const data = await dashboardService.getGenderOrders(req.query);
        return sendDashboardResponse(res, "Gender orders fetched successfully", data);
    } catch (error) {
        return sendDashboardError(res, error);
    }
};

module.exports = {
    getdashboardKpis,
    getdashboardCharts,
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
