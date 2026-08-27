import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import * as XLSX from 'xlsx';

/**
 * Map order report period keys to a human-readable first column name.
 */
const ORDER_PERIOD_KEY = { daily: 'date', weekly: 'week', monthly: 'month' };
const ORDER_PERIOD_LABEL = { daily: 'Date', weekly: 'Week', monthly: 'Month' };

/**
 * Build a flat array of rows ready for sheet conversion.
 */
const buildOrderRows = (data, period) => {
  const key = ORDER_PERIOD_KEY[period] || 'date';
  const label = ORDER_PERIOD_LABEL[period] || 'Period';

  return data.map((row) => ({
    [label]: row[key],
    'Orders': row.orders,
    'Shipped': row.shipped ?? row.dispatched ?? 0,
    'Delivered': row.delivered,
    'Cancelled': row.cancelled,
  }));
};

const buildRevenueRows = (data) =>
  data.map((row) => ({
    'Period': row.period,
    'Revenue (₹)': row.revenue,
    'Total Orders': row.totalOrders,
    'Avg Order Value (₹)': row.averageOrderValue,
  }));

/**
 * Trigger a file download in the browser.
 */
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Convert an array of row objects to a CSV string.
 */
const toCSV = (rows) => {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((h) => {
        const val = row[h] ?? '';
        // Escape values that contain commas or quotes
        const str = String(val);
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(',')
    ),
  ];
  return lines.join('\n');
};

export default function ReportsHeader({
  orderData = [],
  revenueData = [],
  orderPeriod = 'daily',
  onFetchAllForExport,
}) {
  const handleExport = async (format) => {
    // Fetch all data (unpaginated) for export
    let allOrderData = orderData;
    let allRevenueData = revenueData;

    if (onFetchAllForExport) {
      const allData = await onFetchAllForExport();
      allOrderData = allData.orderData;
      allRevenueData = allData.revenueData;
    }

    const orderRows = buildOrderRows(allOrderData, orderPeriod);
    const revenueRows = buildRevenueRows(allRevenueData);

    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    if (format === 'csv') {
      // Export as two CSV files bundled in one download
      // Combine both tables into one CSV with a separator
      const orderCSV = toCSV(orderRows);
      const revenueCSV = toCSV(revenueRows);
      const combined = `ORDER REPORTS\n${orderCSV}\n\nREVENUE REPORTS\n${revenueCSV}`;

      const blob = new Blob([combined], { type: 'text/csv;charset=utf-8;' });
      downloadBlob(blob, `HealthyBit_Reports_${timestamp}.csv`);
    }

    if (format === 'excel') {
      const wb = XLSX.utils.book_new();

      // Order Reports sheet
      if (orderRows.length) {
        const orderSheet = XLSX.utils.json_to_sheet(orderRows);
        XLSX.utils.book_append_sheet(wb, orderSheet, 'Order Reports');
      }

      // Revenue Reports sheet
      if (revenueRows.length) {
        const revenueSheet = XLSX.utils.json_to_sheet(revenueRows);
        XLSX.utils.book_append_sheet(wb, revenueSheet, 'Revenue Reports');
      }

      if (!orderRows.length && !revenueRows.length) {
        const emptySheet = XLSX.utils.aoa_to_sheet([['No report data available']]);
        XLSX.utils.book_append_sheet(wb, emptySheet, 'Reports');
      }

      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      downloadBlob(blob, `HealthyBit_Reports_${timestamp}.xlsx`);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-1">Generate and export business reports</p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" className="gap-2" onClick={() => handleExport('csv')}>
          <FileSpreadsheet className="h-4 w-4" />
          Export CSV
        </Button>
        <Button variant="default" className="gap-2" onClick={() => handleExport('excel')}>
          <FileSpreadsheet className="h-4 w-4" />
          Export Excel
        </Button>
      </div>
    </div>
  );
}
