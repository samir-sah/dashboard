const supportService = require("./admin.supportTicket.service");

const getAllTickets = async (req, res, next) => {
    try {
        const result = await supportService.getAllTickets(req.query, req.user);
        res.status(200).json({
            success: true,
            message: "All tickets fetched successfully.",
            total: result.total,
            page: result.page,
            pages: result.pages,
            data: result.data,
        });
    } catch (error) {
        next(error);
    }
};

const getTicketStats = async (req, res, next) => {
    try {
        const data = await supportService.getTicketStats(req.user);
        res.status(200).json({ success: true, message: "Ticket stats fetched successfully.", data });
    } catch (error) {
        next(error);
    }
};

const getTicketById = async (req, res, next) => {
    try {
        const data = await supportService.getTicketById(req.params.ticketId, req.user);
        res.status(200).json({ success: true, message: "Ticket fetched successfully.", data });
    } catch (error) {
        next(error);
    }
};

const createTicket = async (req, res, next) => {
    try {
        const data = await supportService.createTicket(req.body, req.user);
        res.status(201).json({ success: true, message: "Ticket created successfully.", data });
    } catch (error) {
        next(error);
    }
};

const getSupportEngineers = async (req, res, next) => {
    try {
        const data = await supportService.getSupportEngineers();
        res.status(200).json({ success: true, message: "Support engineers fetched successfully.", data });
    } catch (error) {
        next(error);
    }
};

const assignTicket = async (req, res, next) => {
    try {
        const data = await supportService.assignTicket(req.params.ticketId, req.body.assignedTo, req.user);
        res.status(200).json({ success: true, message: "Ticket assigned successfully.", data });
    } catch (error) {
        next(error);
    }
};

const updateTicketStatus = async (req, res, next) => {
    try {
        const data = await supportService.updateTicketStatus(req.params.ticketId, req.body, req.user);
        res.status(200).json({ success: true, message: "Ticket status updated successfully.", data });
    } catch (error) {
        next(error);
    }
};

const addInternalNote = async (req, res, next) => {
    try {
        const data = await supportService.addInternalNote(req.params.ticketId, req.body.description, req.user);
        res.status(200).json({ success: true, message: "Internal note added successfully.", data });
    } catch (error) {
        next(error);
    }
};

const resolveTicket = async (req, res, next) => {
    try {
        const data = await supportService.resolveTicket(req.params.ticketId, req.body.resolutionNotes, req.user);
        res.status(200).json({ success: true, message: "Ticket resolved successfully.", data });
    } catch (error) {
        next(error);
    }
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
