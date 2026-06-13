import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  FileSpreadsheet,
  IndianRupee,
  Loader2,
  Plus,
  Search,
  TrendingUp,
  Users,
  Trash2
} from 'lucide-react';

const numberFormatter = new Intl.NumberFormat('en-IN');
const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

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

const ManagerDashboard = () => {
  const [summary, setSummary] = useState({
    totalSellers: 0,
    totalRecords: 0,
    monthlyTotal: 0,
    yearlyTotal: 0,
    totalPending: 0
  });
  const [records, setRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('weekly');
  const [customRange, setCustomRange] = useState(defaultCustomRange);
  const [appliedCustomRange, setAppliedCustomRange] = useState(defaultCustomRange);
  const [chartData, setChartData] = useState(getBlankWeeklyChart);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const fetchSummary = useCallback(async (quiet = false) => {
    if (!quiet) setSummaryLoading(true);
    try {
      const response = await API.get('/reports/summary');
      setSummary({
        ...(response.data || {}),
        totalPending: response.data?.totalPending || 0
      });
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
    // Only show loading if we have no data yet
    if (!quiet && chartData.every(d => d.sales === 0)) setChartLoading(true);
    
    try {
      const response = await API.get('/reports/weekly');
      const data = response.data.map((item) => ({
        name: item.day || item.date,
        sales: Number(item.total || 0)
      }));

      setChartData(data.length > 0 ? data : getBlankWeeklyChart());
    } catch (err) {
      console.error(err);
      setChartData(getBlankWeeklyChart());
    } finally {
      setChartLoading(false);
    }
  }, []);

  const fetchRecords = useCallback(async (quiet = false) => {
    // Only show loading if records are currently empty
    if (!quiet && records.length === 0) setRecordsLoading(true);
    setError('');

    const selectedRange = activeTab === 'custom' ? appliedCustomRange : getRange(activeTab);
    const queryParams = new URLSearchParams(selectedRange);

    try {
      const response = await API.get(`/reports/records?${queryParams.toString()}`);
      setRecords(Array.isArray(response.data) ? response.data.filter(r => r.sellerId) : []);
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
  }, [activeTab, appliedCustomRange]);

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
    fetchSummary();
    fetchChartData();
  }, [fetchSummary, fetchChartData]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchSummary(true);
      fetchChartData(true);
      fetchRecords(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchSummary, fetchChartData, fetchRecords]);

  const sellerRows = useMemo(() => {
    const sellerMap = new Map();

    const filtered = records.filter(r => 
      (r.sellerId?.name || 'Unknown Seller').toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.shopName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.forEach((record, index) => {
      const sellerId = record.sellerId?._id;
      const sellerName = record.sellerId?.name || 'Unknown Seller';
      const sellerKey = sellerId || 'unknown-seller';

      if (!sellerMap.has(sellerKey)) {
        sellerMap.set(sellerKey, {
          sellerId,
          seller: sellerName,
          totalRecords: 0,
          totalShops: 0,
          totalItems: 0,
          totalSales: 0,
          totalPending: 0
        });
      }

      const row = sellerMap.get(sellerKey);
      row.totalRecords += 1;
      row.totalShops += 1;
      row.totalItems += (record.items || []).reduce((sum, item) => {
        if (item.unit === 'weight') {
          return sum + 1; // Count weight-based items as 1
        } else {
          return sum + Number(item.quantity || 0);
        }
      }, 0);
      row.totalSales += Number(record.totalAmount || 0);
      row.totalPending += Number(record.pendingAmount || 0);
    });

    return Array.from(sellerMap.values())
      .sort((a, b) => b.totalSales - a.totalSales);
  }, [records, searchTerm]);

  const totals = sellerRows.reduce(
    (sum, row) => ({
      totalRecords: sum.totalRecords + (row.totalRecords || 0),
      totalShops: sum.totalShops + row.totalShops,
      totalItems: sum.totalItems + row.totalItems,
      totalSales: sum.totalSales + row.totalSales,
      totalPending: sum.totalPending + row.totalPending
    }),
    { totalRecords: 0, totalShops: 0, totalItems: 0, totalSales: 0, totalPending: 0 }
  );

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

  return (
    <div className="w-full space-y-8 min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-white p-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-blue-50 p-2 text-blue-700">
            <BarChart3 size={22} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Web</p>
            <h1 className="text-2xl font-black text-slate-950">Manager Dashboard</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/manager/records')}
            className="flex h-9 items-center gap-2 rounded-md bg-blue-700 px-4 text-xs font-black text-white shadow-sm transition-colors hover:bg-blue-800"
          >
            <Plus size={16} />
            Add New Record
          </button>
          <div className="hidden rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 shadow-sm sm:block">
            {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="group overflow-hidden rounded-xl bg-white/70 backdrop-blur-lg border border-slate-200 shadow-lg transition-shadow hover:shadow-xl"
            >
              <div className="h-1 bg-slate-900" />
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">{stat.label}</p>
                  <p className={`mt-3 truncate text-2xl font-black ${stat.accent}`}>
                    {summaryLoading ? '--' : stat.value}
                  </p>
                </div>
                <div className={`rounded-md p-2 ${stat.iconBg} ${stat.accent}`}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Sales Trend</p>
            <h2 className="text-base font-black text-slate-950">Weekly Sales Chart</h2>
          </div>
          <div className="rounded-md bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
            Last 7 days
          </div>
        </div>

        <div className="h-80 p-6 rounded-xl bg-white/70 backdrop-blur-lg shadow-lg">
          {chartLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="animate-spin text-blue-700" size={22} />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                  stroke="#64748b"
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  domain={[0, yAxisMax]}
                  tickLine={false}
                  fontSize={12}
                  stroke="#64748b"
                  tickFormatter={(value) => (value === 0 ? '0' : `₹${numberFormatter.format(value)}`)}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(value) => [currencyFormatter.format(value), 'Sales']}
                  contentStyle={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="sales" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={42} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Reports</p>
            <h2 className="text-base font-black text-slate-950">Seller Performance</h2>
          </div>
          
          <div className="relative flex-1 max-w-xs mx-4 hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Quick search seller/shop..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-wrap gap-1 rounded-md border border-slate-200 bg-slate-50 p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded px-3 py-1.5 text-xs font-black transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-white hover:text-slate-950'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'custom' && (
              <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor="manager-from-date">From date</label>
                <input
                  id="manager-from-date"
                  type="date"
                  value={customRange.from}
                  onChange={(event) => setCustomRange((range) => ({ ...range, from: event.target.value }))}
                  className="h-9 rounded border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-700 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
                />
                <label className="sr-only" htmlFor="manager-to-date">To date</label>
                <input
                  id="manager-to-date"
                  type="date"
                  value={customRange.to}
                  onChange={(event) => setCustomRange((range) => ({ ...range, to: event.target.value }))}
                  className="h-9 rounded border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-700 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
                />
                <button
                  type="button"
                  onClick={() => setAppliedCustomRange(customRange)}
                  className="inline-flex h-9 items-center gap-2 rounded bg-blue-700 px-3 text-xs font-black text-white transition-colors hover:bg-blue-800"
                >
                  <CalendarDays size={14} />
                  Filter
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-indigo-50 text-xs font-black text-indigo-800">
                <th className="px-4 py-3 text-left">Seller</th>
                <th className="px-4 py-3 text-center">Total Records</th>
                <th className="px-4 py-3 text-center">Total Shops</th>
                <th className="px-4 py-3 text-center">Total Items</th>
                <th className="px-4 py-3 text-right">Total Sales</th>
                <th className="px-4 py-3 text-right text-red-600">Total Pending</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recordsLoading && records.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
                      <Loader2 className="animate-spin text-blue-700" size={18} />
                      Loading reports...
                    </div>
                  </td>
                </tr>
              ) : sellerRows.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-sm font-semibold text-slate-500">
                    No sales records found for this period.
                  </td>
                </tr>
              ) : (
                sellerRows.map((row) => {
                  return (
                    <tr 
                      key={row.sellerId || row.seller}
                      className={row.sellerId ? "hover:bg-slate-50 cursor-pointer" : "opacity-50 cursor-not-allowed"}
                      onClick={() => row.sellerId && navigate(`/manager/seller/${row.sellerId}`)}
                    >
                    <td className="px-4 py-3 font-bold text-slate-950">{row.seller}</td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700">
                      {numberFormatter.format(row.totalRecords)}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700">
                      {numberFormatter.format(row.totalShops)}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700">
                      {numberFormatter.format(row.totalItems)}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-slate-950">
                      {currencyFormatter.format(row.totalSales)}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-red-600">
                      {currencyFormatter.format(row.totalPending)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.sellerId && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteSellerRecords(row.sellerId, row.seller); }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete records"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );})
              )}
            </tbody>
            {!recordsLoading && sellerRows.length > 0 && (
              <tfoot>
                <tr className="border-t border-slate-300 bg-slate-50 text-sm font-black text-slate-950">
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-center">{numberFormatter.format(totals.totalRecords)}</td>
                  <td className="px-4 py-3 text-center">{numberFormatter.format(totals.totalShops)}</td>
                  <td className="px-4 py-3 text-center">{numberFormatter.format(totals.totalItems)}</td>
                  <td className="px-4 py-3 text-right">{currencyFormatter.format(totals.totalSales)}</td>
                  <td className="px-4 py-3 text-right text-red-600">{currencyFormatter.format(totals.totalPending)}</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>
    </div>
  );
};

export default ManagerDashboard;