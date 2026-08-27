export const orderStatusData = [
  { name: "Delivered", value: 45, count: 560, fill: "#22c55e" }, // 45%
  { name: "Shipped", value: 25, count: 310, fill: "#f97316" }, // 25%
  { name: "Processing", value: 15, count: 186, fill: "#a855f7" }, // 15%
  { name: "Confirmed", value: 10, count: 124, fill: "#3b82f6" }, // 10%
  { name: "Cancelled", value: 5, count: 62, fill: "#ef4444" },  // 5%
];

export const ordersVsUnitsData = [
  { date: "Jan", orders: 100, units: 190 },
  { date: "Feb", orders: 110, units: 215 },
  { date: "Mar", orders: 125, units: 240 },
  { date: "Apr", orders: 140, units: 275 },
  { date: "May", orders: 165, units: 330 },
];

export const customerGrowthData = [
  { month: "Jan", newCustomers: 60 },
  { month: "Feb", newCustomers: 68 },
  { month: "Mar", newCustomers: 75 },
  { month: "Apr", newCustomers: 88 },
  { month: "May", newCustomers: 105 },
];

const historicalRevenue = [
  { month: "Jan", actualRevenue: 145000 },
  { month: "Feb", actualRevenue: 159500 },
  { month: "Mar", actualRevenue: 181250 },
  { month: "Apr", actualRevenue: 203000 },
  { month: "May", actualRevenue: 239250 },
];

// Calculate average growth rate dynamically based on historical data
let totalGrowth = 0;
for (let i = 1; i < historicalRevenue.length; i++) {
  const prev = historicalRevenue[i - 1].actualRevenue;
  const current = historicalRevenue[i].actualRevenue;
  totalGrowth += (current - prev) / prev;
}
export const avgGrowthRate = totalGrowth / (historicalRevenue.length - 1);

// Generate expectedGrowthData dynamically
const lastActual = historicalRevenue[historicalRevenue.length - 1];
export const expectedGrowthData = [
  ...historicalRevenue.map(d => ({ ...d, forecastRevenue: null })),
  { month: lastActual.month, actualRevenue: lastActual.actualRevenue, forecastRevenue: lastActual.actualRevenue },
  { month: "Jun", actualRevenue: null, forecastRevenue: Math.round(lastActual.actualRevenue * (1 + avgGrowthRate)) },
  { month: "Jul", actualRevenue: null, forecastRevenue: Math.round(lastActual.actualRevenue * Math.pow(1 + avgGrowthRate, 2)) },
  { month: "Aug", actualRevenue: null, forecastRevenue: Math.round(lastActual.actualRevenue * Math.pow(1 + avgGrowthRate, 3)) },
];
