import React from 'react';
import { Package, IndianRupee, TrendingUp, CalendarClock } from 'lucide-react';

export default function InventoryKPICards({ kpis }) {
  if (!kpis) return null;

  const { currentStock, inventoryValue, averageDailySales, daysUntilReorder } = kpis;

  const cards = [
    {
      title: 'Current Stock',
      value: `${currentStock} Units`,
      icon: Package,
      iconColor: 'text-brand-700',
      bgColor: 'bg-brand-50',
    },
    {
      title: 'Inventory Value',
      value: `₹${inventoryValue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      iconColor: 'text-brand-700',
      bgColor: 'bg-brand-50',
    },
    {
      title: 'Avg. Daily Sales',
      value: `${averageDailySales} Units/Day`,
      icon: TrendingUp,
      iconColor: 'text-brand-700',
      bgColor: 'bg-brand-50',
    },
    {
      title: 'Stock Will Last For',
      value: daysUntilReorder === 999 ? '> 99 Days' : `${daysUntilReorder} Days`,
      icon: CalendarClock,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-card rounded-xl border border-border p-5 flex items-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group min-h-[96px]">
          <div className="flex items-center gap-4 w-full">
            <div className={`p-3 rounded-xl ${card.bgColor} ${card.iconColor}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-muted-foreground uppercase ">{card.title}</span>
              <span className="text-2xl font-bold text-ink leading-none">{card.value}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
