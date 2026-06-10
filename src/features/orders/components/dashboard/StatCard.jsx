'use client'

export default function StatCard({ label, value, valueColor }) {
  return (
    <div className="kpi-card bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s ease, transform 0.2s ease' }}>
      <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase">
        {label}
      </p>
      <p className="text-3xl font-bold leading-none" style={{ color: valueColor || '#111827' }}>
        {value}
      </p>
    </div>
  )
}