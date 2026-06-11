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
        <div key={idx} className="kpi-card bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s ease, transform 0.2s ease' }}>
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase">
              {card.title}
            </p>
            <p className="text-3xl font-bold leading-none text-gray-900">
              {card.value}
            </p>
          </div>
          <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${card.color}`}>
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
