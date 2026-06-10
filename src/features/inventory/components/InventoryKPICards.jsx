import React from 'react';
import { Package, IndianRupee, TrendingUp, CalendarClock } from 'lucide-react';

export default function InventoryKPICards({ kpis }) {
  if (!kpis) return null;

  const { currentStock, inventoryValue, averageDailySales, daysUntilReorder } = kpis;

  const cards = [
    {
      title: 'Current Stock',
      value: `${currentStock} Units`,
      icon: <Package size={24} className="text-blue-600" />,
      color: 'bg-blue-50',
    },
    {
      title: 'Inventory Value',
      value: `₹${inventoryValue.toLocaleString('en-IN')}`,
      icon: <IndianRupee size={24} className="text-emerald-600" />,
      color: 'bg-emerald-50',
    },
    {
      title: 'Avg. Daily Sales',
      value: `${averageDailySales} Units/Day`,
      icon: <TrendingUp size={24} className="text-purple-600" />,
      color: 'bg-purple-50',
    },
    {
      title: 'Stock Will Last For',
      value: daysUntilReorder === 999 ? '> 99 Days' : `${daysUntilReorder} Days`,
      icon: <CalendarClock size={24} className="text-amber-600" />,
      color: 'bg-amber-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => (
        <div key={idx} className="rounded-2xl border border-gray-100 p-6 flex items-center justify-between bg-white shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-shadow hover:shadow-[0_4px_16px_rgb(0,0,0,0.04)]">
          <div className="flex flex-col gap-1">
            <span className="text-[13px] font-medium text-gray-500">{card.title}</span>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">{card.value}</span>
          </div>
          <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${card.color}`}>
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
