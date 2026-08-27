const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const verifyAccessToken = (token, req, res, next) => {
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: "Access token has expired. Please refresh it.",
                code: 'TOKEN_EXPIRED'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({
                message: "Invalid access token"
            });
        }
 
        res.status(403).json({
            message: "Authentication failed",
            error: error.message
        });
    }
};

// Main client authentication middleware. Kept header-based for client-site compatibility.
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: "Access token is required!"
        });
    }

    return verifyAccessToken(authHeader.split(' ')[1], req, res, next);
};

// Admin dashboard authentication supports the httpOnly JWT cookie set by admin auth.
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const allowBearerFallback = process.env.NODE_ENV !== 'production'
        || process.env.ADMIN_ALLOW_BEARER_TOKEN === 'true';
    const token = req.cookies?.admin_access_token
        || (allowBearerFallback && authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

    if (!token) {
        return res.status(401).json({
            message: "Access token is required!"
        });
    }

    return verifyAccessToken(token, req, res, next);
};
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
 
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
      });
    }
 
    next();
  };
};
 
module.exports = {authenticate, authenticateAdmin, authorize}
