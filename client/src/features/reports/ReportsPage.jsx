"use client";

import React, { useState, useEffect, useCallback } from 'react';
import ReportsHeader from './ReportsHeader';
import ReportCard from './ReportCard';
import OrderReportsTable from './OrderReportsTable';
import RevenueReportsTable from './RevenueReportsTable';
import { reportsService } from '@/services/reports/reports.service';

const PAGE_SIZE = 10;

export default function ReportsPage() {
  const [orderTab, setOrderTab] = useState('daily');
  const [revenueTab, setRevenueTab] = useState('monthly');

  // Order reports state
  const [orderData, setOrderData] = useState([]);
  const [orderLoading, setOrderLoading] = useState(true);
  const [orderError, setOrderError] = useState(null);
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotalPages, setOrderTotalPages] = useState(1);
  const [orderTotal, setOrderTotal] = useState(0);

  // Revenue reports state
  const [revenueData, setRevenueData] = useState([]);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueError, setRevenueError] = useState(null);
  const [revenuePage, setRevenuePage] = useState(1);
  const [revenueTotalPages, setRevenueTotalPages] = useState(1);
  const [revenueTotal, setRevenueTotal] = useState(0);

  const orderTabs = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' }
  ];

  const revenueTabs = [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Quarterly', value: 'quarterly' },
    { label: 'Yearly', value: 'yearly' }
  ];

  const fetchOrderReports = useCallback(async (period, page) => {
    try {
      setOrderLoading(true);
      setOrderError(null);
      const result = await reportsService.getOrderReports(period, page, PAGE_SIZE);
      setOrderData(result.data);
      setOrderTotalPages(result.pages);
      setOrderTotal(result.total);
    } catch (err) {
      setOrderError(err.message || 'Failed to fetch order reports');
    } finally {
      setOrderLoading(false);
    }
  }, []);

  const fetchRevenueReports = useCallback(async (period, page) => {
    try {
      setRevenueLoading(true);
      setRevenueError(null);
      const result = await reportsService.getRevenueReports(period, page, PAGE_SIZE);
      setRevenueData(result.data);
      setRevenueTotalPages(result.pages);
      setRevenueTotal(result.total);
    } catch (err) {
      setRevenueError(err.message || 'Failed to fetch revenue reports');
    } finally {
      setRevenueLoading(false);
    }
  }, []);

  // Fetch ALL data (unpaginated) for export
  const handleFetchAllForExport = useCallback(async () => {
    const [allOrders, allRevenue] = await Promise.all([
      reportsService.getAllOrderReports(orderTab),
      reportsService.getAllRevenueReports(revenueTab),
    ]);
    return { orderData: allOrders, revenueData: allRevenue };
  }, [orderTab, revenueTab]);

  // Reset page to 1 when tab changes
  const handleOrderTabChange = (tab) => {
    setOrderTab(tab);
    setOrderPage(1);
  };

  const handleRevenueTabChange = (tab) => {
    setRevenueTab(tab);
    setRevenuePage(1);
  };

  useEffect(() => {
    fetchOrderReports(orderTab, orderPage);
  }, [orderTab, orderPage, fetchOrderReports]);

  useEffect(() => {
    fetchRevenueReports(revenueTab, revenuePage);
  }, [revenueTab, revenuePage, fetchRevenueReports]);

  return (
    <div className="max-w-[1400px] w-full">
      <ReportsHeader
        orderData={orderData}
        revenueData={revenueData}
        orderPeriod={orderTab}
        onFetchAllForExport={handleFetchAllForExport}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportCard 
          title="ORDER REPORTS" 
          tabs={orderTabs} 
          defaultTab={orderTab}
          onTabChange={handleOrderTabChange}
        >
          <OrderReportsTable
            data={orderData}
            loading={orderLoading}
            error={orderError}
            period={orderTab}
            currentPage={orderPage}
            totalPages={orderTotalPages}
            totalItems={orderTotal}
            pageSize={PAGE_SIZE}
            onPageChange={setOrderPage}
          />
        </ReportCard>
        
        <ReportCard 
          title="REVENUE REPORTS" 
          tabs={revenueTabs} 
          defaultTab={revenueTab}
          onTabChange={handleRevenueTabChange}
        >
          <RevenueReportsTable
            data={revenueData}
            loading={revenueLoading}
            error={revenueError}
            currentPage={revenuePage}
            totalPages={revenueTotalPages}
            totalItems={revenueTotal}
            pageSize={PAGE_SIZE}
            onPageChange={setRevenuePage}
          />
        </ReportCard>
      </div>
    </div>
  );
}
