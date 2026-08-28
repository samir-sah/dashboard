const userModel = require("../../../models/user.model");
const bcrypt = require("bcrypt");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../../utils/jwt.utils");
const { default: axios } = require("axios");
const jwt = require("jsonwebtoken");
const ApiError = require("../../../utils/ApiError");
const nodemailer = require("nodemailer");
const orderModel = require("../../../models/orders.model");
const supportTicketModel = require("../../../models/supportTicket.model");

const signIn = async (userData) => {
  const { firstName, lastName, email, phone } = userData;

  if (!firstName || !lastName || !email) {
    throw ApiError.badRequest("Please Enter all required fields");
  }

  const nameRegex = /^[a-zA-Z\s]{1,30}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!nameRegex.test(firstName))
    throw ApiError.badRequest("Only alphabets and spaces are allowed ");
  if (!emailRegex.test(email))
    throw ApiError.badRequest("Enter valid email id");

  const user = await userModel.findOne({ phone });
  if (!user)
    throw ApiError.notFound("User not found, Please verify otp first!");
  if (!user.isPhoneVerified) throw ApiError.badRequest("Phone not verified");

  const existingEmail = await userModel.findOne({ email });
  if (existingEmail) throw ApiError.conflict("Email already registered");

  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;
  await user.save();

  return {
    id: user._id,
    name: user.firstName,
    email: user.email,
    contact: user.phone,
  };
};

const login = async (phone) => {
  if (!phone) throw ApiError.badRequest("Phone number required to login!");

  const registeredUser = await userModel.findOne({ phone });
  if (!registeredUser) throw ApiError.notFound("User not found!");

  if (!registeredUser.firstName || !registeredUser.firstName.trim()) {
      const err = ApiError.forbidden("Profile incomplete");
      err.profileRequired = true;
      throw err;
  }

  const accessToken = generateAccessToken(registeredUser);
  const refreshToken = generateRefreshToken(registeredUser);

  registeredUser.refreshToken = refreshToken;
  registeredUser.lastLogin = new Date();
  await registeredUser.save();

  return { accessToken, refreshToken };
};

const refreshAccessToken = async (refreshTokenStr) => {
  try {
    const decoded = jwt.verify(
      refreshTokenStr,
      process.env.REFRESH_TOKEN_SECRET,
    );
    const user = await userModel.findById(decoded.id);

    if (!user || user.refreshToken !== refreshTokenStr) {
      throw ApiError.forbidden("Invalid or expired refresh token!");
    }

    return generateAccessToken(user);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.forbidden("Invalid refresh token");
  }
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendPhoneOTP = async (phone, type) => {
  if (!phone) throw ApiError.badRequest("Phone number is required");

  let user = await userModel.findOne({ phone });
  if (!user) {
    user = new userModel({ phone });
    await user.save();
  }

  const otp = generateOTP();
  const hashOtp = await bcrypt.hash(otp, 10);
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  if (type === "signup") {
    user.signupOTP = hashOtp;
    user.signupOTPExpiry = otpExpiry;
    await user.save();
  }

  if (type === "login") {
    user.loginOTP = hashOtp;
    user.loginOTPExpiry = otpExpiry;
    await user.save();
  }
  // 2Factor.io: integrate SMS service here
      // takes the api key with otp template
      const apiKey = process.env.FACTOR_API_KEY;
      const otpTemplate = 'OTP1';
      // const senderId = process.env.SENDER_ID;
      // using 2factor api for sending otp
      const url = `https://2factor.in/API/V1/${apiKey}/SMS/${phone}/${otp}/${otpTemplate}`;
      const response = await axios.get(url);
      // console.log(response.data)
      if (response.data.Status !== "Success") {
        throw new Error("Failed to send OTP");
  }
  

  // console.log(`OTP for ${phone}: ${otp}`);
  return otp;
};

const verifyOTP = async (phone, otp, type) => {
  if (!phone || !otp || !type)
    throw ApiError.badRequest("Phone number and OTP are required");

  const user = await userModel.findOne({ phone });
  if (!user) throw ApiError.notFound("User not found");

  if (type === "signup") {
    if (!user.signupOTP || new Date() > user.signupOTPExpiry) {
      throw ApiError.badRequest(" OTP expired or not requested");
    }
    const isMatch = await bcrypt.compare(otp, user.signupOTP);
    if (!isMatch) throw ApiError.badRequest("Invalid OTP ");

    user.signupOTP = undefined;
    user.signupOTPExpiry = undefined;
    user.isPhoneVerified = true;
    await user.save();
    return "OTP is verified. Fill signup details";
  }

  if (type === "login") {
    if (!user.loginOTP || new Date() > user.loginOTPExpiry) {
      throw ApiError.badRequest("OTP expired or not requested");
    }
    const isMatch = await bcrypt.compare(otp, user.loginOTP);
    if (!isMatch) throw ApiError.badRequest("Invalid OTP ");

    user.loginOTP = undefined;
    user.loginOTPExpiry = undefined;
    await user.save();
    return "OTP is verified. Proceed to login";
  }

  throw ApiError.badRequest("Invalid OTP type");
};

const resendOTP = async (phone, type) => {
  if (!phone || !type) throw ApiError.badRequest("Phone number is required");

  const user = await userModel.findOne({ phone });
  if (!user) throw ApiError.notFound("User not found");

  const otp = generateOTP();
  const hashOtp = await bcrypt.hash(otp, 10);
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  if (type === "signup") {
    user.signupOTP = hashOtp;
    user.signupOTPExpiry = otpExpiry;
  } else {
    user.loginOTP = hashOtp;
    user.loginOTPExpiry = otpExpiry;
  }
  await user.save();
  // 2Factor.io: integrate SMS service here
      // takes the api key with otp template
      const apiKey = process.env.FACTOR_API_KEY;
      const otpTemplate = 'OTP1';
      // const senderId = process.env.SENDER_ID;
      // using 2factor api for sending otp
      const url = `https://2factor.in/API/V1/${apiKey}/SMS/${phone}/${otp}/${otpTemplate}`;
      const response = await axios.get(url);
      // console.log(response.data)
      if (response.data.Status !== "Success") {
        throw new Error("Failed to send OTP");
  }
      
  return otp;
};

const logout = async (userId) => {
  await userModel.findByIdAndUpdate(userId, { refreshToken: null });
};

const verifyCaptcha = async (token) => {
  if (!token) throw ApiError.badRequest("Token is missing");

  const response = await axios.post(
    "https://www.google.com/recaptcha/api/siteverify",
    null,
    {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: token,
      },
    },
  );

  if (!response.data.success) {
    throw ApiError.badRequest("Captcha failed");
  }
};

const sendEmailOTP = async (email) => {
  if (!email) throw ApiError.badRequest("Email id is required");

  const exists = await userModel.findOne({ email });
  if (!exists) throw ApiError.notFound(`User of ${email} not found`);

  const otp = generateOTP();
  const hashOtp = await bcrypt.hash(otp, 10);
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  //  console.log(process.env.SMTP_HOST,process.env.SMTP_PORT,process.env.SMTP_USER,process.env.SMTP_PASSWORD)
  // console.log(process.env.SMTP_USER, process.env.SMTP_PASSWORD, email);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  const info = await transporter.sendMail({
    from: process.env.SMTP_USER, // sender address
    to: email, // list of recipients
    subject: "No reply", // subject line
    html: `
            <!DOCTYPE html>
                <html>
                    <head>
                         <meta charset="UTF-8">
                    </head>
                    <body style="margin:0; padding:0; background:#f4f4f4; font-family:Arial, Helvetica, sans-serif;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4; padding:30px 0;">
                            <tr>
                                <td align="center">
                                    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; padding:40px; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                                        <tr>
                                            <td>
                                                 <h2 style="margin:0 0 20px; color:#333333;">
                                                      Email Verification
                                                 </h2>

                                                 <p style="font-size:16px; color:#555555; margin-bottom:20px;">
                                                     Dear User,
                                                </p>

                                                <p style="font-size:16px; color:#555555; line-height:1.6;">
                                                    Thank you for choosing Synera.
                                                    Please use the following One-Time Password (OTP) to verify your email address.
                                                </p>

                                                <div style="text-align:center; margin:30px 0;">
                                                        <span style="display:inline-block; background:#f2f4f7; padding:15px 30px; font-size:32px; font-weight:bold; letter-spacing:8px; color:#2c3e50; border-radius:8px;">
                                                              ${otp}
                                                        </span>
                                                </div>

                                                <p style="font-size:15px; color:#555555;">
                                                    This OTP is valid for <strong>10 minutes</strong>.
                                                </p>

                                                <p style="font-size:15px; color:#555555;">
                                                    If you did not request this verification, you can safely ignore this email.
                                                </p>

                                                <hr style="border:none; border-top:1px solid #eeeeee; margin:30px 0;">

                                                <p style="font-size:13px; color:#999999; text-align:center;">
                                                    This is an automated email. Please do not reply.
                                                </p>

                                                 <p style="font-size:14px; color:#666666; text-align:center; margin-top:20px;">
                                                         Regards,<br>
                                                        <strong>Synera Team</strong>
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
            </html>
        `,
  });


  exists.emailOTP = hashOtp;
  exists.emailOTPExpiry = otpExpiry;
  await exists.save();
};

const verifyEmailOTP = async (email, otp) => {
  if (!email) throw ApiError.badRequest("Email id is required");

  const user = await userModel.findOne({ email });
  if (!user) throw ApiError.notFound(`User of ${email} not found`);

  if (
    !user.emailOTP ||
    !user.emailOTPExpiry ||
    new Date() > user.emailOTPExpiry
  ) {
    throw ApiError.badRequest("OTP expired or not requested");
  }
  const isMatch = await bcrypt.compare(otp, user.emailOTP);
  if (!isMatch) throw ApiError.badRequest("Invalid OTP ");

  user.emailOTP = undefined;
  user.emailOTPExpiry = undefined;
  user.isEmailVerified = true;
  await user.save();
  return "Email is verified.";
};

const responseEmail = async (email, type) => {
  if (!email && !type) throw ApiError.badRequest("Email and type are required.")
  
  const user = await userModel.find({ email });
  if (!user) throw ApiError.notFound(`User of ${email} not found`);
  
  if ( user.isEmailVerified === false) {
    throw ApiError.badRequest("Email id is not verified");
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  const name = user[0].firstName;
  const order = await orderModel.findOne({userId:user[0]._id});
    // console.log(user[0]._id)
  if (!order) throw ApiError.notFound("Order not found");
  
  if (type === "order") {
    const orderId = order.orderId;
    const address = order.customer.shippingAddress;
    const amount = order.totalAmount;

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email, 
      subject: "No reply", 
       html: `
              <!DOCTYPE html>
                <html>
                    <head>
                         <meta charset="UTF-8">
                    </head>
                    <body style="margin:0; padding:0; background:#f4f4f4; font-family:Arial, Helvetica, sans-serif;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4; padding:30px 0;">
                            <tr>
                                <td align="center">
                                    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; padding:40px; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                                        <tr>
                                            <td>
                                                 <h2 style="margin:0 0 20px; color:#333333;">
                                                      Congratulations!!!!
                                                 </h2>

                                                 <p style="font-size:16px; color:#555555; margin-bottom:20px;">
                                                     Dear ${name},
                                                </p>

                                                <p style="font-size:16px; color:#555555; line-height:1.6;">
                                                      Thank you for choosing Synera.
                                                      We have received your order and your orderId is ${orderId}.
                                                </p>

                                                <div style="text-align:center; margin:30px 0;">
                                                        <span style="display:inline-block; background:#f2f4f7; padding:15px 30px; font-size:24px; font-weight:bold; letter-spacing:1px; color:green; border-radius:8px;">
                                                              Order Confirmed
                                                        </span>
                                                </div>

                                                <p style="font-size:15px; color:#555555;">
                                                    The order will be delivered soon. Stay tuned!
                                                </p>
                                                <p style="font-size:15px; color:#555555;">
                                                  <strong>Order Details:</strong> <br /> <br />
                                                   Shipping Address:   <br /> <br/>
                                                   Street: ${address.street} <br/>
                                                   City: ${address.city} <br/>
                                                   State:${address.state}br/>
                                                   Pincode:${address.pincode}

                                                    <br/> <br/>
                                                   Amount: ${amount}
                                                </p>


                                                <hr style="border:none; border-top:1px solid #eeeeee; margin:30px 0;">

                                                <p style="font-size:13px; color:#999999; text-align:center;">
                                                    This is an automated email. Please do not reply.
                                                </p>

                                                 <p style="font-size:14px; color:#666666; text-align:center; margin-top:20px;">
                                                         Regards,<br>
                                                        <strong>Synera Team</strong>
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
            </html>`
  })
  }
  if (type === "payment") {
    const orderId = order.orderId
    const Paymentstatus = order.payment.status;
    const amount = order.payment.amount;
    if (Paymentstatus === "Completed") {
      const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email, 
      subject: "No reply", 
       html: `
              <!DOCTYPE html>
                <html>
                    <head>
                         <meta charset="UTF-8">
                    </head>
                    <body style="margin:0; padding:0; background:#f4f4f4; font-family:Arial, Helvetica, sans-serif;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4; padding:30px 0;">
                            <tr>
                                <td align="center">
                                    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; padding:40px; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                                        <tr>
                                            <td>
                                                 <h2 style="margin:0 0 20px; color:#333333;">
                                                      Successful!!!!
                                                 </h2>

                                                 <p style="font-size:16px; color:#555555; margin-bottom:20px;">
                                                     Dear ${name},
                                                </p>

                                                <p style="font-size:16px; color:#555555; line-height:1.6;">
                                                      Thank you for choosing Synera.
                                                      We have received your payment successfully.
                                                </p>

                                                <div style="text-align:center; margin:30px 0;">
                                                        <span style="display:inline-block; background:#f2f4f7; padding:15px 30px; font-size:24px; font-weight:bold; letter-spacing:1px; color:green; border-radius:8px;">
                                                              Payment Confirmed
                                                        </span>
                                                </div>

                                                <p style="font-size:15px; color:#555555;">
                                                    The order will be delivered soon. Stay tuned!
                                                </p>
                                                <p style="font-size:15px; color:#555555;">
                                                  <strong>Payment Details:</strong> <br /> <br />
                                                    order ID: ${orderId}  
                                                     <br/> <br/>
                                                   Amount: ${amount}
                                                </p>


                                                <hr style="border:none; border-top:1px solid #eeeeee; margin:30px 0;">

                                                <p style="font-size:13px; color:#999999; text-align:center;">
                                                    This is an automated email. Please do not reply.
                                                </p>

                                                 <p style="font-size:14px; color:#666666; text-align:center; margin-top:20px;">
                                                         Regards,<br>
                                                        <strong>Synera Team</strong>
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
            </html>`
       })
    } else {
      return res.status(400).json("Payment not completed")
    }
  } 
  if (type === "support") {
    const ticket = await supportTicketModel.findOne({ customerId: user[0]._id })
    // console.log(ticket)
    const ticketId = ticket.ticketId;
    const date = ticket.createdAt;
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email, 
      subject: "No reply", 
       html: `
              <!DOCTYPE html>
                <html>
                    <head>
                         <meta charset="UTF-8">
                    </head>
                    <body style="margin:0; padding:0; background:#f4f4f4; font-family:Arial, Helvetica, sans-serif;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4; padding:30px 0;">
                            <tr>
                                <td align="center">
                                    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; padding:40px; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                                        <tr>
                                            <td>
                                                 <h2 style="margin:0 0 20px; color:#333333;">
                                                      Ticket Submission Confirmed!
                                                 </h2>

                                                 <p style="font-size:16px; color:#555555; margin-bottom:20px;">
                                                     Dear ${name},
                                                </p>

                                                <p style="font-size:16px; color:#555555; line-height:1.6;">
                                                      Thank you for reaching out. We’re sorry to hear you’re experiencing this issue. 
                                                </p>

             
                                                <p style="font-size:15px; color:#555555;">
                                                    Our support team is currently investigating your issue
                                                    and will update you within 3 business days.
                                                </p>
                                                <p style="font-size:15px; color:#555555;">
                                                  <strong>Ticket Details:</strong> <br /> <br />
                                                    Ticket ID: ${ticketId}  
                                                     <br/> <br/>
                                                   Date: ${date}
                                                </p>


                                                <hr style="border:none; border-top:1px solid #eeeeee; margin:30px 0;">

                                                <p style="font-size:13px; color:#999999; text-align:center;">
                                                    This is an automated email. Please do not reply.
                                                </p>

                                                 <p style="font-size:14px; color:#666666; text-align:center; margin-top:20px;">
                                                         Regards,<br>
                                                        <strong>Synera Team</strong>
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
            </html>`
       })

  }
}
module.exports = {
  signIn,
  login,
  refreshAccessToken,
  sendPhoneOTP,
  verifyOTP,
  resendOTP,
  logout,
  verifyCaptcha,
  sendEmailOTP,
  verifyEmailOTP,
  responseEmail
};
