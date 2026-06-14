import apiFetch from '@/services/api/api.service';
import { API_CONFIG } from '@/config/api.config';

// Mock data to use until backend is ready
const MOCK_STATS = {
  successfulPayments: 840,
  failedPayments: 12,
  pendingPayments: 45,
  refundedPayments: 18,
};

const MOCK_PAYMENTS = [
  {
    paymentId: 'PAY-2026-0001',
    customerId: '60d5ec49f1b2c8a1b4e5d6a1',
    customerName: 'John Doe',
    orderId: 'ORD1005',
    amount: 150000, // in paise
    paymentMethod: 'UPI',
    status: 'captured',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    paidAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(),
  },
  {
    paymentId: 'PAY-2026-0002',
    customerId: '60d5ec49f1b2c8a1b4e5d6a2',
    customerName: 'Jane Smith',
    orderId: 'ORD1006',
    amount: 350000,
    paymentMethod: 'Card',
    status: 'failed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    paymentId: 'PAY-2026-0003',
    customerId: '60d5ec49f1b2c8a1b4e5d6a3',
    customerName: 'Alice Johnson',
    orderId: 'ORD1007',
    amount: 125000,
    paymentMethod: 'NetBanking',
    status: 'refunded',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    paidAt: new Date(Date.now() - 1000 * 60 * 60 * 23.5).toISOString(),
    totalRefunded: 125000,
  },
  {
    paymentId: 'PAY-2026-0005',
    customerId: '60d5ec49f1b2c8a1b4e5d6a5',
    customerName: 'Michael Chen',
    orderId: 'ORD1009',
    amount: 85000,
    paymentMethod: 'UPI',
    status: 'captured',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    paidAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },

  {
    paymentId: 'PAY-2026-0008',
    customerId: '60d5ec49f1b2c8a1b4e5d6a8',
    customerName: 'Emily Davis',
    orderId: 'ORD1012',
    amount: 55000,
    paymentMethod: 'UPI',
    status: 'partially_refunded',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    paidAt: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString(),
    totalRefunded: 25000,
  }
];



const MOCK_FAILED_PAYMENTS = [
  {
    paymentId: 'PAY-2026-0002',
    customerId: '60d5ec49f1b2c8a1b4e5d6a2',
    customerName: 'Jane Smith',
    errorCode: 'BAD_REQUEST_ERROR',
    errorReason: 'Payment failed due to insufficient funds.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

export const paymentService = {
  getPaymentStats: async () => {
    // return apiFetch(API_CONFIG.endpoints.paymentStats);
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_STATS), 500));
  },

  getPayments: async (params) => {
    // const query = params ? `?${new URLSearchParams(params)}` : '';
    // return apiFetch(`${API_CONFIG.endpoints.payments}${query}`);
    return new Promise((resolve) => setTimeout(() => resolve({
      success: true,
      total: MOCK_PAYMENTS.length,
      page: 1,
      pages: 1,
      data: MOCK_PAYMENTS,
    }), 500));
  },

  getPaymentById: async (id) => {
    // return apiFetch(API_CONFIG.endpoints.paymentById(id));
    return new Promise((resolve) => setTimeout(() => {
      const payment = MOCK_PAYMENTS.find(p => p.paymentId === id);
      if (payment) {
        resolve({
          success: true,
          data: {
            ...payment,
            refunds: payment.status === 'refunded' ? [{
              refundId: 'rfnd_001',
              amount: payment.totalRefunded,
              status: 'processed',
              reason: 'Customer request',
              createdAt: new Date().toISOString(),
            }] : []
          }
        });
      } else {
        resolve({ success: false, message: 'Payment not found' });
      }
    }, 500));
  },



  getFailedPayments: async (params) => {
    // const query = params ? `?${new URLSearchParams(params)}` : '';
    // return apiFetch(`${API_CONFIG.endpoints.failedPayments}${query}`);
    return new Promise((resolve) => setTimeout(() => resolve({
      success: true,
      total: MOCK_FAILED_PAYMENTS.length,
      page: 1,
      pages: 1,
      data: MOCK_FAILED_PAYMENTS,
    }), 500));
  },

  refundPayment: async (id, data) => {
    // return apiFetch(API_CONFIG.endpoints.refundPayment(id), {
    //   method: 'POST',
    //   body: JSON.stringify(data),
    // });
    return new Promise((resolve) => setTimeout(() => resolve({
      success: true,
      message: 'Refund initiated successfully'
    }), 500));
  }
};
