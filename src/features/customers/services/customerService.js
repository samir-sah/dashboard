// src/services/customerService.js
import apiFetch from '@/services/api/api.service';
import { API_CONFIG } from '@/config/api.config';

// API Functions
const formatGender = (gender) => {
  const labels = {
    male: "Male",
    female: "Female",
    other: "Other",
    prefer_not_to_say: "Prefer not to say",
  };
  return labels[gender] || null;
};

export const getCustomers = async (params = {}) => {
  const { page = 1, limit = 7, search = '', status = 'All' } = params;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) queryParams.append('search', search);
  if (status && status !== 'All') queryParams.append('status', status);

  const response = await apiFetch(`${API_CONFIG.endpoints.users}?${queryParams.toString()}`);
  const data = response.data || [];
  
  const mappedCustomers = data.map(user => ({
    id: user._id,
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
    email: user.email || 'N/A',
    phone: user.phone || 'N/A',
    status: user.isActive ? 'Active' : 'Inactive',
    city: user.addresses?.shippingAddress?.city || 'N/A',
    gender: formatGender(user.gender),
    joinedDate: user.createdAt,
    totalOrders: user.totalOrders || 0,
    totalSpend: user.totalSpend || 0,
    lastOrderDate: user.lastOrderDate || null
  }));

  return {
    customers: mappedCustomers,
    total: response.total || 0,
    page: response.page || 1,
    pages: response.pages || 1
  };
};

export const getCustomerById = async (id) => {
  const response = await apiFetch(API_CONFIG.endpoints.userById(id));
  const { user, order } = response.data || {};
  
  if (!user) throw new Error("Customer not found");

  const totalOrders = order ? order.length : 0;
  const totalSpend = order ? order.reduce((sum, o) => sum + (o.totalAmount || 0), 0) : 0;
  const lastOrderDate = order && order.length > 0 
    ? order.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))[0].orderDate 
    : null;

  const addresses = Object.entries(user.addresses || {})
    .filter(([, addr]) => addr)
    .map(([type, addr], index) => ({
      id: addr._id || index,
      type: type === "shippingAddress" ? "Shipping" : "Billing",
      line1: addr.addressLine1 || '',
      street: addr.street || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      isDefault: addr.isDefault || false
    }));

  return {
    id: user._id,
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
    email: user.email || 'N/A',
    phone: user.phone || 'N/A',
    status: user.isActive ? 'Active' : 'Inactive',
    totalOrders,
    totalSpend,
    city: addresses.length > 0 ? addresses[0].city : 'N/A',
    gender: user.gender || null,
    genderLabel: formatGender(user.gender),
    lastOrderDate,
    joinedDate: user.createdAt,
    addresses
  };
};

export const updateCustomerGender = async (id, gender) => {
  const response = await apiFetch(API_CONFIG.endpoints.updateUser(id), {
    method: 'PATCH',
    body: JSON.stringify({ gender }),
  });
  return response.data;
};

export const getCustomerOrders = async (id) => {
  // The userById endpoint returns orders along with the user.
  // We can also use the order history endpoint if preferred, 
  // but since we are fetching from userById anyway, let's just make the call here.
  const response = await apiFetch(API_CONFIG.endpoints.userById(id));
  const { order } = response.data || {};
  
  if (!order) return [];

  return order.map(o => ({
    id: o.orderId || o._id,
    date: o.orderDate || o.createdAt,
    amount: o.totalAmount || 0,
    // Safely get the latest status
    status: o.statusHistory && o.statusHistory.length > 0 
      ? o.statusHistory[o.statusHistory.length - 1].status 
      : 'Unknown'
  })).sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const getCustomerStats = async () => {
  // Fetch total and active user counts, plus order stats for units sold
  const [totalRes, activeRes, orderStatsRes] = await Promise.all([
    apiFetch(`${API_CONFIG.endpoints.users}?limit=1`),
    apiFetch(`${API_CONFIG.endpoints.users}?status=Active&limit=1`),
    apiFetch(`${API_CONFIG.endpoints.orders}/stats`).catch(() => ({ totalUnitsSold: 0 }))
  ]);

  const totalCustomers = totalRes.total || 0;
  const activeCustomers = activeRes.total || 0;
  const newCustomers = null; // We can't trivially query "New" without a date filter
  
  // Replace totalRevenue with totalUnitsSold
  const totalUnitsSold = orderStatsRes.totalUnitsSold || 0;

  return {
    totalCustomers,
    activeCustomers,
    newCustomers,
    totalUnitsSold
  };
};
