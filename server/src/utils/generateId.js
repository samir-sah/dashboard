const START_SEQUENCE = 1000;
const ID_WIDTH = 5;

const getNextSequence = async (model, field, prefix) => {
    const [result] = await model.aggregate([
        { $match: { [field]: { $regex: `^${prefix}\\d{${ID_WIDTH},}$` } } },
        {
            $project: {
                sequence: {
                    $convert: {
                        input: {
                            $substrBytes: [
                                `$${field}`,
                                prefix.length,
                                { $subtract: [{ $strLenBytes: `$${field}` }, prefix.length] },
                            ],
                        },
                        to: 'long',
                        onError: null,
                        onNull: null,
                    },
                },
            },
        },
        { $match: { sequence: { $ne: null } } },
        { $group: { _id: null, maxSequence: { $max: '$sequence' } } },
    ]);

    return result ? Number(result.maxSequence) + 1 : START_SEQUENCE;
};

const generateFixedWidthId = async (model, field, prefix) => {
    let sequence = await getNextSequence(model, field, prefix);

    while (true) {
        const id = `${prefix}${String(sequence).padStart(ID_WIDTH, '0')}`;
        if (!await model.exists({ [field]: id })) return id;
        sequence += 1;
    }
};

const generateOrderId = (orderModel) => generateFixedWidthId(orderModel, 'orderId', 'ORD');

const generateCustomerId = (userModel) => generateFixedWidthId(userModel, 'customerId', 'CUST');

const generateSupportTicketId = (supportTicketModel) => (
    generateFixedWidthId(supportTicketModel, 'ticketId', 'TKT')
);

module.exports = { generateOrderId, generateCustomerId, generateSupportTicketId };
