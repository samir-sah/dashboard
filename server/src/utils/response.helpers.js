/**
 * Standardized API response helpers.
 *
 * These helpers unify the inconsistent response formats across the codebase
 * (some controllers use { success, data }, others { message, data }, etc.)
 *
 * Usage in controllers:
 *   const { sendSuccess, sendError } = require('../../utils/response.helpers');
 *   return sendSuccess(res, data, 'Order created', 201);
 *   return sendError(res, 'Order not found', 404);
 */

/**
 * Send a standardized success response.
 *
 * @param {object} res         - Express response object
 * @param {*}      data        - Response payload
 * @param {string} [message]   - Optional success message
 * @param {number} [statusCode=200] - HTTP status code
 */
const sendSuccess = (res, data, message, statusCode = 200) => {
    const response = { success: true };

    if (message) response.message = message;
    if (data !== undefined) response.data = data;

    return res.status(statusCode).json(response);
};

/**
 * Send a standardized error response.
 *
 * @param {object} res         - Express response object
 * @param {string} message     - Error message
 * @param {number} [statusCode=500] - HTTP status code
 * @param {object} [errors]    - Optional validation errors
 */
const sendError = (res, message, statusCode = 500, errors) => {
    const response = {
        success: false,
        message,
    };

    if (errors) response.errors = errors;

    return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendError };
