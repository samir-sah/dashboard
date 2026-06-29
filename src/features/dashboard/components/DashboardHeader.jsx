'use client'

import { TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Button } from "@/components/ui/Button"
import { Calendar, ChevronLeft, ChevronRight, BarChart3, Lightbulb } from "lucide-react"

export default function DashboardHeader({ dateRange, setDateRange }) {
  return (
    <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your business performance</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {/* Toggle / Tabs List */}
        <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
           <TabsList className="bg-transparent border-none h-9 p-0 gap-1">
             <TabsTrigger value="charts" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md px-5 py-2 text-sm font-semibold transition-all">
               <BarChart3 className="w-4 h-4 mr-2" />
               Charts
             </TabsTrigger>
             <TabsTrigger value="insights" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md px-5 py-2 text-sm font-semibold transition-all">
               <Lightbulb className="w-4 h-4 mr-2" />
               Insights
             </TabsTrigger>
           </TabsList>
        </div>

        {/* Premium Date Range Selector */}
        <div className="relative">
          <select 
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-10 pr-10 rounded-lg shadow-sm font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:bg-gray-50 cursor-pointer"
            value={dateRange || "30d"}
            onChange={(e) => setDateRange && setDateRange(e.target.value)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="12m">Last 12 Months</option>
          </select>
          <Calendar className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <ChevronLeft className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 -rotate-90 pointer-events-none" />
        </div>
      </div>
    </div>
  )
}
