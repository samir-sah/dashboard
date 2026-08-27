'use client'
import { CircleCheckBig, CircleX, Clock, RotateCcw } from 'lucide-react'
import StatCard from "@/features/orders/components/dashboard/StatCard"

export default function PaymentKPIs({ stats }) {
  if (!stats) return null;

  const kpiData = [
    { label: 'SUCCESSFUL', value: stats.successfulPayments?.toLocaleString('en-IN') ?? '0', icon: CircleCheckBig, iconColor: 'text-brand-700', iconBg: 'bg-brand-100' },
    { label: 'FAILED',     value: stats.failedPayments?.toLocaleString('en-IN')     ?? '0', icon: CircleX,        iconColor: 'text-red-600',      iconBg: 'bg-red-100' },
    { label: 'PENDING',    value: stats.pendingPayments?.toLocaleString('en-IN')    ?? '0', icon: Clock,          iconColor: 'text-amber-600',    iconBg: 'bg-amber-100' },
    { label: 'REFUNDED',   value: stats.refundedPayments?.toLocaleString('en-IN')   ?? '0', icon: RotateCcw,      iconColor: 'text-orange-600',   iconBg: 'bg-orange-100' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {kpiData.map(({ label, value, icon, iconColor, iconBg }) => (
        <StatCard key={label} label={label} value={value} icon={icon} iconColor={iconColor} iconBg={iconBg} />
      ))}
    </div>
  );
}
