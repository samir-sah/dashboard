# Mavoix Solutions
## HBT-SBX-API

# Business Dashboard Backend API

A comprehensive backend API for managing orders, customers, revenue analytics, inventory, and customer support.

## Table of Contents

- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)

---

## Getting Started

### Prerequisites

- Node.js v16+
- MongoDB
- npm/yarn

### Installation

```bash
git clone https://github.com/yourusername/sbx-hbt-api.git
cd sbx-hbt-api
npm install
```

### Environment Variables

```env
PORT=4400
MONGODB_URI=mongodb://localhost:27017/business-dashboard

```

### Running the Server

```bash
npm run dev
```

---

## API Endpoints

### Dashboard

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/dashboard/summary` | GET | Get dashboard summary metrics |
| `/dashboard/charts` | GET | Get chart data for visualizations |
| `/dashboard/recent-activity` | GET | Get recent activity feed |

### Orders

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/order/search` | GET | Search orders |
| `/api/orders/search` | GET | Search orders (alternative) |
| `/orders` | GET | Get all orders |
| `/orders/{orderId}` | GET | Get order details |
| `/orders/{orderId}/cancel` | PATCH | Cancel an order |
| `/orders/{orderId}/timeline` | GET | Get order timeline |
| `/orders/{orderId}/invoice` | GET | Get order invoice |
| `/orders/{orderId}/status` | PATCH | Update order status |

### Customers

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/customers` | GET | Get all customers |
| `/customers/{customerId}` | GET | Get customer details |
| `/customers/{customerId}/orders` | GET | Get customer orders |

**Query Parameters for `/customers`:**
- `isActive` - Filter active customers
- `isInCart` - Filter customers with cart items
- `search` - Search by name or email
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10)

### Revenue

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/revenue/analytics` | GET | Get revenue analytics |
| `/revenue/charts` | GET | Get revenue chart data |
| `/revenue/breakdown` | GET | Get revenue breakdown by year |
| `/revenue/ledger` | GET | Get revenue ledger |

**Query Parameters:**
- `/revenue/charts?range=daily|weekly|monthly&startDate=&endDate=`
- `/revenue/breakdown?year=2026`

### Inventory

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/inventory/product` | GET | Get all products |
| `/inventory/products` | GET | Get products (with filters) |
| `/inventory/products` | POST | Create product |
| `/inventory/products/:id` | PATCH | Update product |

**Query Parameters:**
- `lowStock` - Filter low stock items
- `category` - Filter by category

### Support

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/support/tickets` | GET | Get all support tickets |
| `/support/tickets/{ticketId}` | GET | Get ticket details |
| `/support/tickets/{ticketId}/status` | PATCH | Update ticket status |
| `/support/tickets/{ticketId}/assign` | PATCH | Assign ticket to agent |

### Reports

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/reports/orders` | GET | Get orders report |
| `/reports/revenue` | GET | Get revenue report |


---

## Error Handling

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid query parameters"
}
```


### 404 Not Found
```json
{
  "success": false,
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal Server Error"
}
```

---
