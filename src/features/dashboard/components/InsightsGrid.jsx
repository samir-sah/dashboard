'use client'

import GenderOrders from "./GenderOrders"
import RecentOrders from "./RecentOrders"

export default function InsightsGrid({ params }) {
  return (
    <div className="flex flex-col gap-6 mb-6">
      {/* Row 1: Gender Orders & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <GenderOrders params={params} />
        </div>
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>
      </div>
    </div>
  )
}
