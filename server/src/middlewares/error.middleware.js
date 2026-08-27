/**
 * Centralized error-handling middleware.
 *
 * Must be mounted AFTER all routes in app.js.
 * Catches ApiError instances (operational) and unexpected errors.
 */
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    // Default values
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation error';
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(statusCode).json({
            success: false,
            message,
            errors,
        });
    }

    // Mongoose cast error (invalid ObjectId, etc.)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {}).join(', ');
        message = `Duplicate value for: ${field}`;
    }

    // Log unexpected (non-operational) errors
    if (!(err instanceof ApiError) || !err.isOperational) {
        logger.error({ err }, 'Unhandled request error');
    }

    return res.status(statusCode).json({
        success: false,
        message,
    });
};

module.exports = errorHandler;
