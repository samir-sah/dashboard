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
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group min-h-[96px]">
      <div className="flex items-center gap-4 w-full">
        {Icon && (
          <div className={`p-3 rounded-xl ${iconBg || 'bg-gray-100'} ${iconColor || 'text-gray-600'}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
          <span className="text-2xl font-bold text-gray-900 leading-none">{value}</span>
        </div>
      </div>
    </div>
  )
}