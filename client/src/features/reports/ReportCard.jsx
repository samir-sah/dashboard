import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import ReportTabs from './ReportTabs';

export default function ReportCard({ title, tabs, defaultTab, onTabChange, children }) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-base font-semibold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
        {tabs && (
          <ReportTabs tabs={tabs} defaultValue={defaultTab} onValueChange={onTabChange} />
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
