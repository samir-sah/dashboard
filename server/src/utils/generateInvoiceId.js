const logger = require('./logger');

const generateInvoiceId = async (model) => {
    try {
        const currentYear = new Date().getFullYear();
        const lastInvoice = await model.findOne().sort({ createdAt: -1 });

        if (!lastInvoice || !lastInvoice.invoiceId) {
            return `INV-${currentYear}-0001`;
        }

        const lastIdString = lastInvoice.invoiceId;
        const parts = lastIdString.split('-');
        
        // Assuming format INV-YYYY-XXXX
        if (parts.length === 3) {
            const lastYear = parseInt(parts[1], 10);
            const lastSequence = parseInt(parts[2], 10);

            // Reset sequence when year changes
            if (lastYear !== currentYear) {
                return `INV-${currentYear}-0001`;
            }

            const nextSequence = lastSequence + 1;
            return `INV-${currentYear}-${nextSequence.toString().padStart(4, "0")}`;
        }

        // Fallback if format is different
        const extracted = parseInt(lastIdString.replace(/\D/g, ""), 10) || 0;
        const nextSequence = extracted + 1;
        return `INV-${currentYear}-${nextSequence.toString().padStart(4, "0")}`;

    } catch (error) {
        logger.error({ err: error }, "Error generating invoice ID");
        throw new Error("Failed to generate invoice ID");
    }
};

module.exports = generateInvoiceId;
