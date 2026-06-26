const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4400';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  endpoints: {
    // Orders
    orders: '/api/orders',
    orderById: (id) => `/api/orders/${id}`,
    cancelOrder: (id) => `/api/orders/cancelorder/${id}`,

    // Invoices
    invoices: '/api/invoices',
    createInvoice: (orderId) => `/api/invoices/create/${orderId}`,
    invoiceById: (invoiceId) => `/api/invoices/${invoiceId}`,
    invoiceByOrder: (orderId) => `/api/invoices/order/${orderId}`,

    // Product / Inventory (devices collection)
    products: '/api/product',
    productById: (id) => `/api/product/${id}`,

    // Customers (Users collection)
    users: '/api/users',
    userById: (id) => `/api/users/${id}`,
    updateUser: (id) => `/api/users/update-user/${id}`,

    // Payments
    payments: '/api/payments',
    paymentStats: '/api/payments/stats',
    paymentById: (id) => `/api/payments/${id}`,
    createRazorpayOrder: '/api/payments/create-order',
    verifyRazorpayPayment: '/api/payments/verify',
    paymentAnalytics: '/api/payments/analytics',
    failedPayments: '/api/payments/failures',
    refundPayment: (id) => `/api/payments/${id}/refund`,

    // Reports
    orderReports: (period, page = 1, limit = 10) =>
      `/api/admin/reports/orders?period=${period}&page=${page}&limit=${limit}`,
    revenueReports: (period, page = 1, limit = 10) =>
      `/api/admin/reports/revenue?period=${period}&page=${page}&limit=${limit}`,

    // Dashboard
    dashboardKPIs: '/api/dashboard/kpis',
    dashboardInsightKPIs: '/api/dashboard/insight-kpis',
    dashboardOrderStatus: '/api/dashboard/order-status',
    dashboardOrdersVsUnits: '/api/dashboard/orders-vs-units',
    dashboardCustomerGrowth: '/api/dashboard/customer-growth',
    dashboardRevenueForecast: '/api/dashboard/revenue-forecast',
    dashboardCustomerStats: '/api/dashboard/customer-stats',
    dashboardBusinessGrowth: '/api/dashboard/business-growth',
    dashboardLowStockProducts: '/api/dashboard/low-stock-products',
    dashboardStateOrders: '/api/dashboard/state-orders',
    dashboardGenderOrders: '/api/dashboard/gender-orders',

    // Support
    supportTickets: '/api/support/all-tickets',
    supportCreateTicket: '/api/support/tickets',
    supportKPIs: '/api/support/ticket-stats',
    supportEngineers: '/api/support/engineers',
    supportTicketById: (ticketId) => `/api/support/tickets/${ticketId}`,
    supportAssignTicket: (ticketId) => `/api/support/tickets/${ticketId}/assign`,
    supportUpdateStatus: (ticketId) => `/api/support/tickets/${ticketId}/status`,
    supportAddNote: (ticketId) => `/api/support/tickets/${ticketId}/note`,
    supportResolveTicket: (ticketId) => `/api/support/tickets/${ticketId}/resolve`,
  },
};
