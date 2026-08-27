const supportTicketModel = require("../../models/supportTicket.model");
const orderModel = require("../../models/orders.model");
const ApiError = require("../../utils/ApiError");
const { buildTimelineEntry } = require("./supportTicket.utils");

const getCurrentSupportStatus = (ticket) => {
    const history = ticket?.supportStatusHistory || [];
    return history.length ? history[history.length - 1]?.status || "Open" : "Open";
};

const createTicket = async (ticketData) => {
    const { orderId, subject, issue, category, userId } = ticketData;

    if (!subject || !issue || !category) {
        throw ApiError.badRequest("Subject, issue, and category are required.");
    }

    if (["Product", "Delivery", "Payment"].includes(category) && !orderId) {
        throw ApiError.badRequest("Order Id is required for this ticket category.");
    }
    if (orderId) {
        const orderExists = await orderModel.exists({ orderId });
        if (!orderExists) {
            throw ApiError.badRequest(`Order not found: ${orderId}`);
        }
    }

    const addedTicket = await supportTicketModel.create({
        userId,
        orderId: orderId || null,
        subject,
        issue,
        category,
        supportStatusHistory: [{ status: "Open", updatedAt: new Date() }],
        timeline: [
            buildTimelineEntry(
                "Ticket Created",
                `Support ticket created for category: ${category}`,
                "Customer"
            ),
        ],
    });

    return {
        ticketId: addedTicket.ticketId,
        subject: addedTicket.subject,
        issue: addedTicket.issue,
        category: addedTicket.category,
        status: getCurrentSupportStatus(addedTicket),
    };
};

const usersTicket = async (id) => {
    if (!id) throw ApiError.badRequest("User id is required");

    const tickets = await supportTicketModel.find({ userId: id }).sort({ createdAt: -1 }).lean();

    return tickets.map((ticket) => ({
        ticketId: ticket.ticketId,
        issue: ticket.issue,
        message: ticket.comments?.[0]?.message || "",
        category: ticket.category,
        status: ticket.supportStatusHistory,
        attachments: ticket.attachments || [],
    }));
};

const usersTicketById = async (id, ticketId) => {
    if (!id) throw ApiError.badRequest("User id is required");

    const ticket = await supportTicketModel.findOne({ userId: id, ticketId: ticketId }).lean();
    if (!ticket) throw ApiError.notFound("Ticket not found");

    return {
        ticketId: ticket.ticketId,
        issue: ticket.issue,
        subject: ticket.subject || "",
        message: ticket.comments?.[0]?.message || "",
        category: ticket.category,
        status: ticket.supportStatusHistory,
        attachments: ticket.attachments || [],
    };
};

module.exports = {
    createTicket,
    usersTicket,
    usersTicketById,
};
