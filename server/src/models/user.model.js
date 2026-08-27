const mongoose = require("mongoose");
const { generateCustomerId } = require("../utils/generateId");

const addressSchema = new mongoose.Schema({
  type: { type: String, enum: ["shipping", "billing"], required: true },
  fullName: { type: String, trim: true },
  phone: { type: String, trim: true },
  alternatePhone: { type: String, trim: true },
  addressLine1: { type: String, trim: true },  // e.g. "Flat 402"
  street:    { type: String, trim: true },
  city:      { type: String, trim: true },
  state:     { type: String, trim: true },
  pincode:   { type: String },
  country:   { type: String, trim: true },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, trim: true }, //  unique added

    firstName: { type: String, trim: true }, //  required removed (collected after OTP)
    lastName: { type: String, trim: true },
    customerId: {
        type: String,
        unique: true
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
      default: undefined,
    },

    // contact field removed (was duplicate of phone)

    refreshToken: { type: String, default: null },

    signupOTP:       { type: String },
    signupOTPExpiry: { type: Date },

    loginOTP:       { type: String },
    loginOTPExpiry: { type: Date },

    isPhoneVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },

    emailOTP:       { type: String },
    emailOTPExpiry: { type: Date },

    // password removed (OTP-only flow)

    role: {
      type: String,
      enum: ["Admin", "Customer"],
      default: "Customer",
      required: true,
    },

    isActive:  { type: Boolean, default: true },
    isInCart:  { type: Boolean, default: false },
    // addresses: {
    //               shippingAddress: addressSchema,
    //               billingAddress: addressSchema
    // },
    addresses:[addressSchema],
    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function () {
    if (!this.customerId) {
        this.customerId = await generateCustomerId(userModel);
    }
    //  next();
});

userSchema.pre("save", function () {
 const defaultsByType = {};
  (this.addresses || []).forEach(addr => {
    if (addr.isDefault) {
      if (defaultsByType[addr.type]) {
        throw new Error(`Only one default ${addr.type} address allowed`);
      }
      defaultsByType[addr.type] = true;
    }
  });
});

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
