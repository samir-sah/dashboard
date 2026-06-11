import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Info } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

export default function SalesTrendChart({ data, daysRemaining, period, setPeriod }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center justify-center h-full min-h-[400px]">
        <p className="text-gray-500">No sales data available</p>
      </div>
    );
  }

  // Format date for display
  const formattedData = data.map(item => {
    const d = new Date(item.date);
    // If it's over a year, maybe format differently, but DD MMM is fine.
    return {
      ...item,
      displayDate: `${d.getDate()} ${d.toLocaleString('en-GB', { month: 'short' })}`
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col h-full overflow-hidden p-6">
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900">Sales Trend</h3>
        <div className="relative min-w-[140px]">
          <span className="absolute -top-1.5 left-3 px-1 bg-white text-[9px] font-bold uppercase tracking-wider text-muted-foreground z-10 pointer-events-none">
            Period
          </span>
          <Select value={period.toString()} onValueChange={(val) => setPeriod(Number(val))}>
            <SelectTrigger className="h-10 text-[13.5px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">1 Week</SelectItem>
              <SelectItem value="30">1 Month</SelectItem>
              <SelectItem value="180">6 Months</SelectItem>
              <SelectItem value="365">1 Year</SelectItem>
              <SelectItem value="730">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formattedData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5048e5" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#5048e5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="displayDate" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
              minTickGap={30}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
              dx={-10}
            />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
              cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="unitsSold"
              name="Units Sold"
              stroke="#5048e5"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSales)"
              activeDot={{ r: 5, fill: '#5048e5', stroke: '#fff', strokeWidth: 2 }}
              dot={false}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-50 flex items-center gap-2 text-[13px] text-gray-600 bg-[#f8fafc] -mx-6 -mb-6 p-4 px-6 rounded-b-2xl">
        <Info size={16} className="text-[#5048e5]" />
        <span>At the current sales rate, the available stock will last for approximately <span className="font-bold text-gray-900">{daysRemaining === 999 ? '> 99' : daysRemaining} days</span>.</span>
      </div>
    </div>
  );
}
