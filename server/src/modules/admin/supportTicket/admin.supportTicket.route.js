const express = require("express");

const {
    getAllTickets,
    getTicketStats,
    getTicketById,
    createTicket,
    getSupportEngineers,
    assignTicket,
    updateTicketStatus,
    addInternalNote,
    resolveTicket,
} = require("./admin.supportTicket.controller");
const { authenticateAdmin, authorize } = require("../../../middlewares/auth.middleware");

const router = express.Router();

router.use(authenticateAdmin, authorize("Admin"));

router.get("/all-tickets", getAllTickets);
router.get("/ticket-stats", getTicketStats);
router.get("/engineers", getSupportEngineers);
router.post("/tickets", createTicket);
router.get("/tickets/:ticketId", getTicketById);
router.put("/tickets/:ticketId/assign", assignTicket);
router.put("/tickets/:ticketId/status", updateTicketStatus);
router.post("/tickets/:ticketId/note", addInternalNote);
router.put("/tickets/:ticketId/resolve", resolveTicket);

module.exports = router;
