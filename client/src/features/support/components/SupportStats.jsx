import { HeadphonesIcon, AlertCircle, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

export default function SupportStats({ stats }) {
  if (!stats) return null;

  const items = [
    { title: "Total Tickets", value: stats.total, icon: HeadphonesIcon, color: "text-brand-700", bg: "bg-brand-100" },
    { title: "Open Tickets", value: stats.open, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-100" },
    { title: "In Progress", value: stats.inProgress, icon: Clock, color: "text-brand-700", bg: "bg-brand-100" },
    { title: "Resolved", value: stats.resolved, icon: CheckCircle2, color: "text-brand-700", bg: "bg-brand-100" },
    { title: "High Priority", value: stats.highPriority, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="kpi-card bg-card rounded-xl border border-border p-5 flex items-center justify-between"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s ease, transform 0.2s ease' }}>
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-faint  uppercase">
                {item.title}
              </p>
              <p className="text-3xl font-bold leading-none text-ink">
                {item.value != null ? item.value : '—'}
              </p>
            </div>
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${item.bg}`}>
              <Icon size={24} className={item.color} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
