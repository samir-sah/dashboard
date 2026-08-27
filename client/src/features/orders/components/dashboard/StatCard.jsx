'use client'

/**
 * StatCard — Unified KPI card matching the design pattern used across
 * Customers, Inventory, and Support sections.
 *
 * Props:
 *   label      — KPI title (uppercase label)
 *   value      — KPI metric value
 *   icon       — Lucide icon component
 *   iconColor  — Tailwind text color class for the icon (e.g. "text-brand-700")
 *   iconBg     — Tailwind bg color class for the icon circle (e.g. "bg-brand-100")
 *   valueColor — (legacy) Direct color override for the value text — ignored if icon is provided
 */
export default function StatCard({ label, value, icon: Icon, iconColor, iconBg, valueColor }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex items-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group min-h-[96px]">
      <div className="flex items-center gap-4 w-full">
        {Icon && (
          <div className={`p-3 rounded-xl ${iconBg || 'bg-surface-elevated'} ${iconColor || 'text-muted-foreground'}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-muted-foreground uppercase ">{label}</span>
          <span className="text-2xl font-bold text-ink leading-none">{value}</span>
        </div>
      </div>
    </div>
  )
}