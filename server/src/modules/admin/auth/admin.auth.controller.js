const authService = require('./admin.auth.service');
const { sendSuccess, sendError } = require('../../../utils/response.helpers');

const ACCESS_COOKIE_NAME = "admin_access_token";
const REFRESH_COOKIE_NAME = "admin_refresh_token";
const ACCESS_COOKIE_MAX_AGE = 45 * 60 * 1000;  // must match JWT expiresIn in jwt.utils.js
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const authCookieOptions = (maxAge) => ({
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge,
});

const sendOTP = async (req, res, next) => {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber) {
            return sendError(res, "Phone number is required", 400);
        }

        await authService.sendOTP(phoneNumber);

        res.status(200).json({
            message: "OTP sent successfully",
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

const verifyAndLogin = async (req, res, next) => {
    try {
        const { phoneNumber, otp } = req.body;
        if (!phoneNumber || !otp) {
            return sendError(res, "Phone number and OTP are required", 400);
        }

        const { user, accessToken, refreshToken } = await authService.verifyAndLogin(phoneNumber, otp);

        res.cookie(ACCESS_COOKIE_NAME, accessToken, authCookieOptions(ACCESS_COOKIE_MAX_AGE));
        res.cookie(REFRESH_COOKIE_NAME, refreshToken, authCookieOptions(REFRESH_COOKIE_MAX_AGE));

        return res.status(200).json({
            message: "OTP is verified and you are logged In successfully",
            success: true,
            user: {
                name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
                role: user.role
            }
        });
    } catch (error) {
        // Keeping the exact response format if it's not an ApiError
        if (error.isOperational) {
            return res.status(error.statusCode).json({ message: error.message, success: false });
        }
        next(error);
    }
};

const resendOTP = async (req, res, next) => {
    try {
        const { phone } = req.body; // Original code used 'phone' here but 'phoneNumber' in sendOTP
        if (!phone) {
            return res.status(400).json({ message: "Phone number is required" });
        }

        await authService.resendOTP(phone);

        res.status(200).json({
            message: "OTP resent successfully",
            success: true,
        });
    } catch (error) {
        next(error);
    }
};

const refreshAccessToken = async (req, res, next) => {
    try {
        const refreshTokenStr = req.cookies[REFRESH_COOKIE_NAME] || req.cookies.refreshToken || req.body.refreshToken;
        if (!refreshTokenStr) {
            return res.status(401).json({ message: "Refresh token is required!" });
        }

        const newAccessToken = await authService.refreshAccessToken(refreshTokenStr);
        res.cookie(ACCESS_COOKIE_NAME, newAccessToken, authCookieOptions(ACCESS_COOKIE_MAX_AGE));

        res.status(200).json({
            message: "Access token refreshed successfully",
            success: true,
        });
    } catch (error) {
        if (error.isOperational) {
            return res.status(error.statusCode).json({ message: error.message, error: error.message });
        }
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        if (req.user?.id) {
            await authService.logout(req.user.id);
        }
        res.clearCookie(ACCESS_COOKIE_NAME, { ...authCookieOptions(0), maxAge: undefined });
        res.clearCookie(REFRESH_COOKIE_NAME, { ...authCookieOptions(0), maxAge: undefined });
        res.status(200).json({ message: "Logout successful", success: true });
    } catch (error) {
        next(error);
    }
};

const demoLogin = async (req, res, next) => {
    try {
        const { user, accessToken, refreshToken } = await authService.demoLogin();

        res.cookie(ACCESS_COOKIE_NAME, accessToken, authCookieOptions(ACCESS_COOKIE_MAX_AGE));
        res.cookie(REFRESH_COOKIE_NAME, refreshToken, authCookieOptions(REFRESH_COOKIE_MAX_AGE));

        return res.status(200).json({
            message: "Demo login successful",
            success: true,
            user: {
                name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
                role: user.role
            }
        });
    } catch (error) {
        if (error.isOperational) {
            return res.status(error.statusCode).json({ message: error.message, success: false });
        }
        next(error);
    }
};

module.exports = { sendOTP, verifyAndLogin, resendOTP, refreshAccessToken, logout, demoLogin };
