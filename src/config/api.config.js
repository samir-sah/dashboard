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
  },
};