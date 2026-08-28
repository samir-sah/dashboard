# Synera Admin Dashboard

**Modern business operations console for Synera**  
🌐 **Live Platform:** [https://syneraaa.vercel.app](https://syneraaa.vercel.app)

The **Synera Admin Dashboard** is a unified business operations console. It serves as a central hub for staff, support agents, managers, and administrators to monitor and control the day-to-day operations of the business. It enables teams to handle everything from processing customer orders to providing support and managing inventory stock in a single, streamlined web portal.

---

## What Each Section Does

- 📊 **Dashboard**: High-level business overview showing key performance metrics (KPIs) like total revenue, active orders, customer growth, and pending support tickets at a glance.
- 👥 **Customers**: CRM section where staff can view customer profiles, purchase history, delivery addresses, and linked devices.
- 📦 **Inventory**: Real-time stock level monitoring, product allocation, catalog updates, and automated low-stock warnings.
- 🛒 **Orders**: Complete order lifecycle tracking, from creation and verification to barcode generation, packing, and fulfillment.
- 💳 **Payments**: Financial transaction ledger, Razorpay verification, payment failure monitoring, and revenue reconciliation.
- 🎧 **Support**: Comprehensive customer service ticketing system for issue triage, support engineer assignment, audit trails, and customer notifications.
- 📈 **Reports**: Detailed, exportable data analytics and Excel exports across business modules for reporting and auditing.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Library:** React 19
- **Styling:** Tailwind CSS v4, Shadcn UI / Radix UI
- **State Management:** TanStack React Query v5
- **Data Visualizations:** Recharts
- **HTTP Client:** apiFetch & Next.js Proxy Rewrites

## Getting Started

### Prerequisites

- **Node.js** v20+
- **npm** v9+
- Running Synera Backend API (local or cloud)

### Installation

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/samir-sah/dashboard.git
   cd dashboard/client
   npm install
   ```
2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   *Set `NEXT_PUBLIC_API_URL` to point to your backend API.*

3. Start the development server:
   ```bash
   npm run dev
   ```
   The app will run at [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API (e.g. `http://localhost:4400`) |
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

Proprietary — © Synera. All rights reserved.