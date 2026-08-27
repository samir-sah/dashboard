const ApiError = require('../../../utils/ApiError');

const VALID_ORDER_PERIODS = ['daily', 'weekly', 'monthly'];
const VALID_REVENUE_PERIODS = ['monthly', 'quarterly', 'yearly'];

/**
 * Validates and normalises the `period` query param for order reports.
 * Defaults to 'daily' when absent.
 */
const validateOrderPeriod = (req, _res, next) => {
    const period = (req.query.period || 'daily').toLowerCase();

    if (!VALID_ORDER_PERIODS.includes(period)) {
        return next(
            ApiError.badRequest(
                `Invalid period "${req.query.period}". Allowed values: ${VALID_ORDER_PERIODS.join(', ')}`
            )
        );
    }

    req.query.period = period;
    next();
};

/**
 * Validates and normalises the `period` query param for revenue reports.
 * Defaults to 'monthly' when absent.
 */
const validateRevenuePeriod = (req, _res, next) => {
    const period = (req.query.period || 'monthly').toLowerCase();

    if (!VALID_REVENUE_PERIODS.includes(period)) {
        return next(
            ApiError.badRequest(
                `Invalid period "${req.query.period}". Allowed values: ${VALID_REVENUE_PERIODS.join(', ')}`
            )
        );
    }

    req.query.period = period;
    next();
};

/**
 * Validates optional `from` and `to` date query params (YYYY-MM-DD).
 * Ensures from ≤ to when both are provided.
 * Attaches parsed Date objects as req.query._from / req.query._to.
 */
const validateDateRange = (req, _res, next) => {
    const { from, to } = req.query;

    if (from) {
        const parsed = new Date(from);
        if (isNaN(parsed.getTime())) {
            return next(ApiError.badRequest(`Invalid "from" date: "${from}". Use YYYY-MM-DD format.`));
        }
        req.query._from = from;
    }

    if (to) {
        const parsed = new Date(to);
        if (isNaN(parsed.getTime())) {
            return next(ApiError.badRequest(`Invalid "to" date: "${to}". Use YYYY-MM-DD format.`));
        }
        req.query._to = to;
    }

    if (from && to) {
        if (new Date(from) > new Date(to)) {
            return next(ApiError.badRequest(`"from" date (${from}) cannot be after "to" date (${to}).`));
        }
    }

    next();
};

module.exports = { validateOrderPeriod, validateRevenuePeriod, validateDateRange };
