const express = require("express");
const { authenticate } = require("../../../middlewares/auth.middleware");
const { createTicket, getUsersTicket, getUsersTicketById } = require("./client.supportTicket.controller");


const router = express.Router();

router.post('/create-ticket', authenticate, createTicket);
router.get('/', authenticate, getUsersTicket);
router.get('/:ticketId', authenticate, getUsersTicketById);

module.exports = router;
