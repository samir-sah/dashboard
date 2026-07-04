// src/services/customerService.js
import apiFetch from '@/services/api/api.service';
import { API_CONFIG } from '@/config/api.config';

// API Functions
const normalizeAddressType = (type) => {
  if (type === "shippingAddress" || type === "shipping") return "Shipping";
  if (type === "billingAddress" || type === "billing") return "Billing";
  return type || "Address";
};

const getAddressList = (addresses = []) => {
  if (Array.isArray(addresses)) return addresses;
  return Object.entries(addresses || {})
    .filter(([, addr]) => addr)
    .map(([type, addr]) => ({ ...addr, type }));
};

const hasAddressContent = (addr = {}) => Boolean(
  addr.addressLine1 || addr.street || addr.city || addr.state || addr.pincode || addr.country
);

const mapAddress = (addr, index) => ({
  id: addr._id || `${addr.type || 'address'}-${index}`,
  type: normalizeAddressType(addr.type),
  line1: addr.addressLine1 || '',
  street: addr.street || '',
  city: addr.city || '',
  state: addr.state || '',
  pincode: addr.pincode || '',
  country: addr.country || '',
  isDefault: addr.isDefault || false
});

const getOrderAddressList = (orders = []) => {
  const latestOrderWithAddress = [...orders]
    .sort((a, b) => new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt))
    .find((order) => hasAddressContent(order.customer?.shippingAddress) || hasAddressContent(order.customer?.billingAddress));

  if (!latestOrderWithAddress) return [];

  return [
    latestOrderWithAddress.customer?.shippingAddress && { ...latestOrderWithAddress.customer.shippingAddress, type: 'shipping' },
    latestOrderWithAddress.customer?.billingAddress && { ...latestOrderWithAddress.customer.billingAddress, type: 'billing' },
  ].filter(hasAddressContent);
};

const getPreferredAddress = (addresses, type) => (
  addresses.find((addr) => addr.type === type && addr.isDefault) ||
  addresses.find((addr) => addr.type === type) ||
  addresses[0] ||
  null
);
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
    city: getPreferredAddress(getAddressList(user.addresses), 'shipping')?.city || 'N/A',
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

  const savedAddresses = getAddressList(user.addresses).filter(hasAddressContent);
  const addresses = (savedAddresses.length ? savedAddresses : getOrderAddressList(order)).map(mapAddress);

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
    status: o.isInCart
      ? 'In Cart'
      : (o.statusHistory && o.statusHistory.length > 0
        ? o.statusHistory[o.statusHistory.length - 1].status
        : 'Unknown')
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
  const newCustomers = totalRes.newCustomers || 0;
  
  // Replace totalRevenue with totalUnitsSold
  const totalUnitsSold = orderStatsRes.totalUnitsSold || 0;

  return {
    totalCustomers,
    activeCustomers,
    newCustomers,
    totalUnitsSold
  };
};


