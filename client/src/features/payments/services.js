import apiFetch from '@/services/api/api.service';
import { API_CONFIG } from '@/config/api.config';

const normalizePayment = (payment = {}) => {
  const customer = payment.customer || {};
  const paymentId = payment.paymentId || payment.transactionId || payment.razorpayPaymentId || payment.id || payment.orderId;
  const refunds = payment.refunds || (payment.refund ? [{
    refundId: payment.refund.razorpayRefundId || payment.paymentId,
    amount: payment.refund.amount,
    status: payment.status,
    reason: payment.refund.reason,
    createdAt: payment.refund.initiatedAt || payment.refund.completedAt,
  }] : []);

  return {
    ...payment,
    id: payment.id || paymentId,
    paymentId,
    customerId: customer.id || payment.customerId || '',
    customerName: customer.name || payment.customerName || 'Unknown Customer',
    customerEmail: customer.email || payment.customerEmail || '',
    customerPhone: customer.phone || payment.customerPhone || '',
    amount: Number(payment.amount || 0),
    paymentMethod: payment.method || payment.paymentMethod || 'Razorpay',
    status: payment.status || 'Pending',
    linkedOrders: payment.linkedOrders || (payment.orderId ? [payment.orderId] : []),
    refunds,
    statusHistory: payment.statusHistory || [],
  };
};

const normalizeStats = (stats = {}) => ({
  successfulPayments: stats.successful ?? stats.successfulPayments ?? 0,
  failedPayments: stats.failed ?? stats.failedPayments ?? 0,
  pendingPayments: stats.pending ?? stats.pendingPayments ?? 0,
  refundedPayments: stats.refunded ?? stats.refundedPayments ?? 0,
  successfulAmount: stats.successfulAmount ?? 0,
  successfulCount: stats.successfulCount ?? 0,
});

export const paymentService = {
  getPaymentStats: async () => {
    const res = await apiFetch(API_CONFIG.endpoints.paymentStats);
    return normalizeStats(res.data || res);
  },

  getPayments: async (params) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    const res = await apiFetch(`${API_CONFIG.endpoints.payments}${query}`);

    return {
      ...res,
      data: (res.data || res.payments || []).map(normalizePayment),
    };
  },

  getPaymentById: async (id) => {
    const res = await apiFetch(API_CONFIG.endpoints.paymentById(id));

    return {
      ...res,
      data: normalizePayment(res.data),
    };
  },

  getFailedPayments: async (params = {}) => {
    return paymentService.getPayments({ ...params, status: 'Failed' });
  },

  createRazorpayOrder: async (orderId) => {
    return apiFetch(API_CONFIG.endpoints.createRazorpayOrder, {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  },



  verifyPayment: async (payload) => {
    return apiFetch(API_CONFIG.endpoints.verifyRazorpayPayment, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },


  refundPayment: async (id, payload = {}) => {
    return apiFetch(API_CONFIG.endpoints.refundPayment(id), {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
