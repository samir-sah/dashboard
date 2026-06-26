'use client'

import { Tabs, TabsContent } from "@/components/ui/Tabs"
import DashboardHeader from "@/features/dashboard/components/DashboardHeader"
import KPIGrid from "@/features/dashboard/components/KPIGrid"
import AnalyticsCharts from "@/features/dashboard/components/AnalyticsCharts"
import InsightsGrid from "@/features/dashboard/components/InsightsGrid"
import { useDashboardInsightKPIs, useDashboardKPIs } from "@/features/dashboard/hooks/useDashboard"

export default function Dashboard() {
  const params = { range: "12m" };
  const topKpis = useDashboardKPIs(params);
  const insightKpis = useDashboardInsightKPIs(params);

  return (
    <div className="max-w-[1400px] mx-auto pb-10">
      <Tabs defaultValue="charts" className="w-full">
        <DashboardHeader />
        
        <TabsContent value="charts" className="mt-0">
          <KPIGrid kpis={topKpis.data || []} loading={topKpis.isLoading} error={topKpis.error?.message} />
          <AnalyticsCharts params={params} />
        </TabsContent>

        <TabsContent value="insights" className="mt-0">
          <KPIGrid kpis={insightKpis.data || []} loading={insightKpis.isLoading} error={insightKpis.error?.message} />
          <InsightsGrid params={params} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
