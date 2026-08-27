'use client'

import { TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Calendar, ChevronLeft, BarChart3, Lightbulb } from "lucide-react"

export default function DashboardHeader({ dateRange, setDateRange }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex items-center rounded-full border border-border bg-background p-1 shadow-[var(--shadow-soft)]">
           <TabsList className="h-9 gap-1 border-none bg-transparent p-0">
             <TabsTrigger value="charts" className="rounded-full px-5 py-2 text-sm font-semibold transition-all data-[state=active]:bg-brand-50 data-[state=active]:text-brand-800 data-[state=active]:shadow-xs">
               <BarChart3 className="w-4 h-4 mr-2" />
               Charts
             </TabsTrigger>
             <TabsTrigger value="insights" className="rounded-full px-5 py-2 text-sm font-semibold transition-all data-[state=active]:bg-brand-50 data-[state=active]:text-brand-800 data-[state=active]:shadow-xs">
               <Lightbulb className="w-4 h-4 mr-2" />
               Insights
             </TabsTrigger>
           </TabsList>
        </div>

        <div className="relative">
          <select 
            className="cursor-pointer appearance-none rounded-full border border-border bg-background py-2.5 pl-10 pr-10 text-sm font-semibold text-foreground shadow-xs transition-all hover:border-brand-300 hover:bg-brand-50/40 focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/30"
            value={dateRange || "30d"}
            onChange={(e) => setDateRange && setDateRange(e.target.value)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="12m">Last 12 Months</option>
          </select>
          <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <ChevronLeft className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 -rotate-90 text-muted-foreground" />
        </div>
      </div>
    </div>
  )
}
