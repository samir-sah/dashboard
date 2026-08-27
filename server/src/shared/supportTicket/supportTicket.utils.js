const buildTimelineEntry = (action, description, actor = "System") => ({
    action,
    description,
    actor,
    date: new Date(),
});

const formatAddress = (address) => {
    if (!address) return null;

    const parts = [
        address.addressLine1,
        address.street,
        address.city,
        address.state,
        address.pincode,
        address.country,
    ].filter(Boolean);

    return parts.length ? parts.join(", ") : null;
};

module.exports = { buildTimelineEntry, formatAddress };
