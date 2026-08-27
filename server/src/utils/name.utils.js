const resolveCustomerName = (user, order) => {
    if (user?.firstName) {
        return [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    }
    
    // Fallback to order's shipping address
    return order?.customer?.shippingAddress?.fullName || 'Unknown Customer';
};

module.exports = { resolveCustomerName };
