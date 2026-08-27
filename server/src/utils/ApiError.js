/**
 * Custom API Error class for operational errors.
 *
 * Replaces the ad-hoc pattern:
 *   const error = new Error('...');
 *   error.statusCode = 404;
 *   throw error;
 *
 * Usage:
 *   throw new ApiError(404, 'Order not found');
 *   throw ApiError.badRequest('Missing required field');
 */
class ApiError extends Error {
    /**
     * @param {number} statusCode - HTTP status code
     * @param {string} message    - Error message
     * @param {boolean} [isOperational=true] - Whether this is an expected operational error
     */
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.name = 'ApiError';

        // Capture stack trace, excluding constructor call from it
        Error.captureStackTrace(this, this.constructor);
    }

    // ── Factory methods ─────────────────────────────────────────────────

    static badRequest(message = 'Bad request') {
        return new ApiError(400, message);
    }

    static unauthorized(message = 'Unauthorized') {
        return new ApiError(401, message);
    }

    static forbidden(message = 'Forbidden') {
        return new ApiError(403, message);
    }

    static notFound(message = 'Not found') {
        return new ApiError(404, message);
    }

    static conflict(message = 'Conflict') {
        return new ApiError(409, message);
    }

    static internal(message = 'Internal server error') {
        return new ApiError(500, message, false);
    }
}

module.exports = ApiError;
