'use client'

import DashboardKPICard from "./DashboardKPICard"

export default function KPIGrid({ kpis = [], loading, error }) {
  if (loading) {
    return (
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-[150px] rounded-[1.1rem] border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
            <div className="mb-4 h-10 w-10 animate-pulse rounded-full bg-surface-elevated" />
            <div className="mb-3 h-4 w-28 animate-pulse rounded-full bg-surface-elevated" />
            <div className="h-7 w-20 animate-pulse rounded-full bg-surface-elevated" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="mb-6 rounded-[1.1rem] border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>
  }

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <DashboardKPICard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  )
}
