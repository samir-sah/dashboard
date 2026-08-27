const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: true,
    },

    lastName: {
      type: String,
      trim: true,
      required: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },

    role: {
      type: String,
      enum: ["Admin"],
      default: "Admin",
    },

    otp: {
      type: String,
      default: null,
    },

    otpExpireTime: {
      type: Date,
      default: null,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    refreshToken: {
      type: String,
      default: null,
    },

    lastLoginDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

adminSchema.pre("validate", function normalizeRole() {
  if (this.role === "admin") {
    this.role = "Admin";
  }
});

module.exports = mongoose.model("admin", adminSchema);
