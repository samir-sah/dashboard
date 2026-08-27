import React from 'react';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export default function ReorderStatusBadge({ status, inventoryStatus }) {
  // Try to use the most urgent status
  const displayStatus = status === 'Immediate Reorder Required' || status === 'Out Of Stock' 
    ? status 
    : inventoryStatus === 'Critical' || inventoryStatus === 'Low Stock'
      ? inventoryStatus
      : status;

  let colorClass = 'bg-green-100 text-green-800 border-green-200';
  let icon = <CheckCircle2 size={16} className="text-green-600" />;

  if (displayStatus === 'Out Of Stock') {
    colorClass = 'bg-red-100 text-red-800 border-red-200';
    icon = <AlertTriangle size={16} className="text-red-600" />;
  } else if (displayStatus === 'Immediate Reorder Required' || displayStatus === 'Critical') {
    colorClass = 'bg-red-100 text-red-800 border-red-200';
    icon = <AlertTriangle size={16} className="text-red-600" />;
  } else if (displayStatus === 'Restock Soon' || displayStatus === 'Low Stock') {
    colorClass = 'bg-amber-100 text-amber-800 border-amber-200';
    icon = <Clock size={16} className="text-amber-600" />;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
      {icon}
      {displayStatus}
    </span>
  );
}
