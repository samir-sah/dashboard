const authService = require('./client.auth.service');

const signIn = async (req, res) => {
    try {
        const data = await authService.signIn(req.body);
        res.status(201).json({
            message: "New User Registered Successfully!!",
            data
        });
    } catch (error) {
        if (error.statusCode === 400 && error.message.includes("Only alphabets")) return res.status(400).json({ error: error.message });
        if (error.statusCode === 400 && error.message.includes("valid email")) return res.status(400).json({ error: error.message });
        if (error.statusCode) return res.status(error.statusCode).json({ message: error.message });
        res.status(500).json({ Error: "error at sign in", message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { accessToken, refreshToken } = await authService.login(req.body.phone);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({ message: "Login successful", accessToken });
    } catch (error) {
        if (error.statusCode) {
            const resp = { message: error.message };
            if (error.profileRequired) resp.profileRequired = true;
            return res.status(error.statusCode).json(resp);
        }
        res.status(500).json({ Error: "error at login in", message: error.message });
    }
};

const refreshAccessToken = async (req, res, next) => {
    try {
        const refreshTokenStr = req.cookies.refreshToken || req.body.refreshToken;
        if (!refreshTokenStr) return res.status(401).json({ message: "Refresh token is required!" });

        const newAccessToken = await authService.refreshAccessToken(refreshTokenStr);

        res.status(200).json({ message: "Access token refreshed successfully", accessToken: newAccessToken });
    } catch (error) {
        if (error.statusCode) return res.status(error.statusCode).json({ message: error.message, error: error.message });
        next(error);
    }
};

const sendOTP = async (req, res) => {
    try {
        const { phone, type, email } = req.body;
        if (phone && type) {
            const phoneotp = await authService.sendPhoneOTP(phone, type);
            return res.status(200).json({ message: "Phone OTP sent successfully", success: true});
        } 
        if (email) {
            const otp = await authService.sendEmailOTP(email);   
            return res.status(200).json({ message: "Email OTP sent successfully", success: true });
        }
          
        return res.status(400).json({ message: "Either phone & type or email is required", success: false});
    } catch (error) {
        if (error.statusCode) return res.status(error.statusCode).json({ message: error.message });
        res.status(500).json({ message: "Error sending OTP", error: error.message });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { phone, otp, type, email } = req.body;
        if (phone && otp && type) {
            const message = await authService.verifyOTP(phone, otp, type);
            return res.status(200).json({ message });
        }
        if (email && otp) {
            const message = await authService.verifyEmailOTP(email, otp);
            return res.status(200).json({ message });
        }
        return res.status(400).json({ message: "Either phone,otp & type or email & otp is required", success: false});
    } catch (error) {
        if (error.statusCode) return res.status(error.statusCode).json({ message: error.message });
        res.status(500).json({ message: 'Error verifing OTP', error: error.message });
    }
};

const resendOTP = async (req, res) => {
    try {
        const { phone, type } = req.body;
        await authService.resendOTP(phone, type);
        res.status(200).json({ message: "OTP resend" , success:true});
    } catch (error) {
        if (error.statusCode) return res.status(error.statusCode).json({ message: error.message }); // keeping original typo staus(400) fixed
        res.status(500).json({ message: 'Error resending OTP', error: error.message });
    }
};

const logout = async (req, res) => {
    try {
        await authService.logout(req.user.id);
        res.clearCookie('refreshToken');
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ message: "Error during logout", error: error.message });
    }
};

const verifyCaptcha = async (req, res) => {
    try {
        await authService.verifyCaptcha(req.body.token);
        res.status(200).json({ message: "Captcha Verified" });
    } catch (error) {
        if (error.statusCode === 400 && error.message === "Token is missing") return res.status(400).json({ message: "Token is missing" });
        if (error.statusCode === 400 && error.message === "Captcha failed") return res.status(400).json({ message: "Captcha failed" });
        res.status(500).json({ message: "Error during verifying captcha", error: error.message });
    }
};

const responseEmail = async (req, res) => {
    try {
        const { email, type } = req.body;
        await authService.responseEmail(email, type);
        res.status(200).json({message:"Response send successfully."})
    } catch (error) {
        res.status(500).json({ message: "Error during sending response", error: error.message });
    }
}
module.exports = { signIn, login, refreshAccessToken, sendOTP, verifyOTP, resendOTP, verifyCaptcha, logout, responseEmail };
