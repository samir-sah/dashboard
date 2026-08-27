# HealthyBit Admin Dashboard

**Internal business operations console for Mavoix Solutions**

The HealthyBit Admin Dashboard is an internal tool built for Mavoix Solutions. It serves as a central hub for the company's staff (like support agents, managers, and admins) to monitor and control the day-to-day operations of the business. It allows the team to handle everything from processing customer orders to providing support and managing warehouse stock in a single, unified web portal.

---

## What Each Section Does

- 📊 **Dashboard**: A high-level overview of the business, showing key performance metrics (KPIs) like total sales, active orders, and pending support tickets at a glance.
- 👥 **Customers**: A CRM (Customer Relationship Management) section where staff can view detailed customer profiles, their purchase history, and their linked devices.
- 📦 **Inventory**: Allows warehouse staff and managers to monitor current product stock levels in real-time, view where items are allocated, and receive alerts when stock is running low.
- 🛒 **Orders**: Tracks the entire lifecycle of a customer's order, from the moment it is created to fulfillment, shipping, and final delivery.
- 💳 **Payments**: Displays all financial transactions, tracks payment statuses (e.g., successful, failed, refunded), and helps reconcile revenue.
- 🎧 **Support**: A complete ticketing system for customer service, allowing support agents to receive customer issues, assign them to team members, track them through a clear timeline, and resolve them efficiently.
- 📈 **Reports**: Provides detailed, exportable data and analytics across all the different modules for business reporting and auditing.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Library:** React 19
- **Styling:** Tailwind CSS v4, Shadcn UI
- **State Management:** TanStack React Query v5
- **HTTP Client:** Axios

## Getting Started

### Prerequisites

- **Node.js** v18.17.0+
- **npm** v9+ 
- Access to the `sbx-hbt-api` backend

### Installation

1. Clone the repository and install dependencies:
   ```bash
   git clone <repository-url>
   cd mavoix-production-frontend
   npm install
   ```
2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   *Fill in the required variables in `.env.local`.*

3. Start the development server:
   ```bash
   npm run dev
   ```
   The app will run at [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API |
| `NEXT_PUBLIC_APP_ENV` | Current environment label (`development`, `production`) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Public Razorpay key (if payments are active locally) |

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## License

Proprietary — © Mavoix Solutions. Internal use only.