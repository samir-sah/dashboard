const mongoose = require("mongoose");
const supportTicketModel = require("../../../models/supportTicket.model");
const orderModel = require("../../../models/orders.model");
const adminModel = require("../../../models/admin.model");
const ApiError = require("../../../utils/ApiError");
const { buildTimelineEntry, formatAddress } = require("../../../shared/supportTicket/supportTicket.utils");

const VALID_STATUSES = ["Open", "In Progress", "Resolved", "Closed"];
const VALID_STATUS_UPDATES = ["In Progress", "Closed"];
const VALID_PRIORITIES = ["Low", "Medium", "High"];
const CLOSE_REASONS = ["Duplicate", "Spam", "Created by Mistake", "Other"];
const SUPPORT_ENGINEERS = [
    { id: "admin", name: "Admin" },
    { id: "vaibhav", name: "Vaibhav" },
];

const getActorName = (userAuth) => {
    const fullName = `${userAuth?.firstName || ""} ${userAuth?.lastName || ""}`.trim();
    return userAuth?.name || fullName || "Admin";
};

const getAdminName = (admin) => {
    if (!admin) return "Unassigned";
    return `${admin.firstName || ""} ${admin.lastName || ""}`.trim() || "Unassigned";
};

const getAssignedEngineerName = (ticket) => {
    if (ticket.assignedEngineerName) return ticket.assignedEngineerName;
    return getAdminName(ticket.assignedTo);
};

const getCurrentSupportStatus = (ticket) => {
    const history = ticket?.supportStatusHistory || [];
    return history.length ? history[history.length - 1]?.status || "Open" : "Open";
};

const currentStatusExpr = {
    $ifNull: [{ $last: "$supportStatusHistory.status" }, "Open"],
};

const buildInvalidTransitionError = (currentStatus, targetStatus) => (
    `Invalid status transition from ${currentStatus} to ${targetStatus}`
);

const getTicketOrThrow = async (ticketId) => {
    const ticket = await supportTicketModel.findOne({ ticketId });
    if (!ticket) throw ApiError.notFound("Ticket not found");
    return ticket;
};

const getAllTickets = async (query = {}, userAuth) => {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    const match = {};

    if (query.status && query.status !== "All") {
        if (!VALID_STATUSES.includes(query.status)) throw ApiError.badRequest("Invalid status filter");
    }

    if (query.priority && query.priority !== "All") {
        if (!VALID_PRIORITIES.includes(query.priority)) throw ApiError.badRequest("Invalid priority filter");
        match.priority = query.priority;
    }

    const sortFields = {
        createdAt: "createdAt",
        updatedAt: "updatedAt",
        priority: "priority",
        status: "currentStatus",
        ticketId: "ticketId",
    };
    const sortBy = sortFields[query.sortBy] || "updatedAt";
    const sortOrder = query.sortOrder === "asc" ? 1 : -1;
    const search = query.search?.trim();

    const pipeline = [
        { $match: match },
        { $addFields: { currentStatus: currentStatusExpr } },
        ...(query.status && query.status !== "All" ? [{ $match: { currentStatus: query.status } }] : []),
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "customer",
            },
        },
        { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
        {
            $addFields: {
                customerName: {
                    $trim: {
                        input: {
                            $concat: [
                                { $ifNull: ["$customer.firstName", ""] },
                                " ",
                                { $ifNull: ["$customer.lastName", ""] },
                            ],
                        },
                    },
                },
            },
        },
    ];

    if (search) {
        const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        pipeline.push({
            $match: {
                $or: [
                    { ticketId: searchRegex },
                    { issue: searchRegex },
                    { customerName: searchRegex },
                ],
            },
        });
    }

    pipeline.push({
        $facet: {
            metadata: [{ $count: "total" }],
            data: [
                { $sort: { [sortBy]: sortOrder, _id: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
                {
                    $project: {
                        _id: 0,
                        id: "$ticketId",
                        issue: 1,
                        subject: 1,
                        priority: {
                            $cond: [{ $eq: ["$priority", "Critical"] }, "High", "$priority"],
                        },
                        status: "$currentStatus",
                        updatedAt: 1,
                        customer: {
                            name: {
                                $cond: [
                                    { $gt: [{ $strLenCP: "$customerName" }, 0] },
                                    "$customerName",
                                    "Unknown",
                                ],
                            },
                        },
                    },
                },
            ],
        },
    });

    const [result] = await supportTicketModel.aggregate(pipeline);
    const total = result?.metadata?.[0]?.total || 0;

    return {
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
        data: result?.data || [],
    };
};

const getTicketStats = async (userAuth) => {
    const [stats] = await supportTicketModel.aggregate([
        { $addFields: { currentStatus: currentStatusExpr } },
        {
            $facet: {
                total: [{ $count: "count" }],
                open: [{ $match: { currentStatus: "Open" } }, { $count: "count" }],
                inProgress: [{ $match: { currentStatus: "In Progress" } }, { $count: "count" }],
                resolved: [{ $match: { currentStatus: "Resolved" } }, { $count: "count" }],
                highPriority: [{ $match: { priority: { $in: ["High", "Critical"] } } }, { $count: "count" }],
            },
        },
        {
            $project: {
                total: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
                open: { $ifNull: [{ $arrayElemAt: ["$open.count", 0] }, 0] },
                inProgress: { $ifNull: [{ $arrayElemAt: ["$inProgress.count", 0] }, 0] },
                resolved: { $ifNull: [{ $arrayElemAt: ["$resolved.count", 0] }, 0] },
                highPriority: { $ifNull: [{ $arrayElemAt: ["$highPriority.count", 0] }, 0] },
            },
        },
    ]);

    return stats || { total: 0, open: 0, inProgress: 0, resolved: 0, highPriority: 0 };
};

const getTicketById = async (ticketId, userAuth) => {
    const ticket = await supportTicketModel
        .findOne({ ticketId })
        .populate("userId", "firstName lastName email phone addresses")
        .populate("assignedTo", "firstName lastName")
        .lean();

    if (!ticket) throw ApiError.notFound("Ticket not found");

    let order = null;
    if (ticket.orderId) {
        order = await orderModel
            .findOne({ orderId: ticket.orderId })
            .populate("orderItems.productId", "productName sku")
            .lean();
    }

    const user = ticket.userId;
    const shippingAddress = order?.customer?.shippingAddress || user?.addresses?.shippingAddress;
    let device = null;

    if (order) {
        // Current checkout/create flows create one distinct order item. If true multi-product
        // orders are added, support tickets need item-level linkage before choosing a device.
        const orderItem = order.orderItems?.[0];
        const product = orderItem?.productId;

        device = {
            orderId: ticket.orderId,
            name: product?.productName || orderItem?.productName || null,
            sku: product?.sku || orderItem?.sku || null,
            serialNumber: orderItem?.serialNumber || null,
            purchaseDate: order.orderDate || null,
            warrantyStatus: orderItem?.warrantyStatus || "Not Available",
            warrantyValidTill: orderItem?.warrantyValidTill || null,
        };
    }

    return {
        id: ticket.ticketId,
        issue: ticket.issue,
        description: ticket.subject,
        category: ticket.category,
        source: ticket.source,
        dueDate: ticket.dueDate,
        priority: ticket.priority === "Critical" ? "High" : ticket.priority,
        status: getCurrentSupportStatus(ticket),
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        assignedEngineer: getAssignedEngineerName(ticket),
        resolutionNotes: ticket.resolutionNotes || null,
        timeline: (ticket.timeline || []).map((entry) => ({
            action: entry.action,
            description: entry.description,
            actor: entry.actor,
            date: entry.date,
        })),
        customer: {
            id: user?._id || null,
            name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Unknown",
            email: user?.email || null,
            phone: user?.phone || null,
            address: formatAddress(shippingAddress),
        },
        device,
    };
};

const createTicket = async (payload = {}, userAuth) => {
    const { userId, orderId, subject, issue, category, priority = "Medium" } = payload;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw ApiError.badRequest("A valid userId is required");
    }
    if (!subject?.trim() || !issue?.trim() || !category) {
        throw ApiError.badRequest("Subject, issue, and category are required");
    }
    if (!VALID_PRIORITIES.includes(priority)) {
        throw ApiError.badRequest(`Invalid priority. Must be one of: ${VALID_PRIORITIES.join(", ")}`);
    }
    if (orderId?.trim()) {
        const orderExists = await orderModel.exists({ orderId: orderId.trim() });
        if (!orderExists) {
            throw ApiError.badRequest(`Order not found: ${orderId.trim()}`);
        }
    }

    const ticket = await supportTicketModel.create({
        userId,
        orderId: orderId?.trim() || null,
        subject: subject.trim(),
        issue: issue.trim(),
        category,
        priority,
        supportStatusHistory: [{ status: "Open", updatedAt: new Date() }],
        timeline: [
            buildTimelineEntry(
                "Ticket Created",
                `Support ticket created by admin for category: ${category}`,
                getActorName(userAuth)
            ),
        ],
    });

    return ticket;
};

const getSupportEngineers = async () => SUPPORT_ENGINEERS;

const assignTicket = async (ticketId, assignedTo, userAuth) => {
    if (!assignedTo) throw ApiError.badRequest("assignedTo is required");

    let assignee = null;
    let assignedEngineerName = null;

    if (mongoose.Types.ObjectId.isValid(assignedTo)) {
        assignee = await adminModel.findById(assignedTo).select("firstName lastName").lean();
        if (!assignee) throw ApiError.notFound("Assigned admin not found");
        assignedEngineerName = getAdminName(assignee);
    } else {
        const engineer = SUPPORT_ENGINEERS.find((item) => item.id === assignedTo);
        if (!engineer) throw ApiError.badRequest("Invalid engineer selection");
        assignedEngineerName = engineer.name;
    }

    const updated = await supportTicketModel.findOneAndUpdate(
        { ticketId },
        {
            $set: {
                assignedTo: assignee?._id || null,
                assignedEngineerName,
            },
            $push: {
                timeline: buildTimelineEntry(
                    "Assigned",
                    `Ticket assigned to ${assignedEngineerName}`,
                    getActorName(userAuth)
                ),
            },
        },
        { new: true }
    );

    if (!updated) throw ApiError.notFound("Ticket not found");
    return updated;
};

const updateTicketStatus = async (ticketId, payload = {}, userAuth) => {
    const { status: targetStatus, reason, note } = payload;
    if (!VALID_STATUS_UPDATES.includes(targetStatus)) {
        throw ApiError.badRequest(
            `Invalid status update. Use /resolve for Resolved. Must be one of: ${VALID_STATUS_UPDATES.join(", ")}`
        );
    }

    const ticket = await getTicketOrThrow(ticketId);
    const currentStatus = getCurrentSupportStatus(ticket);
    const update = {
        $push: {
            supportStatusHistory: { status: targetStatus, updatedAt: new Date() },
            timeline: null,
        },
    };

    if (targetStatus === "In Progress" && currentStatus === "Open") {
        update.$push.timeline = buildTimelineEntry(
            "Status Updated",
            "Status changed to In Progress",
            getActorName(userAuth)
        );
    } else if (targetStatus === "Closed" && currentStatus === "Resolved") {
        update.$push.timeline = buildTimelineEntry(
            "Closed",
            "Ticket closed after resolution",
            getActorName(userAuth)
        );
    } else if (targetStatus === "Closed" && ["Open", "In Progress"].includes(currentStatus)) {
        if (!CLOSE_REASONS.includes(reason)) {
            throw ApiError.badRequest(`Closing from ${currentStatus} requires reason: ${CLOSE_REASONS.join(", ")}`);
        }
        if (reason === "Other" && !note?.trim()) {
            throw ApiError.badRequest("Closing with reason Other requires a short note");
        }

        const description = reason === "Other" ? `${reason}: ${note.trim()}` : reason;
        update.$push.timeline = buildTimelineEntry("Closed", description, getActorName(userAuth));
    } else {
        throw ApiError.badRequest(buildInvalidTransitionError(currentStatus, targetStatus));
    }

    const updated = await supportTicketModel.findOneAndUpdate({ ticketId }, update, { new: true });
    if (!updated) throw ApiError.notFound("Ticket not found");
    return updated;
};

const addInternalNote = async (ticketId, description, userAuth) => {
    if (!description?.trim()) throw ApiError.badRequest("Description is required for an internal note");

    const updated = await supportTicketModel.findOneAndUpdate(
        { ticketId },
        {
            $push: {
                timeline: buildTimelineEntry("Note Added", description.trim(), getActorName(userAuth)),
            },
        },
        { new: true }
    );

    if (!updated) throw ApiError.notFound("Ticket not found");
    return updated;
};

const resolveTicket = async (ticketId, resolutionNotes, userAuth) => {
    if (!resolutionNotes?.trim()) {
        throw ApiError.badRequest("Resolution notes are required");
    }

    const ticket = await getTicketOrThrow(ticketId);
    const currentStatus = getCurrentSupportStatus(ticket);
    if (currentStatus !== "In Progress") {
        throw ApiError.badRequest(buildInvalidTransitionError(currentStatus, "Resolved"));
    }

    const updated = await supportTicketModel.findOneAndUpdate(
        { ticketId },
        {
            $set: {
                resolutionNotes: resolutionNotes.trim(),
            },
            $push: {
                supportStatusHistory: { status: "Resolved", updatedAt: new Date() },
                timeline: buildTimelineEntry("Resolved", resolutionNotes.trim(), getActorName(userAuth)),
            },
        },
        { new: true }
    );

    if (!updated) throw ApiError.notFound("Ticket not found");
    return updated;
};

module.exports = {
    getAllTickets,
    getTicketStats,
    getTicketById,
    createTicket,
    getSupportEngineers,
    assignTicket,
    updateTicketStatus,
    addInternalNote,
    resolveTicket,
};
