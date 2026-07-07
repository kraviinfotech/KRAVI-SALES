import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { AlertCircle, Loader2, Users, FileSpreadsheet, IndianRupee, TrendingUp } from 'lucide-react';
import DashboardHeader from './components/DashboardHeader';
import StatCards from './components/StatCards';
import SalesChartSection from './components/SalesChartSection';
import SellerPerformanceTable from './components/SellerPerformanceTable';
import CollectionStatsCards from './components/CollectionStatsCards';
import RecentCollectionsTable from './components/RecentCollectionsTable';

const numberFormatter = new Intl.NumberFormat('en-IN');
const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});
const recentCollectionsLimit = 20;

const toDateInput = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const getRange = (range) => {
  const now = new Date();
  const from = new Date(now);

  if (range === 'daily') {
    return { from: toDateInput(now), to: toDateInput(now) };
  }

  if (range === 'monthly') {
    return { from: toDateInput(new Date(now.getFullYear(), now.getMonth(), 1)), to: toDateInput(now) };
  }

  if (range === 'yearly') {
    return { from: toDateInput(new Date(now.getFullYear(), 0, 1)), to: toDateInput(now) };
  }

  from.setDate(now.getDate() - 6);
  return { from: toDateInput(from), to: toDateInput(now) };
};

const getBlankWeeklyChart = () => {
  const days = [];

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push({
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      sales: 0
    });
  }

  return days;
};

const defaultCustomRange = getRange('weekly');

const tabs = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
  { id: 'custom', label: 'Custom Range' }
];

let cachedSummary = null;
let cachedRecords = null;
let cachedChartData = null;
let cachedCollectionStats = null;
let cachedRecentCollections = null;

let hasFetchedSummary = false;
let hasFetchedRecords = false;
let hasFetchedChart = false;
let hasFetchedCollections = false;

const ManagerDashboard = () => {
  const [summary, setSummary] = useState(cachedSummary || {
    totalSellers: 0,
    totalRecords: 0,
    monthlyTotal: 0,
    yearlyTotal: 0,
    totalPending: 0
  });
  const [records, setRecords] = useState(cachedRecords || []);
  const [activeTab, setActiveTab] = useState('weekly');
  const [customRange, setCustomRange] = useState(defaultCustomRange);
  const [appliedCustomRange, setAppliedCustomRange] = useState(defaultCustomRange);
  const [chartData, setChartData] = useState(cachedChartData || getBlankWeeklyChart());
  const [summaryLoading, setSummaryLoading] = useState(!hasFetchedSummary);
  const [recordsLoading, setRecordsLoading] = useState(!hasFetchedRecords);
  const [chartLoading, setChartLoading] = useState(!hasFetchedChart);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // Collections State
  const [collectionStats, setCollectionStats] = useState(cachedCollectionStats || { totalCollection: 0, cashCollection: 0, onlineCollection: 0, pendingCollection: 0 });
  const [recentCollections, setRecentCollections] = useState(cachedRecentCollections || []);
  const [collectionsLoading, setCollectionsLoading] = useState(!hasFetchedCollections);
  const recordsRef = useRef(records);

  useEffect(() => {
    recordsRef.current = records;
  }, [records]);

  const fetchCollectionData = useCallback(async (quiet = false) => {
    if (!quiet) setCollectionsLoading(true);
    try {
      const res = await API.get('/shoppayments/manager-recent');
      setCollectionStats(res.data.stats);
      setRecentCollections(res.data.recentPayments);
      cachedCollectionStats = res.data.stats;
      cachedRecentCollections = res.data.recentPayments;
      hasFetchedCollections = true;
    } catch (err) {
      console.error('Error fetching collections', err);
    } finally {
      setCollectionsLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async (quiet = false) => {
    if (!quiet) setSummaryLoading(true);
    try {
      const response = await API.get('/reports/summary');
      const newSummary = {
        ...(response.data || {}),
        totalPending: response.data?.totalPending || 0
      };
      setSummary(newSummary);
      cachedSummary = newSummary;
      hasFetchedSummary = true;
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        setError('Access Denied: You are not authorized to view manager summary. Please login as a Manager.');
      } else {
        setError('Manager summary could not be loaded.');
      }
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const fetchChartData = useCallback(async (quiet = false) => {
    // Only show loading if we have no cached chart yet
    if (!quiet && !hasFetchedChart) setChartLoading(true);
    
    try {
      const response = await API.get('/reports/weekly');
      const data = response.data.map((item) => ({
        name: item.day || item.date,
        sales: Number(item.total || 0)
      }));

      const finalChartData = data.length > 0 ? data : getBlankWeeklyChart();
      setChartData(finalChartData);
      cachedChartData = finalChartData;
      hasFetchedChart = true;
    } catch (err) {
      console.error(err);
      setChartData(getBlankWeeklyChart());
    } finally {
      setChartLoading(false);
    }
  }, []); // No deps - stable reference

  const fetchRecords = useCallback(async (quiet = false) => {
    // Only show loading if records are currently empty
    if (!quiet && recordsRef.current.length === 0) setRecordsLoading(true);
    setError('');

    const selectedRange = activeTab === 'custom' ? appliedCustomRange : getRange(activeTab);
    const queryParams = new URLSearchParams(selectedRange);

    try {
      const response = await API.get(`/reports/records?${queryParams.toString()}`);
      const newRecords = Array.isArray(response.data) ? response.data.filter(r => r.sellerId) : [];
      setRecords(newRecords);
      cachedRecords = newRecords;
      hasFetchedRecords = true;
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        setError('Access Denied: You are not authorized to view reports data. Please login as a Manager.');
      } else {
        setError('Reports data could not be loaded.');
      }
    } finally {
      setRecordsLoading(false);
    }
  }, [activeTab, appliedCustomRange]); // removed records.length - it caused infinite loop

  const handleDeleteSellerRecords = async (sellerId, sellerName) => {
    if (!sellerId) return;
    if (!window.confirm(`Are you sure you want to delete ALL records for ${sellerName}? This cannot be undone.`)) return;
    
    try {
      const response = await API.delete(`/reports/seller-records/${sellerId}`);
      alert(response.data.message);
      fetchRecords();
      fetchSummary();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting records.');
    }
  };

 
  useEffect(() => {
  fetchSummary(hasFetchedSummary);
  fetchCollectionData(hasFetchedCollections);
}, [fetchSummary, fetchCollectionData]);

useEffect(() => {
  fetchChartData(hasFetchedChart);
}, [fetchChartData]);

  useEffect(() => {
    fetchRecords(hasFetchedRecords);
  }, [fetchRecords, activeTab, appliedCustomRange]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchSummary(true);
      fetchChartData(true);
      fetchRecords(true);
      fetchCollectionData(true);
    }, 200000);
    return () => clearInterval(interval);
  }, [fetchSummary, fetchChartData, fetchRecords, fetchCollectionData]);


  const { sellerRows, totals } = useMemo(() => {
    const sellerMap = new Map();
    const term = searchTerm.toLowerCase();

    records.forEach((record) => {
      const sellerId = record.sellerId?._id || 'unknown';
      const sellerName = record.sellerId?.name || 'Unknown Seller';

      if (!sellerMap.has(sellerId)) {
        sellerMap.set(sellerId, {
          sellerId,
          seller: sellerName,
          totalRecords: 0,
          totalShops: 0,
          totalItems: 0,
          totalSales: 0,
          totalPending: 0
        });
      }

      const row = sellerMap.get(sellerId);
      row.totalRecords += 1;
      row.totalShops += 1;
      row.totalItems += record.items?.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0) || 0;
      row.totalSales += Number(record.totalAmount || 0);
      row.totalPending += Number(record.pendingAmount || 0);
    });

    const rows = Array.from(sellerMap.values())
      .filter(r => r.seller.toLowerCase().includes(term))
      .sort((a, b) => b.totalSales - a.totalSales);

    const calculatedTotals = rows.reduce((acc, curr) => ({
      totalRecords: acc.totalRecords + curr.totalRecords,
      totalShops: acc.totalShops + curr.totalShops,
      totalItems: acc.totalItems + curr.totalItems,
      totalSales: acc.totalSales + curr.totalSales,
      totalPending: acc.totalPending + curr.totalPending
    }), { totalRecords: 0, totalShops: 0, totalItems: 0, totalSales: 0, totalPending: 0 });

    return { sellerRows: rows, totals: calculatedTotals };
  }, [records, searchTerm]);

  const stats = [
    {
      label: 'Total Sellers',
      value: numberFormatter.format(summary.totalSellers || 0),
      accent: 'text-blue-700',
      iconBg: 'bg-blue-50',
      icon: Users
    },
    {
      label: 'Total Records',
      value: numberFormatter.format(summary.totalRecords || 0),
      accent: 'text-violet-700',
      iconBg: 'bg-violet-50',
      icon: FileSpreadsheet
    },
    {
      label: 'Sales This Month',
      value: currencyFormatter.format(summary.monthlyTotal || 0),
      accent: 'text-emerald-700',
      iconBg: 'bg-emerald-50',
      icon: IndianRupee
    },
    {
      label: 'Sales This Year',
      value: currencyFormatter.format(summary.yearlyTotal || 0),
      accent: 'text-amber-700',
      iconBg: 'bg-amber-50',
      icon: TrendingUp
    },
    {
      label: 'Total Pending',
      value: currencyFormatter.format(totals.totalPending || 0),
      accent: 'text-red-700',
      iconBg: 'bg-red-50',
      icon: IndianRupee
    }
  ];

  const maxChartSales = Math.max(...chartData.map((item) => item.sales), 0);
  const yAxisMax = maxChartSales > 0 ? Math.ceil(maxChartSales * 1.2) : 1;
  const currentDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl space-y-5 bg-gradient-to-br from-purple-50 via-indigo-50 to-white p-3 sm:space-y-6 sm:p-5 lg:space-y-8 lg:p-8">
      <DashboardHeader 
        onAddNew={() => navigate('/manager/records')} 
        currentDate={currentDate}
      />

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <StatCards stats={stats} loading={summaryLoading} />

      <SalesChartSection chartData={chartData} chartLoading={chartLoading} />

      <SellerPerformanceTable
        sellerRows={sellerRows}
        totals={totals}
        recordsLoading={recordsLoading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onDeleteRecords={handleDeleteSellerRecords}
        onRowClick={(sellerId) => navigate(`/manager/seller/${sellerId}`)}
        activeTab={activeTab}
        tabs={tabs}
        onTabChange={setActiveTab}
        customRange={customRange}
        onCustomRangeChange={setCustomRange}
        onApplyCustomRange={() => setAppliedCustomRange(customRange)}
      />

      <CollectionStatsCards collectionStats={collectionStats} />

      <RecentCollectionsTable 
        recentCollections={recentCollections}
        collectionsLoading={collectionsLoading}
        onViewAll={() => navigate('/manager/collections')}
        recentCollectionsLimit={recentCollectionsLimit}
      />
    </div>
  );
};

export default ManagerDashboard;
