/**
 * Database Seed Script
 * Populates MongoDB with realistic demo data for the Healthy Bit dashboard.
 * 
 * Usage: node scripts/seed.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const { connectToDatabase, disconnectFromDatabase } = require("../src/config/database");

// Models
const Admin = require("../src/models/admin.model");
const User = require("../src/models/user.model");
const Product = require("../src/models/product.model");
const Order = require("../src/models/orders.model");
const Payment = require("../src/models/payment.model");
const Invoice = require("../src/models/invoice.model");
const SupportTicket = require("../src/models/supportTicket.model");

// ─── Helpers ──────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgo = (d) => new Date(Date.now() - d * 86400000);
const randomDate = (startDaysAgo, endDaysAgo = 0) => {
  const start = Date.now() - startDaysAgo * 86400000;
  const end = Date.now() - endDaysAgo * 86400000;
  return new Date(start + Math.random() * (end - start));
};

// ─── Static Data ──────────────────────────────────────────
const INDIAN_STATES = [
  "Maharashtra", "Karnataka", "Delhi", "Tamil Nadu", "Gujarat",
  "Rajasthan", "Uttar Pradesh", "West Bengal", "Telangana", "Kerala",
  "Madhya Pradesh", "Punjab", "Haryana", "Bihar", "Odisha"
];

const CITIES = {
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubli", "Mangaluru"],
  "Delhi": ["New Delhi", "Dwarka", "Rohini", "Saket"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
  "Uttar Pradesh": ["Lucknow", "Noida", "Agra", "Varanasi"],
  "West Bengal": ["Kolkata", "Howrah", "Siliguri", "Durgapur"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
  "Kerala": ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur"],
  "Punjab": ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Karnal"],
  "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Puri"]
};

const STREETS = [
  "MG Road", "Station Road", "Gandhi Nagar", "Nehru Street", "Civil Lines",
  "Rajendra Nagar", "Shivaji Nagar", "Sadar Bazaar", "Ring Road", "Park Street",
  "Laxmi Nagar", "Vikas Marg", "Anna Salai", "Brigade Road", "Banjara Hills"
];

const FIRST_NAMES_M = ["Aarav", "Vivaan", "Aditya", "Arjun", "Sai", "Rahul", "Rohan", "Vikram", "Karan", "Amit", "Rajesh", "Suresh", "Deepak", "Manish", "Nikhil", "Prashant", "Sandeep", "Ajay", "Mohit", "Gaurav"];
const FIRST_NAMES_F = ["Ananya", "Priya", "Ishita", "Kavya", "Sneha", "Pooja", "Riya", "Divya", "Neha", "Meera", "Shruti", "Pallavi", "Swati", "Nandini", "Sakshi", "Aishwarya", "Tanvi", "Isha", "Ritika", "Simran"];
const LAST_NAMES = ["Sharma", "Patel", "Gupta", "Singh", "Kumar", "Reddy", "Nair", "Joshi", "Verma", "Mehta", "Mishra", "Rao", "Das", "Pillai", "Iyer", "Bhat", "Choudhary", "Malhotra", "Saxena", "Kapoor"];

const PRODUCTS_DATA = [
  { productId: "HBT-001", productName: "HealthyBit Pro Band", sku: "HBT-PRO-BLK", category: "Fitness Band", supplier: "MedTech Solutions Pvt Ltd", hsnCode: "90189099", price: 4999, taxRate: 18, stock: 145, maxCapacity: 300, reorderPoint: 50, lowStockThreshold: 25, totalSold: 892 },
  { productId: "HBT-002", productName: "HealthyBit Lite Band", sku: "HBT-LTE-WHT", category: "Fitness Band", supplier: "MedTech Solutions Pvt Ltd", hsnCode: "90189099", price: 2499, taxRate: 18, stock: 210, maxCapacity: 400, reorderPoint: 80, lowStockThreshold: 40, totalSold: 1456 },
  { productId: "HBT-003", productName: "HealthyBit BP Monitor", sku: "HBT-BPM-100", category: "Health Monitor", supplier: "VitalCare Instruments", hsnCode: "90181100", price: 3299, taxRate: 12, stock: 78, maxCapacity: 200, reorderPoint: 40, lowStockThreshold: 20, totalSold: 634 },
  { productId: "HBT-004", productName: "HealthyBit Pulse Oximeter", sku: "HBT-POX-200", category: "Health Monitor", supplier: "VitalCare Instruments", hsnCode: "90189099", price: 1899, taxRate: 12, stock: 312, maxCapacity: 500, reorderPoint: 100, lowStockThreshold: 50, totalSold: 2103 },
  { productId: "HBT-005", productName: "HealthyBit Smart Scale", sku: "HBT-SCL-300", category: "Smart Device", supplier: "FitGear India", hsnCode: "84231000", price: 3799, taxRate: 18, stock: 56, maxCapacity: 150, reorderPoint: 30, lowStockThreshold: 15, totalSold: 445 },
  { productId: "HBT-006", productName: "HealthyBit Thermometer", sku: "HBT-THR-400", category: "Health Monitor", supplier: "VitalCare Instruments", hsnCode: "90251100", price: 999, taxRate: 12, stock: 420, maxCapacity: 600, reorderPoint: 120, lowStockThreshold: 60, totalSold: 3210 },
  { productId: "HBT-007", productName: "HealthyBit Sleep Tracker", sku: "HBT-SLP-500", category: "Smart Device", supplier: "FitGear India", hsnCode: "90189099", price: 5499, taxRate: 18, stock: 33, maxCapacity: 100, reorderPoint: 20, lowStockThreshold: 10, totalSold: 287 },
  { productId: "HBT-008", productName: "HealthyBit Glucometer Kit", sku: "HBT-GLU-600", category: "Health Monitor", supplier: "MedTech Solutions Pvt Ltd", hsnCode: "90189099", price: 2199, taxRate: 5, stock: 189, maxCapacity: 350, reorderPoint: 70, lowStockThreshold: 35, totalSold: 1678 },
  { productId: "HBT-009", productName: "HealthyBit ECG Monitor", sku: "HBT-ECG-700", category: "Health Monitor", supplier: "CardioTech Labs", hsnCode: "90181100", price: 8999, taxRate: 12, stock: 18, maxCapacity: 60, reorderPoint: 12, lowStockThreshold: 6, totalSold: 156 },
  { productId: "HBT-010", productName: "HealthyBit Nebulizer", sku: "HBT-NEB-800", category: "Medical Device", supplier: "BreathEasy Healthcare", hsnCode: "90192000", price: 2799, taxRate: 12, stock: 95, maxCapacity: 200, reorderPoint: 40, lowStockThreshold: 20, totalSold: 523 },
];

const PAYMENT_METHODS = ["UPI", "Credit Card", "Debit Card", "Netbanking", "Wallet"];
const TICKET_CATEGORIES = ["Delivery", "Payment", "Product", "Order", "Return", "Refund", "Account", "Other"];
const TICKET_SUBJECTS = {
  "Delivery": ["Order not delivered yet", "Delivery delayed beyond expected date", "Wrong address on shipment", "Package damaged during delivery"],
  "Payment": ["Payment deducted but order not confirmed", "Double charged for order", "Refund not received", "Payment failed but amount debited"],
  "Product": ["Device not turning on", "Battery draining fast", "Readings are inaccurate", "Screen display issue"],
  "Order": ["Want to change order address", "Cancel my order please", "Order showing wrong status", "Need to add item to existing order"],
  "Return": ["Want to return defective product", "Return pickup not scheduled", "Return request rejected wrongly", "Product received in damaged condition"],
  "Refund": ["Refund pending for 15 days", "Partial refund received", "Refund to wrong account", "When will I get my refund?"],
  "Account": ["Unable to login", "Update my phone number", "Delete my account", "Profile details not updating"],
  "Other": ["Need product manual", "Warranty claim process", "Bulk order inquiry", "Partnership opportunity"]
};

// ─── Generator Functions ──────────────────────────────────
function makeAddress(fullName, phone) {
  const state = pick(INDIAN_STATES);
  const city = pick(CITIES[state]);
  return {
    fullName,
    phone,
    addressLine1: `Flat ${randInt(101, 1204)}, ${pick(["Tower A", "Tower B", "Block C", "Wing D", "Building E"])}`,
    street: pick(STREETS),
    city,
    state,
    pincode: String(randInt(100000, 999999)),
    country: "India"
  };
}

function makeUser(index) {
  const isMale = Math.random() > 0.45;
  const firstName = pick(isMale ? FIRST_NAMES_M : FIRST_NAMES_F);
  const lastName = pick(LAST_NAMES);
  const phone = `${pick(["98", "97", "96", "95", "94", "93", "91", "90", "88", "87", "86", "85"])}${String(randInt(10000000, 99999999))}`;
  const createdAt = randomDate(365, 10);

  const shippingAddr = {
    type: "shipping",
    ...makeAddress(`${firstName} ${lastName}`, phone),
    isDefault: true,
  };
  const billingAddr = {
    type: "billing",
    ...makeAddress(`${firstName} ${lastName}`, phone),
    isDefault: true,
  };

  return {
    phone,
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randInt(1, 999)}@${pick(["gmail.com", "outlook.com", "yahoo.co.in", "rediffmail.com"])}`,
    gender: isMale ? "male" : "female",
    role: "Customer",
    isActive: Math.random() > 0.05,
    isPhoneVerified: true,
    isInCart: false,
    addresses: [shippingAddr, billingAddr],
    lastLogin: randomDate(30, 0),
    createdAt,
    updatedAt: new Date(),
  };
}

// ─── Main Seed ────────────────────────────────────────────
async function seed() {
  console.log("🌱 Connecting to database...");
  await connectToDatabase();

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await Promise.all([
    Admin.deleteMany({}),
    User.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Payment.deleteMany({}),
    Invoice.deleteMany({}),
    SupportTicket.deleteMany({}),
  ]);

  // 1. Admin (demo user)
  console.log("👤 Creating admin...");
  const admin = await Admin.create({
    firstName: "Demo",
    lastName: "Admin",
    phoneNumber: "0000000000",
    role: "Admin",
    isPhoneVerified: true,
  });

  // 2. Products
  console.log("📦 Creating products...");
  const products = [];
  for (const p of PRODUCTS_DATA) {
    const product = await Product.create({
      ...p,
      isActive: true,
      outOfStock: p.stock === 0,
      lastRestockedAt: randomDate(60, 5),
      nextRestockDate: new Date(Date.now() + randInt(7, 30) * 86400000),
    });
    products.push(product);
  }

  // 3. Users (40 realistic customers)
  console.log("👥 Creating 40 users...");
  const users = [];
  for (let i = 0; i < 40; i++) {
    const userData = makeUser(i);
    const user = await User.create(userData);
    users.push(user);
  }

  // 4. Orders (80 orders spread over last 6 months)
  console.log("🛒 Creating 80 orders...");
  const ORDER_STATUSES = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];
  const orders = [];

  for (let i = 0; i < 80; i++) {
    const user = pick(users);
    const numItems = randInt(1, 3);
    const selectedProducts = [];
    const usedIndices = new Set();
    for (let j = 0; j < numItems; j++) {
      let idx;
      do { idx = randInt(0, products.length - 1); } while (usedIndices.has(idx));
      usedIndices.add(idx);
      selectedProducts.push(products[idx]);
    }

    const orderItems = selectedProducts.map(p => ({
      productId: p._id,
      productName: p.productName,
      sku: p.sku,
      hsnCode: p.hsnCode,
      taxRate: p.taxRate,
      price: p.price,
      quantity: randInt(1, 2),
      serialNumber: `SN-${p.sku}-${String(randInt(100000, 999999))}`,
      warrantyStatus: pick(["Active", "Not Available", "Expired"]),
      warrantyValidTill: new Date(Date.now() + randInt(90, 730) * 86400000),
    }));

    const subtotal = orderItems.reduce((s, item) => s + item.price * item.quantity, 0);
    const shipping = subtotal > 5000 ? 0 : pick([49, 79, 99, 149]);
    const totalAmount = subtotal + shipping;

    const orderDate = randomDate(180, 1);
    // Determine a realistic final status
    const daysSinceOrder = (Date.now() - orderDate.getTime()) / 86400000;
    let finalStatus;
    if (daysSinceOrder > 30) finalStatus = Math.random() > 0.12 ? "Delivered" : "Cancelled";
    else if (daysSinceOrder > 14) finalStatus = pick(["Delivered", "Delivered", "Shipped", "Cancelled"]);
    else if (daysSinceOrder > 5) finalStatus = pick(["Shipped", "Processing", "Delivered"]);
    else finalStatus = pick(["Confirmed", "Processing", "Pending"]);

    // Build status history
    const statusFlow = ORDER_STATUSES.slice(0, ORDER_STATUSES.indexOf(finalStatus) + 1);
    const statusHistory = statusFlow.map((status, idx) => ({
      status,
      updatedAt: new Date(orderDate.getTime() + idx * randInt(1, 3) * 86400000),
    }));

    const paymentStatus = finalStatus === "Cancelled" ? pick(["Refunded", "Completed"]) : "Completed";
    const method = pick(PAYMENT_METHODS);

    const shippingAddr = makeAddress(`${user.firstName} ${user.lastName}`, user.phone);
    const billingAddr = makeAddress(`${user.firstName} ${user.lastName}`, user.phone);

    const order = await Order.create({
      userId: user._id,
      orderDate,
      customer: { shippingAddress: shippingAddr, billingAddress: billingAddr },
      orderItems,
      statusHistory,
      expectedArriveDate: new Date(orderDate.getTime() + randInt(5, 12) * 86400000),
      isInCart: false,
      shippingCharges: shipping,
      payment: {
        method,
        gateway: "Razorpay",
        status: paymentStatus,
        transactionId: `txn_${Date.now().toString(36)}${randInt(1000, 9999)}`,
        amount: totalAmount,
        paidAt: paymentStatus === "Completed" ? new Date(orderDate.getTime() + randInt(0, 2) * 3600000) : undefined,
        razorpayOrderId: `order_${Buffer.from(String(randInt(100000000, 999999999))).toString("base64").slice(0, 14)}`,
        razorpayPaymentId: `pay_${Buffer.from(String(randInt(100000000, 999999999))).toString("base64").slice(0, 14)}`,
      },
      totalAmount,
      cancellationReason: finalStatus === "Cancelled" ? pick(["Changed my mind", "Found better price", "Ordered by mistake", "Delivery too slow"]) : undefined,
      invoiceStatus: finalStatus === "Delivered" ? "Generated" : "Pending",
      createdAt: orderDate,
      updatedAt: statusHistory[statusHistory.length - 1].updatedAt,
    });
    orders.push(order);
  }

  // 5. Payments (one per order)
  console.log("💳 Creating payments...");
  for (const order of orders) {
    const payStatus = order.payment.status;
    const hist = [
      { status: "Initiated", updatedAt: order.orderDate, note: "Payment initiated by customer" },
      { status: "Pending", updatedAt: new Date(order.orderDate.getTime() + 30000), note: "Awaiting gateway confirmation" },
    ];
    if (payStatus === "Completed" || payStatus === "Refunded") {
      hist.push({ status: "Completed", updatedAt: new Date(order.orderDate.getTime() + 120000), note: "Payment confirmed by Razorpay" });
    }
    if (payStatus === "Refunded") {
      hist.push({ status: "Refunded", updatedAt: new Date(order.orderDate.getTime() + 5 * 86400000), note: "Order cancelled — full refund processed" });
    }

    await Payment.create({
      orderId: order._id,
      userId: order.userId,
      amount: order.totalAmount,
      currency: "INR",
      method: order.payment.method,
      gateway: "Razorpay",
      status: payStatus,
      statusHistory: hist,
      razorpayOrderId: order.payment.razorpayOrderId,
      razorpayPaymentId: order.payment.razorpayPaymentId,
      razorpaySignature: `sig_${Buffer.from(String(randInt(100000000, 999999999))).toString("base64").slice(0, 20)}`,
      refund: payStatus === "Refunded" ? {
        amount: order.totalAmount,
        reason: order.cancellationReason || "Customer requested cancellation",
        razorpayRefundId: `rfnd_${Buffer.from(String(randInt(100000000, 999999999))).toString("base64").slice(0, 14)}`,
        initiatedAt: new Date(order.orderDate.getTime() + 3 * 86400000),
        completedAt: new Date(order.orderDate.getTime() + 5 * 86400000),
      } : undefined,
      attemptNumber: 1,
      createdAt: order.orderDate,
    });
  }

  // 6. Invoices (for delivered orders)
  console.log("🧾 Creating invoices...");
  const deliveredOrders = orders.filter(o =>
    o.statusHistory.some(s => s.status === "Delivered") && o.invoiceStatus === "Generated"
  );
  for (const order of deliveredOrders) {
    const user = users.find(u => u._id.equals(order.userId));
    const invoiceItems = order.orderItems.map(item => ({
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      hsnCode: item.hsnCode,
      price: item.price,
      quantity: item.quantity,
      taxRate: item.taxRate,
      total: item.price * item.quantity,
    }));

    const subtotal = invoiceItems.reduce((s, it) => s + it.total, 0);
    const taxAmount = invoiceItems.reduce((s, it) => s + (it.total * it.taxRate / 100), 0);

    await Invoice.create({
      orderId: order._id,
      orderDisplayId: order.orderId,
      customer: {
        userId: user._id,
        fullName: `${user.firstName} ${user.lastName}`,
        phone: user.phone,
        email: user.email,
        shippingAddress: order.customer.shippingAddress,
        billingAddress: order.customer.billingAddress,
      },
      invoiceItems,
      financials: {
        subtotal,
        taxAmount: Math.round(taxAmount * 100) / 100,
        shippingCharges: order.shippingCharges,
        totalAmount: order.totalAmount,
      },
      payment: {
        method: order.payment.method,
        gateway: "Razorpay",
        status: "Completed",
        transactionId: order.payment.transactionId,
        amount: order.totalAmount,
        paidAt: order.payment.paidAt,
      },
      status: "Paid",
      issuedAt: order.statusHistory.find(s => s.status === "Delivered")?.updatedAt || order.orderDate,
    });
  }

  // 7. Support Tickets (25 tickets)
  console.log("🎫 Creating 25 support tickets...");
  for (let i = 0; i < 25; i++) {
    const user = pick(users);
    const category = pick(TICKET_CATEGORIES);
    const subject = pick(TICKET_SUBJECTS[category]);
    const createdAt = randomDate(90, 1);
    const priority = pick(["Low", "Medium", "Medium", "High"]);

    const statusOptions = ["Open", "In Progress", "Resolved", "Closed"];
    const daysSince = (Date.now() - createdAt.getTime()) / 86400000;
    let finalStatus;
    if (daysSince > 30) finalStatus = pick(["Resolved", "Closed", "Closed"]);
    else if (daysSince > 10) finalStatus = pick(["In Progress", "Resolved", "Closed"]);
    else finalStatus = pick(["Open", "In Progress", "Resolved"]);

    const statusFlow = statusOptions.slice(0, statusOptions.indexOf(finalStatus) + 1);
    const supportStatusHistory = statusFlow.map((status, idx) => ({
      status,
      updatedAt: new Date(createdAt.getTime() + idx * randInt(1, 5) * 86400000),
    }));

    // Optionally link to a user's order
    const userOrders = orders.filter(o => o.userId.equals(user._id));
    const linkedOrder = userOrders.length > 0 && Math.random() > 0.3 ? pick(userOrders) : null;

    const timeline = [
      { action: "Ticket Created", description: `Customer submitted a ${category.toLowerCase()} issue`, actor: `${user.firstName} ${user.lastName}`, date: createdAt },
    ];
    if (statusFlow.includes("In Progress")) {
      timeline.push({ action: "Assigned to Support", description: "Ticket picked up by support team", actor: "Support Team", date: new Date(createdAt.getTime() + randInt(1, 3) * 86400000) });
    }
    if (statusFlow.includes("Resolved")) {
      timeline.push({ action: "Issue Resolved", description: "Resolution provided to customer", actor: `${admin.firstName} ${admin.lastName}`, date: new Date(createdAt.getTime() + randInt(3, 10) * 86400000) });
    }
    if (statusFlow.includes("Closed")) {
      timeline.push({ action: "Ticket Closed", description: "Customer confirmed resolution", actor: "System", date: new Date(createdAt.getTime() + randInt(5, 15) * 86400000) });
    }

    const comments = [
      { message: subject, createdAt },
    ];
    if (finalStatus !== "Open") {
      comments.push({ message: "We are looking into this issue. Thank you for your patience.", createdAt: new Date(createdAt.getTime() + 86400000) });
    }
    if (finalStatus === "Resolved" || finalStatus === "Closed") {
      comments.push({ message: "This issue has been resolved. Please let us know if you need further assistance.", createdAt: new Date(createdAt.getTime() + randInt(3, 8) * 86400000) });
    }

    await SupportTicket.create({
      userId: user._id,
      orderId: linkedOrder?.orderId || undefined,
      subject,
      issue: `${subject}. ${pick([
        "Please help resolve this at the earliest.",
        "This is very urgent, please look into it immediately.",
        "I have been waiting for a response. Kindly update.",
        "Need assistance with this matter. Thank you.",
        "Please check and revert back as soon as possible.",
      ])}`,
      category,
      supportStatusHistory,
      priority,
      assignedTo: finalStatus !== "Open" ? admin._id : null,
      assignedEngineerName: finalStatus !== "Open" ? `${admin.firstName} ${admin.lastName}` : null,
      source: "Customer Support Portal",
      dueDate: new Date(createdAt.getTime() + (priority === "High" ? 3 : priority === "Medium" ? 7 : 14) * 86400000),
      resolutionNotes: (finalStatus === "Resolved" || finalStatus === "Closed") ? pick([
        "Issue resolved after verifying with the delivery partner.",
        "Refund processed successfully. Customer acknowledged.",
        "Device replaced under warranty. New serial number assigned.",
        "Technical troubleshooting completed. Device working normally now.",
        "Account details updated as per customer request.",
      ]) : undefined,
      comments,
      timeline,
      createdAt,
      updatedAt: supportStatusHistory[supportStatusHistory.length - 1].updatedAt,
    });
  }

  // Summary
  const counts = {
    admins: await Admin.countDocuments(),
    users: await User.countDocuments(),
    products: await Product.countDocuments(),
    orders: await Order.countDocuments(),
    payments: await Payment.countDocuments(),
    invoices: await Invoice.countDocuments(),
    supportTickets: await SupportTicket.countDocuments(),
  };

  console.log("\n✅ Database seeded successfully!");
  console.log("─────────────────────────────────");
  Object.entries(counts).forEach(([k, v]) => console.log(`   ${k.padEnd(16)} ${v}`));
  console.log("─────────────────────────────────");
  console.log("\n🔑 Demo login: POST /api/auth-dashboard/demo-login");

  await disconnectFromDatabase();
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
