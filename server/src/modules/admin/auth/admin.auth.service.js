const adminModels = require("../../../models/admin.model");
const bcrypt = require("bcrypt");
const axios = require("axios");
const { generateAccessToken, generateRefreshToken } = require("../../../utils/jwt.utils");
const jwt = require("jsonwebtoken");
const ApiError = require("../../../utils/ApiError");
const crypto = require("crypto");

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const ADMIN_ROLES = new Set(["Admin"]);

const generateOTP = () => {
    return crypto.randomInt(100000, 1000000).toString();
};

const findAdminByPhoneOrThrow = async (phoneNumber) => {
    const user = await adminModels.findOne({ phoneNumber });
    if (!user) {
        throw ApiError.notFound("phone not found");
    }

    if (user.role === "admin") {
        user.role = "Admin";
    }

    if (!ADMIN_ROLES.has(user.role)) {
        throw ApiError.forbidden("not an admin");
    }

    return user;
};

const sendSmsOtp = async (phoneNumber, otp) => {
    const apiKey = process.env.FACTOR_API_KEY;
    if (!apiKey) {
        throw new ApiError(500, "OTP send failed: SMS provider API key is not configured");
    }

    try {
        const url = `https://2factor.in/API/V1/${apiKey}/SMS/${phoneNumber}/${otp}`;
        const response = await axios.get(url);

        if (response.data?.Status !== "Success") {
            throw ApiError.badRequest("OTP send failed");
        }
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(502, "OTP send failed");
    }
};

const sendAndPersistOtp = async (user, phoneNumber) => {
    const otp = generateOTP();
    const hashOtp = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);

    await sendSmsOtp(phoneNumber, otp);

    user.otp = hashOtp;
    user.otpExpireTime = otpExpiry;
    await user.save();
};

const sendOTP = async (phoneNumber) => {
    const user = await findAdminByPhoneOrThrow(phoneNumber);
    await sendAndPersistOtp(user, phoneNumber);
};

const verifyAndLogin = async (phoneNumber, otp) => {
    const user = await findAdminByPhoneOrThrow(phoneNumber);

    if (!user.otp || !user.otpExpireTime || new Date() > user.otpExpireTime) {
        throw ApiError.badRequest("OTP expired or not requested");
    }

    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) {
        throw ApiError.badRequest("Invalid OTP");
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    user.lastLoginDate = new Date();
    user.otp = null;
    user.otpExpireTime = null;
    user.isPhoneVerified = true;
    await user.save();

    return { user, accessToken, refreshToken };
};

const resendOTP = async (phoneNumber) => {
    const admin = await findAdminByPhoneOrThrow(phoneNumber);
    await sendAndPersistOtp(admin, phoneNumber);
};

const logout = async (userId) => {
    await adminModels.findByIdAndUpdate(userId, { refreshToken: null });
};

const refreshAccessToken = async (refreshTokenStr) => {
    try {
        const decoded = jwt.verify(refreshTokenStr, process.env.REFRESH_TOKEN_SECRET);
        const user = await adminModels.findById(decoded.id);
        
        if (!user || user.refreshToken !== refreshTokenStr) {
            throw ApiError.forbidden("Invalid or expired refresh token!");
        }

        const newAccessToken = generateAccessToken(user);
        return newAccessToken;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw ApiError.forbidden("Invalid refresh token");
    }
};

/**
 * Demo login — bypasses OTP entirely.
 * Finds or creates a demo admin user and returns tokens.
 * Only available when DEMO_MODE=true in .env
 */
const demoLogin = async () => {
    if (process.env.DEMO_MODE !== "true") {
        throw ApiError.forbidden("Demo login is disabled");
    }

    const DEMO_PHONE = "0000000000";

    let user = await adminModels.findOne({ phoneNumber: DEMO_PHONE });

    if (!user) {
        user = await adminModels.create({
            firstName: "Demo",
            lastName: "Admin",
            phoneNumber: DEMO_PHONE,
            role: "Admin",
            isPhoneVerified: true,
        });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    user.lastLoginDate = new Date();
    await user.save();

    return { user, accessToken, refreshToken };
};

module.exports = { sendOTP, verifyAndLogin, resendOTP, refreshAccessToken, logout, demoLogin };
