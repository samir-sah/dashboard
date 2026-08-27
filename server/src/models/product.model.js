const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    productName: {
      type: String,
      required: true,
      trim: true
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    category: {
      type: String,
      default: "General",
      trim: true
    },

    supplier: {
      type: String,
      default: "Unknown",
      trim: true
    },

    hsnCode: {
      type: String,
      required: true,
      trim: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    taxRate: {
      type: Number,
      default: 0,
      min: 0
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },

    maxCapacity: {
      type: Number,
      required: true,
      default: 200,
      min: 0
    },

    reorderPoint: {
      type: Number,
      required: true,
      default: 40,
      min: 0
    },

    lowStockThreshold: {
      type: Number,
      default: 20,
      min: 0
    },

    outOfStock: {
      type: Boolean,
      default: false
    },

    totalSold: {
      type: Number,
      default: 0,
      min: 0
    },

    isActive: {
      type: Boolean,
      default: true
    },

    lastRestockedAt: {
      type: Date
    },

    nextRestockDate: {
      type: Date
    }
  },

  {
    timestamps: true 
  }
);



//  Indexes for performance
productSchema.index({ productName: "text" }); // search

const productModels = mongoose.model("devices", productSchema);

module.exports = productModels;