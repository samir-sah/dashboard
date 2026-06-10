// src/services/customerService.js

// Mock Data
const MOCK_CUSTOMERS = [
  {
    id: "CUST-001",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+91 9876543210",
    status: "Active",
    totalOrders: 12,
    totalSpend: 15400,
    city: "Bangalore",
    gender: "Male",
    lastOrderDate: "2026-06-05T10:30:00Z",
    joinedDate: "2025-01-15T08:00:00Z",
    addresses: [
      { id: 1, type: "Shipping", line1: "Flat 402, Sunshine Apartments", street: "MG Road", city: "Bangalore", state: "Karnataka", pincode: "560001", isDefault: true },
      { id: 2, type: "Billing", line1: "Office 12, Tech Park", street: "Whitefield", city: "Bangalore", state: "Karnataka", pincode: "560066", isDefault: false }
    ]
  },
  {
    id: "CUST-002",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+91 9123456789",
    status: "Active",
    totalOrders: 5,
    totalSpend: 4200,
    city: "Hyderabad",
    gender: "Female",
    lastOrderDate: "2026-05-20T14:15:00Z",
    joinedDate: "2025-06-10T09:30:00Z",
    addresses: [
      { id: 3, type: "Shipping", line1: "Villa 5", street: "Palm Meadows", city: "Hyderabad", state: "Telangana", pincode: "500081", isDefault: true }
    ]
  },
  {
    id: "CUST-003",
    name: "Rahul Kumar",
    email: "rahul.k@example.com",
    phone: "+91 9988776655",
    status: "Inactive",
    totalOrders: 1,
    totalSpend: 850,
    city: "Mumbai",
    gender: "Male",
    lastOrderDate: "2025-11-10T11:00:00Z",
    joinedDate: "2025-10-05T16:45:00Z",
    addresses: [
      { id: 4, type: "Shipping", line1: "Apt 101", street: "Andheri West", city: "Mumbai", state: "Maharashtra", pincode: "400053", isDefault: true }
    ]
  },
  {
    id: "CUST-004",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "+91 9871234560",
    status: "Active",
    totalOrders: 24,
    totalSpend: 32000,
    city: "Gurgaon",
    gender: "Female",
    lastOrderDate: "2026-06-07T09:20:00Z",
    joinedDate: "2024-03-22T10:10:00Z",
    addresses: [
      { id: 5, type: "Shipping", line1: "House No 42", street: "Sector 14", city: "Gurgaon", state: "Haryana", pincode: "122001", isDefault: true }
    ]
  },
  {
    id: "CUST-005",
    name: "Amit Patel",
    email: "amit.p@example.com",
    phone: "+91 9900112233",
    status: "New",
    totalOrders: 0,
    totalSpend: 0,
    city: "Delhi",
    gender: "Male",
    lastOrderDate: null,
    joinedDate: "2026-06-08T08:00:00Z",
    addresses: []
  }
];

const MOCK_ORDERS = {
  "CUST-001": [
    { id: "ORD-1005", date: "2026-06-05T10:30:00Z", amount: 1200, status: "Delivered" },
    { id: "ORD-0982", date: "2026-05-15T14:20:00Z", amount: 2400, status: "Delivered" },
    { id: "ORD-0910", date: "2026-04-02T09:10:00Z", amount: 800, status: "Delivered" }
  ],
  "CUST-002": [
    { id: "ORD-0990", date: "2026-05-20T14:15:00Z", amount: 4200, status: "Delivered" }
  ],
  "CUST-003": [
    { id: "ORD-0550", date: "2025-11-10T11:00:00Z", amount: 850, status: "Delivered" }
  ],
  "CUST-004": [
    { id: "ORD-1012", date: "2026-06-07T09:20:00Z", amount: 1500, status: "Processing" },
    { id: "ORD-0995", date: "2026-05-25T16:40:00Z", amount: 3500, status: "Delivered" }
  ],
  "CUST-005": []
};

// API Functions

export const getCustomers = async () => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 600));
  return MOCK_CUSTOMERS;
};

export const getCustomerById = async (id) => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const customer = MOCK_CUSTOMERS.find((c) => c.id === id);
  if (!customer) throw new Error("Customer not found");
  return customer;
};

export const getCustomerOrders = async (id) => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return MOCK_ORDERS[id] || [];
};

export const getCustomerStats = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const totalCustomers = MOCK_CUSTOMERS.length;
  const activeCustomers = MOCK_CUSTOMERS.filter((c) => c.status === "Active").length;
  const newCustomers = MOCK_CUSTOMERS.filter((c) => c.status === "New").length;
  const totalRevenue = MOCK_CUSTOMERS.reduce((sum, c) => sum + c.totalSpend, 0);

  return {
    totalCustomers,
    activeCustomers,
    newCustomers,
    totalRevenue
  };
};
