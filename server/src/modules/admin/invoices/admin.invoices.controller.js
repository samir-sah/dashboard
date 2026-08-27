const invoiceService = require('../../../shared/invoices/invoice.service');

const createInvoice = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
        }

        const invoice = await invoiceService.createInvoiceFromOrder(orderId);

        return res.status(201).json({
            success: true,
            message: 'Invoice created successfully',
            data: invoice
        });

    } catch (error) {
        if (error.statusCode) {
             return res.status(error.statusCode).json({
                success: false,
                message: error.message
             });
        }
        next(error);
    }
};

const getInvoice = async (req, res, next) => {
    try {
        const { invoiceId } = req.params;

        const invoice = await invoiceService.getInvoiceById(invoiceId);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: `Invoice not found: ${invoiceId}`
            });
        }

        return res.status(200).json({
            success: true,
            data: invoice
        });

    } catch (error) {
        next(error);
    }
};

const getInvoiceByOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        const invoice = await invoiceService.getInvoiceByOrderId(orderId);

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: `No invoice found for order: ${orderId}`
            });
        }

        return res.status(200).json({
            success: true,
            data: invoice
        });

    } catch (error) {
        next(error);
    }
};

module.exports = { createInvoice, getInvoice, getInvoiceByOrder };
