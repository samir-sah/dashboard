'use client'

/**
 * StatCard — Unified KPI card matching the design pattern used across
 * Customers, Inventory, and Support sections.
 *
 * Props:
 *   label      — KPI title (uppercase label)
 *   value      — KPI metric value
 *   icon       — Lucide icon component
 *   iconColor  — Tailwind text color class for the icon (e.g. "text-blue-600")
 *   iconBg     — Tailwind bg color class for the icon circle (e.g. "bg-blue-100")
 *   valueColor — (legacy) Direct color override for the value text — ignored if icon is provided
 */
export default function StatCard({ label, value, icon: Icon, iconColor, iconBg, valueColor }) {
  return (
    <div className="kpi-card bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s ease, transform 0.2s ease' }}>
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase">
          {label}
        </p>
        <p className="text-3xl font-bold leading-none text-gray-900">
          {value}
        </p>
      </div>
      {Icon && (
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${iconBg || 'bg-gray-100'}`}>
          <Icon size={24} className={iconColor || 'text-gray-600'} />
        </div>
      )}
    </div>
  )
}