import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import API from '../../api/axios';
import ReportFilter from '../../components/ReportFilter';
import ReportsHeader from './components/ReportsHeader';
import ReportsSummaryCards from './components/ReportsSummaryCards';
import ReportsChartsSection from './components/ReportsChartsSection';
import SellerSummaryTable from './components/SellerSummaryTable';
import ReportsVisitLogs from './components/ReportsVisitLogs';
import { exportRecordsCSV } from '../../utils/recordsExport';
import { AlertCircle } from 'lucide-react'; // Added for UI presentation

// Helper function for blank chart data
const getBlankChartData = (activeTab) => {
  const now = new Date();
  if (activeTab === 'daily') return [{ name: 'Today', sales: 0 }];
  if (activeTab === 'weekly') {
    const days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({ name: date.toLocaleDateString('en-US', { weekday: 'short' }), sales: 0 });
    }
    return days;
  }
  if (activeTab === 'monthly') {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames.map(month => ({ name: month, sales: 0 }));
  }
  if (activeTab === 'yearly') {
    const currentYear = now.getFullYear();
    return Array.from({ length: 5 }, (_, i) => ({ name: `${currentYear - 4 + i}`, sales: 0 }));
  }
  return [];
};

// Module-level cache for instant re-navigation
let cachedSummary = null;
let cachedSellers = null;
let cachedRecords = null;
let hasFetchedReports = false;

const Reports = () => {

  console.log("=========== REPORTS RENDER ===========");

  const [activeTab, setActiveTab] = useState('weekly');
  const [summary, setSummary] = useState(cachedSummary || { totalSellers: 0, totalRecords: 0, monthlyTotal: 0, yearlyTotal: 0 });
  const [chartData, setChartData] = useState([]);
  const [records, setRecords] = useState(cachedRecords || []);
  const [sellers, setSellers] = useState(cachedSellers || []);
  const [loading, setLoading] = useState(!hasFetchedReports);
  const [errorMsg, setErrorMsg] = useState(''); // Kept state because we now display it below
  const [filters, setFilters] = useState({ sellerId: '', sellerName: '', shopName: '', shopType: '', status: '', from: '', to: '' });

  const abortControllerRef = useRef(null);
  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const fetchSummary = useCallback(async () => {

      console.log(">>> fetchSummary()");

    try {
      const res = await API.get('/reports/summary');

      setSummary(res.data);

      console.log("Summary Updated");

      cachedSummary = res.data;
    } catch (err) {
      if (err.name !== 'CanceledError') console.error('Summary fetch error:', err);
    }
  }, []);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const response = await API.get('/sellers');
        setSellers(response.data);
        cachedSellers = response.data;
        hasFetchedReports = true;
      } catch (err) {
        console.error(err);
      }
    };
    if (!hasFetchedReports) fetchSellers();
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);
  
const fetchChartData = useCallback(async (signal) => {

    console.log(">>> fetchChartData()");
  
    try {
      if (activeTab === 'custom') { setChartData(getBlankChartData(activeTab)); return; }
      const endpoint =
        activeTab === 'monthly' ? '/reports/monthly' :
          activeTab === 'yearly' ? '/reports/yearly' :
            activeTab === 'daily' ? '/reports/daily' : '/reports/weekly';
      const response = await API.get(endpoint, { signal });
      const data = response.data.map(item => ({
        name: item.day || item.month || item.date || item.label || 'N/A',
        sales: Number(item.total || 0),
      }));
      setChartData(data.length > 0 ? data : getBlankChartData(activeTab));

      console.log("Chart Updated");

    } catch (err) {
      if (err.name !== 'CanceledError') {
        console.error('Chart fetch error:', err);
        setChartData(getBlankChartData(activeTab));
      }
    }
  }, [activeTab]);

  const recordsLengthRef = useRef(0);

  const fetchFilteredRecords = useCallback(async (currentFilters, quiet = false, signal) => {

    console.log(">>> fetchFilteredRecords()");

    if (!quiet && recordsLengthRef.current === 0) setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (currentFilters.sellerId) queryParams.append('sellerId', currentFilters.sellerId);
      if (currentFilters.sellerName) queryParams.append('sellerName', currentFilters.sellerName);
      if (currentFilters.shopName) queryParams.append('shopName', currentFilters.shopName);
      if (currentFilters.status) queryParams.append('status', currentFilters.status);
      if (currentFilters.shopType) queryParams.append('shopType', currentFilters.shopType);
      if (currentFilters.from) queryParams.append('from', currentFilters.from);
      if (currentFilters.to) queryParams.append('to', currentFilters.to);

      const todayStr = new Date().toISOString().split('T')[0];
      if (activeTab === 'daily' && !currentFilters.from && !currentFilters.to) {
        queryParams.append('from', todayStr);
        queryParams.append('to', todayStr);
      } else if (activeTab === 'weekly' && !currentFilters.from && !currentFilters.to) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        queryParams.append('from', sevenDaysAgo.toISOString().split('T')[0]);
      } else if (activeTab === 'monthly' && !currentFilters.from && !currentFilters.to) {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        queryParams.append('from', startOfMonth.toISOString().split('T')[0]);
      } else if (activeTab === 'yearly' && !currentFilters.from && !currentFilters.to) {
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        queryParams.append('from', startOfYear.toISOString().split('T')[0]);
      }

      const response = await API.get(`/reports/records?${queryParams.toString()}`, { signal });
      const data = Array.isArray(response.data) ? response.data : [];
      const validRecords = data.filter(r => r && r.sellerId);
      setRecords(validRecords);
      
      console.log("Records Updated:", validRecords.length);

      recordsLengthRef.current = validRecords.length;
      setErrorMsg('');
    } catch (err) {
      if (err.name !== 'CanceledError') {
        console.error('Records fetch error:', err);
        setErrorMsg(err.response?.data?.message || err.message || 'Failed to load records');
        if (recordsLengthRef.current === 0) setRecords([]);
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {

    console.log("=========== EFFECT STARTED ===========");
    console.log("Filters:", filters);
    console.log("Active Tab:", activeTab);


    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    setLoading(true);
    fetchChartData(signal);
    fetchFilteredRecords(filters, false, signal);
    return () => { if (abortControllerRef.current) abortControllerRef.current.abort(); };
  }, [filters, activeTab, fetchChartData, fetchFilteredRecords]);

 

  const handleFilterChange = useCallback((newFilters) => { setFilters(newFilters); }, []);

  const handleDownloadCSV = () => exportRecordsCSV(records, `sales_report_${activeTab}`);

  // ── Aggregations ──────────────────────────────────────────────────────────

  const sellerPerformance = useMemo(() => {
    const map = {};
    (records || []).forEach(r => {
      const name = r.sellerId?.name || 'Unknown';
      if (!map[name]) map[name] = { name, sales: 0, records: 0 };
      map[name].sales += Number(r.totalAmount || 0);
      map[name].records += 1;
    });
    return Object.values(map).sort((a, b) => b.sales - a.sales).slice(0, 10);
  }, [records]);

  const shopPerformance = useMemo(() => {
    const map = {};
    (records || []).forEach(r => {
      if (!map[r.shopName]) map[r.shopName] = { name: r.shopName, sales: 0, visits: 0 };
      map[r.shopName].sales += Number(r.totalAmount || 0);
      map[r.shopName].visits += 1;
    });
    return Object.values(map).sort((a, b) => b.sales - a.sales).slice(0, 10);
  }, [records]);

  const categoryWiseData = useMemo(() => {
    const map = {};
    (records || []).forEach(r => {
      const cat = r.shopType || 'Other';
      if (!map[cat]) map[cat] = { name: cat, value: 0 };
      map[cat].value += Number(r.totalAmount || 0);
    });
    return Object.values(map);
  }, [records]);

  const stats = useMemo(() => {
    const totalSales = (records || []).reduce((sum, r) => sum + Number(r.totalAmount || 0), 0);
    const totalItems = (records || []).reduce(
      (sum, r) => sum + (r.items?.reduce((is, i) => is + Number(i.quantity || 0), 0) || 0), 0
    );
    const uniqueShops = new Set(
      (records || []).flatMap(record => record?.shopName ? [record.shopName] : [])
    ).size;
    return { totalSales, totalItems, uniqueShops, totalRecords: (records || []).length };
  }, [records]);

  const sellerTableData = useMemo(() => {
    const map = {};
    records.forEach(r => {
      const sid = r.sellerId?._id || 'unknown';
      if (!map[sid]) map[sid] = { sellerId: sid, name: r.sellerId?.name || 'Unknown', records: 0, shops: new Set(), items: 0, sales: 0, pending: 0 };
      map[sid].records += 1;
      map[sid].shops.add(r.shopName);
      map[sid].items += r.items?.reduce((s, i) => {
        if (i.unit === 'weight') return s + 1;
        return s + Number(i.quantity || 0);
      }, 0) || 0;
      map[sid].sales += Number(r.totalAmount || 0);
      map[sid].pending += Number(r.pendingAmount || 0);
    });
    return Object.values(map);
  }, [records]);

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl space-y-4 bg-slate-50/30 p-3 sm:space-y-6 sm:p-5 lg:p-8">
      {/* 1. Header + Tab Switcher */}
      <ReportsHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {/* FIXED: Added UI Banner to clear the react-doctor warning and show errors to managers */}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. Summary Cards */}
      <ReportsSummaryCards summary={summary} stats={stats} />

      {/* 3. Report Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <ReportFilter onFilter={handleFilterChange} onDownloadCSV={handleDownloadCSV} sellers={sellers} filters={filters} />
      </div>

      {/* 4. Charts */}
      <ReportsChartsSection
        chartData={chartData}
        sellerPerformance={sellerPerformance}
        shopPerformance={shopPerformance}
        categoryWiseData={categoryWiseData}
      />

      {/* 5. Seller Summary Table */}
      <SellerSummaryTable activeTab={activeTab} sellerTableData={sellerTableData} totalRecords={stats.totalRecords} />

      {/* 6. Full Visit Logs */}
      <ReportsVisitLogs loading={loading} records={records} />
    </div>
  );
};

export default Reports;