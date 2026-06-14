'use client'
import StatCard from "@/features/orders/components/dashboard/StatCard"

export default function PaymentKPIs({ stats }) {
  if (!stats) return null;

  const kpiData = [
    { label: 'SUCCESSFUL',         value: stats.successfulPayments?.toLocaleString('en-IN'), color: '#16a34a' },
    { label: 'FAILED',             value: stats.failedPayments?.toLocaleString('en-IN'),     color: '#dc2626' },
    { label: 'PENDING',            value: stats.pendingPayments?.toLocaleString('en-IN'),    color: '#f59e0b' },
    { label: 'REFUNDED',           value: stats.refundedPayments?.toLocaleString('en-IN'),   color: '#c2410c' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {kpiData.map(({ label, value, color }) => (
        <StatCard key={label} label={label} value={value} valueColor={color} />
      ))}
    </div>
  );
}
