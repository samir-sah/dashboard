const supportService = require('../../../shared/supportTicket/supportTicket.service');

const createTicket = async (req, res) => {
    try {
            const ticketData = { ...req.body, userId: req.user.id };
            const addedTicket = await supportService.createTicket(ticketData);
            res.status(201).json({ message: "Support Ticket raised Successfully!", data: addedTicket });
    } catch (error) {
            if (error.statusCode === 400 || error.statusCode === 404) {
                return res.status(error.statusCode).json({ message: error.message, success: false });
            }
            res.status(500).json({ Error: "error at raising support ticket ", message: error.message });
    }
}
const getUsersTicket = async (req, res) => {
    try {
            const id =  req.user.id ;
            const getTicket = await supportService.usersTicket(id);
            res.status(201).json({ message: "Support Ticket fetched Successfully!", data: getTicket });
    } catch (error) {
        if (error.statusCode === 400 || error.statusCode === 404) {
                return res.status(error.statusCode).json({ message: error.message, success: false });
            }
            res.status(500).json({ Error: "error at fetching support ticket ", message: error.message });
    }
}

const getUsersTicketById = async (req, res) => {
    try {
        const id = req.user.id;
        const { ticketId } = req.params;
            const getTicket = await supportService.usersTicketById(id,ticketId);
            res.status(201).json({ message: "Support Ticket fetched Successfully!", data: getTicket });
    } catch (error) {
        if (error.statusCode === 400 || error.statusCode === 404) {
                return res.status(error.statusCode).json({ message: error.message, success: false });
            }
            res.status(500).json({ Error: "error at fetching support ticket ", message: error.message });
    }
}
module.exports = {createTicket, getUsersTicket, getUsersTicketById}