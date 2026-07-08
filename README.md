# HealthyBit Admin Dashboard

**Internal business operations console for Mavoix Solutions**

A comprehensive admin dashboard to manage order fulfillment, customer support, inventory, payments, and reporting.

---

## Features

- 📊 **Dashboard**: Executive KPIs and metrics.
- 👥 **Customers**: Manage CRM profiles and linked devices.
- 📦 **Inventory**: Track stock levels and low-stock alerts.
- 🛒 **Orders**: Full order lifecycle management.
- 💳 **Payments**: Monitor transactions and revenue.
- 🎧 **Support**: Ticketing system and agent assignments.
- 📈 **Reports**: View and export business reports.

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