import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';

export default function ReportTabs({ tabs, defaultValue, onValueChange, className }) {
  return (
    <Tabs defaultValue={defaultValue} onValueChange={onValueChange} className={className}>
      <TabsList className="bg-muted border rounded-md p-1 h-auto">
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab.value} 
            value={tab.value}
            className="rounded-sm px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
