const mongoose = require("mongoose");
const { generateSupportTicketId } = require("../utils/generateId");

const commentSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    description: { type: String },
    actor: { type: String },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const supportTicketSchema = new mongoose.Schema(
    {
        ticketId: {
            type: String,
            unique: true,
            trim: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },

        orderId: {
            type: String,
            trim: true,
        },

        subject: {
            type: String,
            required: true,
            trim: true,
        },

        issue: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: String,
            enum: [
                "Delivery",
                "Payment",
                "Product",
                "Order",
                "Return",
                "Refund",
                "Account",
                "Other",
            ],
            required: true,
        },

        supportStatusHistory: [{
            status: {
                type: String,
                enum: [
                    "Open",
                    "In Progress",
                    "Resolved",
                    "Closed",
                ],
                default: "Open",
            },
            updatedAt: {
                type: Date,
                default: Date.now
            }
        }],

        priority: {
            type: String,
            enum: [
                "Low",
                "Medium",
                "High",
            ],
            default: "Medium",
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "admin",
            default: null,
        },

        assignedEngineerName: {
            type: String,
            trim: true,
            default: null,
        },

        source: {
            type: String,
            default: "Customer Support Portal",
        },

        dueDate: {
            type: Date,
        },

        resolutionNotes: {
            type: String,
        },

        comments: {
            type: [commentSchema],
            default: [],
        },

        timeline: {
            type: [timelineSchema],
            default: [],
        },

        attachments: [
            {
                url: String,
                fileName: String,
                uploadedAt: { type: Date, default: Date.now },
            },
        ],
  },
  {
    timestamps: true,
  }
);

supportTicketSchema.pre('save', async function () {
    if (!this.ticketId) {
        this.ticketId = await generateSupportTicketId(this.constructor);
    }
});

supportTicketSchema.index({ userId: 1, category: 1 });
supportTicketSchema.index({ priority: 1, updatedAt: -1 });
supportTicketSchema.index({ createdAt: -1 });
supportTicketSchema.index({ assignedTo: 1 });

const supportTicketModel = mongoose.model("support_tickets", supportTicketSchema);

module.exports = supportTicketModel;
