'use client'

import { useState } from "react"
import { useDashboardStateOrders } from "../hooks/useDashboard"

export default function StateWiseOrdersMap({ params }) {
  const [hoveredState, setHoveredState] = useState(null)
  const query = useDashboardStateOrders(params)
  const stateWiseOrdersData = query.data || []

  const getShade = (orders) => {
    if (orders > 200) return "#1d5038"
    if (orders > 150) return "#246646"
    if (orders > 100) return "#2f8159"
    if (orders > 50) return "#57a47b"
    return "#8bc4a4"
  }

  return (
    <div className="flex h-full w-full flex-col rounded-[1.1rem] border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
      <h3 className="mb-8 text-xl font-semibold text-ink">Mapwise Orders (State)</h3>

      {query.isLoading ? (
        <div className="h-[420px] animate-pulse rounded-[1.1rem] bg-surface-elevated" />
      ) : query.error ? (
        <div className="rounded-[1.1rem] border border-red-100 bg-red-50 p-4 text-sm text-red-700">{query.error.message}</div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-center justify-between flex-1">
          <div className="relative w-full lg:w-2/3 flex items-center justify-center p-4">
            <svg viewBox="0 0 500 600" className="h-auto w-full max-h-[400px] drop-shadow-sm" style={{ filter: 'drop-shadow(0px 4px 10px rgba(36,102,70,0.10))' }}>
              <path d="M170,10 L250,5 L320,50 L380,150 L450,280 L350,400 L250,550 L180,480 L120,380 L50,300 L120,200 Z" fill="#f1f0f9" stroke="#d2e9db" strokeWidth="2" />
              {stateWiseOrdersData.map((st, i) => {
                const positions = [
                  { cx: 200, cy: 420 },
                  { cx: 160, cy: 300 },
                  { cx: 220, cy: 120 },
                  { cx: 240, cy: 480 },
                  { cx: 250, cy: 350 },
                  { cx: 380, cy: 260 },
                ]
                const pos = positions[i] || { cx: 250, cy: 300 }
                const color = getShade(st.orders)
                return (
                  <g key={st.state} className="cursor-pointer transition-all duration-300 hover:opacity-80" onMouseEnter={() => setHoveredState(st)} onMouseLeave={() => setHoveredState(null)}>
                    <circle cx={pos.cx} cy={pos.cy} r={Math.max(20, st.orders / 6)} fill={color} stroke="#ffffff" strokeWidth="3" className="transition-all duration-300 hover:stroke-brand-100" />
                  </g>
                )
              })}
            </svg>

            {hoveredState && (
              <div className="absolute right-4 top-4 z-10 w-48 animate-in rounded-[1.1rem] border border-border bg-popover p-4 text-popover-foreground shadow-[var(--shadow-soft)] fade-in zoom-in duration-200">
                <h4 className="mb-2 border-b border-border pb-2 text-lg font-semibold text-ink">{hoveredState.state}</h4>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <div className="flex justify-between"><span>Orders:</span> <span className="font-medium text-ink">{hoveredState.orders}</span></div>
                  <div className="flex justify-between"><span>Revenue:</span> <span className="font-medium text-ink">{hoveredState.revenue}</span></div>
                  <div className="flex justify-between"><span>Growth:</span> <span className="font-medium text-brand-700">{hoveredState.growth}</span></div>
                </div>
              </div>
            )}
          </div>

          <div className="flex w-full flex-col justify-center rounded-[1.1rem] border border-border bg-surface-2 p-6 lg:w-1/3">
            <p className="mb-5 text-sm font-semibold uppercase text-ink">Order Volume</p>
            <div className="flex flex-col gap-4">
              {[
                ["bg-brand-900", "200+ Orders"],
                ["bg-brand-800", "151 - 200 Orders"],
                ["bg-brand-700", "101 - 150 Orders"],
                ["bg-brand-500", "51 - 100 Orders"],
                ["bg-brand-300", "1 - 50 Orders"],
              ].map(([color, label]) => (
                <div key={label} className="flex items-center gap-4">
                  <span className={`h-6 w-6 rounded-full border border-brand-100 shadow-xs ${color}`} />
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
