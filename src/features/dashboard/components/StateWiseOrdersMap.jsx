'use client'

import { useState } from "react"
import { useDashboardStateOrders } from "../hooks/useDashboard"

export default function StateWiseOrdersMap({ params }) {
  const [hoveredState, setHoveredState] = useState(null)
  const query = useDashboardStateOrders(params)
  const stateWiseOrdersData = query.data || []

  const getShade = (orders) => {
    if (orders > 200) return "#2563eb"
    if (orders > 150) return "#3b82f6"
    if (orders > 100) return "#60a5fa"
    if (orders > 50) return "#93c5fd"
    return "#bfdbfe"
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm flex flex-col h-full w-full">
      <h3 className="text-xl font-bold text-gray-900 mb-8">Mapwise Orders (State)</h3>

      {query.isLoading ? (
        <div className="h-[420px] rounded-lg bg-muted animate-pulse" />
      ) : query.error ? (
        <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">{query.error.message}</div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-center justify-between flex-1">
          <div className="relative w-full lg:w-2/3 flex items-center justify-center p-4">
            <svg viewBox="0 0 500 600" className="w-full h-auto max-h-[400px] drop-shadow-sm" style={{ filter: 'drop-shadow(0px 4px 10px rgba(0,0,0,0.05))' }}>
              <path d="M170,10 L250,5 L320,50 L380,150 L450,280 L350,400 L250,550 L180,480 L120,380 L50,300 L120,200 Z" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
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
                    <circle cx={pos.cx} cy={pos.cy} r={Math.max(20, st.orders / 6)} fill={color} stroke="#ffffff" strokeWidth="3" className="transition-all duration-300 hover:stroke-blue-200" />
                  </g>
                )
              })}
            </svg>

            {hoveredState && (
              <div className="absolute top-4 right-4 bg-gray-900 text-white rounded-lg p-4 shadow-xl z-10 w-48 animate-in fade-in zoom-in duration-200">
                <h4 className="font-bold text-lg border-b border-gray-700 pb-2 mb-2">{hoveredState.state}</h4>
                <div className="flex flex-col gap-1 text-sm text-gray-300">
                  <div className="flex justify-between"><span className="text-gray-400">Orders:</span> <span className="font-medium text-white">{hoveredState.orders}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Revenue:</span> <span className="font-medium text-white">{hoveredState.revenue}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Growth:</span> <span className="font-medium text-green-400">{hoveredState.growth}</span></div>
                </div>
              </div>
            )}
          </div>

          <div className="w-full lg:w-1/3 flex flex-col justify-center bg-gray-50 p-6 rounded-xl border border-gray-100">
            <p className="text-sm font-bold text-gray-900 mb-5 uppercase tracking-wider">Order Volume</p>
            <div className="flex flex-col gap-4">
              {[
                ["bg-blue-600", "200+ Orders"],
                ["bg-blue-500", "151 - 200 Orders"],
                ["bg-blue-400", "101 - 150 Orders"],
                ["bg-blue-300", "51 - 100 Orders"],
                ["bg-blue-200", "1 - 50 Orders"],
              ].map(([color, label]) => (
                <div key={label} className="flex items-center gap-4">
                  <span className={`w-6 h-6 rounded ${color} shadow-sm border border-blue-300`} />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
