'use client'

import DashboardKPICard from "./DashboardKPICard"

export default function KPIGrid({ kpis = [], loading, error }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-[150px] bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="h-10 w-10 bg-muted animate-pulse rounded-xl mb-4" />
            <div className="h-4 w-28 bg-muted animate-pulse rounded mb-3" />
            <div className="h-7 w-20 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi) => (
        <DashboardKPICard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  )
}
