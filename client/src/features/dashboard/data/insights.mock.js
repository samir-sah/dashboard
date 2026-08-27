export const genderOrdersData = [
  { name: "Male", value: 682, fill: "#3b82f6" },
  { name: "Female", value: 563, fill: "#ec4899" },
];

export const customerStatsData = {
  newCustomers: { value: 84, trend: "+12.4%" },
  returningCustomers: { value: 276, trend: "+8.7%" },
  repeatPurchaseRate: { value: "32.9%", trend: "+4.2%" },
};

export const businessGrowthData = {
  overallGrowth: "+18.6%",
  revenueGrowth: "+14%",
  orderGrowth: "+22%",
  trendData: [
    { date: "W1", value: 50 },
    { date: "W2", value: 120 },
    { date: "W3", value: 250 },
    { date: "W4", value: 300 },
    { date: "W5", value: 380 },
  ],
};

export const lowStockData = [
  {
    id: 1,
    name: "HealthyBit CGM Lite",
    remaining: 15,
    total: 200,
    status: "critical"
  },
  {
    id: 2,
    name: "HealthyBit Sensor",
    remaining: 8,
    total: 150,
    status: "critical"
  },
  {
    id: 3,
    name: "HealthyBit Test Strips",
    remaining: 12,
    total: 300,
    status: "critical"
  }
];

export const stateWiseOrdersData = [
  { state: "Karnataka", orders: 245, revenue: "₹1,45,000", growth: "+12%" },
  { state: "Maharashtra", orders: 198, revenue: "₹1,12,000", growth: "+8%" },
  { state: "Delhi", orders: 164, revenue: "₹98,000", growth: "+15%" },
  { state: "Tamil Nadu", orders: 121, revenue: "₹76,000", growth: "+5%" },
  { state: "Telangana", orders: 98, revenue: "₹54,000", growth: "+2%" },
  { state: "West Bengal", orders: 76, revenue: "₹32,000", growth: "-1%" },
];

export const topPerformingStatesData = [
  { rank: 1, state: "Karnataka", orders: 245, revenue: "₹1.45L", growth: "+12%" },
  { rank: 2, state: "Maharashtra", orders: 198, revenue: "₹1.12L", growth: "+8%" },
  { rank: 3, state: "Delhi", orders: 164, revenue: "₹98k", growth: "+15%" },
  { rank: 4, state: "Tamil Nadu", orders: 121, revenue: "₹76k", growth: "+5%" },
  { rank: 5, state: "Telangana", orders: 98, revenue: "₹54k", growth: "+2%" },
];

export const recentOrdersData = [
  { id: "ORD1023", customer: "Ramesh Kumar", date: "May 20, 10:45 AM", amount: "₹4,250", status: "Processing" },
  { id: "ORD1022", customer: "Priya Sharma", date: "May 20, 09:30 AM", amount: "₹2,880", status: "Delivered" },
  { id: "ORD1021", customer: "Amit Verma", date: "May 20, 08:15 AM", amount: "₹1,950", status: "Shipped" },
  { id: "ORD1020", customer: "Neha Singh", date: "May 19, 07:40 PM", amount: "₹3,120", status: "Processing" },
  { id: "ORD1019", customer: "Vikash Mehta", date: "May 19, 06:20 PM", amount: "₹2,150", status: "Confirmed" },
];
