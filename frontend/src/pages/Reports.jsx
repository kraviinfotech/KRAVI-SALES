import React, { useState, useEffect, useMemo } from 'react';
import API from '../api/axios';
import ReportFilter from '../components/ReportFilter';
import SalesTable from '../components/SalesTable';
import StatCard from '../components/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area, ComposedChart, ScatterChart, Scatter, ZAxis } from 'recharts';
import { ShoppingCart, Landmark, DollarSign, Loader2, Calendar, TrendingUp, Users, Package, PieChart as PieIcon, BarChart3, Presentation, CircleDot } from 'lucide-react';

const COLORS = ['#1D4ED8', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

// Helper function for blank chart data
const getBlankChartData = (activeTab) => {
  const now = new Date();
  if (activeTab === 'daily') {
    return [{ name: 'Today', sales: 0 }];
  }
  if (activeTab === 'weekly') {
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
  }
  if (activeTab === 'monthly') {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames.map(month => ({ name: month, sales: 0 }));
  }
  if (activeTab === 'yearly') {
    const currentYear = now.getFullYear();
    // Show 5 years for yearly blank data
    return Array.from({ length: 5 }, (_, i) => ({ name: `${currentYear - 4 + i}`, sales: 0 }));
  }
  return []; // For custom or unknown tabs
};

const Reports = () => {
  const [activeTab, setActiveTab] = useState('weekly'); // daily, weekly, monthly, yearly, custom
  const [summary, setSummary] = useState({ totalSellers: 0, totalRecords: 0, monthlyTotal: 0, yearlyTotal: 0 });
  const [chartData, setChartData] = useState([]);
  const [records, setRecords] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [filters, setFilters] = useState({ sellerId: '', sellerName: '', shopName: '', shopType: '', status: '', from: '', to: '' });

  // Fetch high-level summary
  useEffect(() => {
    API.get('/reports/summary')
      .then(res => setSummary(res.data))
      .catch(err => console.error('Summary fetch error:', err));
  }, []);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const response = await API.get('/sellers');
        setSellers(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSellers();
  }, []);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        let endpoint = activeTab === 'monthly' ? '/reports/monthly' : activeTab === 'yearly' ? '/reports/yearly' : activeTab === 'daily' ? '/reports/daily' : '/reports/weekly';
        if (activeTab === 'custom') {
          setChartData(getBlankChartData(activeTab)); // Show blank chart for custom tab if no custom logic to populate it
          return;
        }
        
        const response = await API.get(endpoint);
        const data = response.data.map(item => ({
          name: item.day || item.month || item.date || item.label || 'N/A',
          sales: Number(item.total || 0)
        }));
        setChartData(data.length > 0 ? data : getBlankChartData(activeTab)); // Use blank data if API returns empty
      } catch (err) {
        console.error(err);
        setChartData(getBlankChartData(activeTab)); // Ensure chartData is blank on error
      }
    };

    fetchChartData();
  }, [activeTab]);

  const fetchFilteredRecords = async (currentFilters) => {
    setLoading(true);
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

      const response = await API.get(`/reports/records?${queryParams.toString()}`);
      setRecords(response.data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to load records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredRecords(filters);
  }, [filters, activeTab]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Aggregations for Charts
  const sellerPerformance = useMemo(() => {
    const map = {};
    records.forEach(r => {
      const name = r.sellerId?.name || 'Unknown';
      if (!map[name]) map[name] = { name, sales: 0, records: 0 };
      map[name].sales += Number(r.totalAmount || 0);
      map[name].records += 1;
    });
    return Object.values(map).sort((a, b) => b.sales - a.sales).slice(0, 10);
  }, [records]);

  const shopPerformance = useMemo(() => {
    const map = {};
    records.forEach(r => {
      if (!map[r.shopName]) map[r.shopName] = { name: r.shopName, sales: 0, visits: 0 };
      map[r.shopName].sales += Number(r.totalAmount || 0);
      map[r.shopName].visits += 1;
    });
    return Object.values(map).sort((a, b) => b.sales - a.sales).slice(0, 10);
  }, [records]);

  const categoryWiseData = useMemo(() => {
    // Mapping existing shop types to user requested categories as examples if data matches
    const map = {};
    records.forEach(r => {
      const cat = r.shopType || 'Other';
      if (!map[cat]) map[cat] = { name: cat, value: 0 };
      map[cat].value += Number(r.totalAmount || 0);
    });
    return Object.values(map);
  }, [records]);

  const stats = useMemo(() => {
    const totalSales = records.reduce((sum, r) => sum + Number(r.totalAmount || 0), 0);
    const totalItems = records.reduce((sum, r) => sum + (r.items?.reduce((is, i) => is + Number(i.quantity || 0), 0) || 0), 0);
    const uniqueShops = new Set(records.map(r => r.shopName)).size;
    return { totalSales, totalItems, uniqueShops, totalRecords: records.length };
  }, [records]);

  // Seller Table aggregation for specific sections
  const sellerTableData = useMemo(() => {
    const map = {};
    records.forEach(r => {
      const sid = r.sellerId?._id || 'unknown';
      if (!map[sid]) map[sid] = { name: r.sellerId?.name || 'Unknown', records: 0, shops: new Set(), items: 0, sales: 0, pending: 0 };
      map[sid].records += 1;
      map[sid].shops.add(r.shopName);
      map[sid].items += r.items?.reduce((s, i) => s + Number(i.quantity || 0), 0) || 0;
      map[sid].sales += Number(r.totalAmount || 0);
      map[sid].pending += Number(r.pendingAmount || 0);
    });
    return Object.values(map);
  }, [records]);

  const handleDownloadCSV = () => {
    if (records.length === 0) {
      alert('No data to export.');
      return;
    }

    const headers = ['Date', 'Seller', 'Shop Name', 'Shop Type', 'Address', 'Landmark', 'Total Amount', 'Paid Amount', 'Pending Amount', 'Payment Status', 'Items Count', 'Items (Product x Qty @ Rate)'];
    
    const rows = records.map(r => {
      const itemsFormatted = r.items?.map(item => {
        if (item.unit === 'weight') {
          return `${item.productName} (${item.weight} kg @ ₹${item.price})`;
        } else {
          const rate = item.price || item.rate;
          return `${item.productName} (${item.quantity} pcs @ ₹${rate})`;
        }
      }).join('; ') || '';
      return [
        new Date(r.visitDatetime).toISOString(),
        r.sellerId?.name || 'Unknown',
        `"${r.shopName.replace(/"/g, '""')}"`,
        r.shopType,
        `"${r.shopAddress.replace(/"/g, '""')}"`,
        `"${(r.landmark || '').replace(/"/g, '""')}"`,
        r.totalAmount,
        r.paidAmount || 0,
        r.pendingAmount || 0,
        r.paymentStatus || 'Pending',
        r.items?.length || 0,
        `"${itemsFormatted.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_report_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 bg-slate-50/30 p-2 sm:p-0">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">Analytics & Reports</h1>
          <p className="text-sm font-medium text-slate-500">Comprehensive overview of sales and team performance</p>
        </div>
        
        <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm overflow-x-auto">
          {['daily', 'weekly', 'monthly', 'yearly', 'custom'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-blue-700 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Summary Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Sales (Month)"
          value={currencyFormatter.format(summary.monthlyTotal)}
          icon={TrendingUp}
          colorClass="text-emerald-600"
        />
        <StatCard
          title="Total Sales (Year)"
          value={currencyFormatter.format(summary.yearlyTotal)}
          icon={DollarSign}
          colorClass="text-blue-600"
        />
        <StatCard
          title="Total Records"
          value={stats.totalRecords}
          icon={Package}
          colorClass="text-violet-600"
        />
        <StatCard
          title="Shops Visited"
          value={stats.uniqueShops}
          icon={Landmark}
          colorClass="text-orange-600"
        />
        <StatCard
          title="Total Items Sold"
          value={stats.totalItems}
          icon={ShoppingCart}
          colorClass="text-purple-600"
        />
      </div>

      {/* 2. Report Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <ReportFilter onFilter={handleFilterChange} onDownloadCSV={handleDownloadCSV} sellers={sellers} filters={filters} />
      </div>

      {/* 3. Report Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-blue-700" />
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Sales Trend Chart</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} fontWeight="bold" stroke="#64748b" axisLine={false} tickLine={false} />
                <YAxis fontSize={10} fontWeight="bold" stroke="#64748b" axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="sales" stroke="#1D4ED8" strokeWidth={3} dot={{ r: 4, fill: '#1D4ED8' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Wise Sales (Pie Chart) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <PieIcon size={18} className="text-emerald-600" />
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Category Wise Sales</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryWiseData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {categoryWiseData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Seller Performance Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Users size={18} className="text-violet-600" />
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Seller Performance</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sellerPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" fontSize={10} stroke="#64748b" />
                <YAxis dataKey="name" type="category" fontSize={10} fontWeight="bold" stroke="#64748b" width={80} />
                <Tooltip />
                <Bar dataKey="sales" fill="#8B5CF6" radius={[0, 4, 4, 0]} name="Revenue" />
                <Bar dataKey="records" fill="#DDD6FE" radius={[0, 4, 4, 0]} name="Records" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shop Performance Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <CircleDot size={18} className="text-orange-600" />
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Shop Value Distribution (Bubble Chart)</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey="visits" name="Visits" fontSize={10} stroke="#64748b" label={{ value: 'Visit Count', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                <YAxis type="number" dataKey="sales" name="Sales" unit="₹" fontSize={10} stroke="#64748b" />
                <ZAxis type="number" dataKey="sales" range={[100, 1000]} name="Order Volume" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Shops" data={shopPerformance} fill="#F59E0B" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Weekly/Monthly/Yearly Detail Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-700" />
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report Details
            </h3>
          </div>
          <div className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-1 rounded">
            {stats.totalRecords} RECORDS FOUND
          </div>
        </div>

        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <th className="p-4">Seller Name</th>
                <th className="p-4 text-center">Total Records</th>
                <th className="p-4 text-center">Unique Shops</th>
                <th className="p-4 text-center">Items Sold</th>
                <th className="p-4 text-right">Total Sales</th>
                <th className="p-4 text-right text-red-600">Pending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sellerTableData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-sm font-bold text-slate-900">{row.name}</td>
                  <td className="p-4 text-sm text-center font-medium text-slate-600">{row.records}</td>
                  <td className="p-4 text-sm text-center font-medium text-slate-600">{row.shops.size}</td>
                  <td className="p-4 text-sm text-center font-medium text-slate-600">{row.items}</td>
                  <td className="p-4 text-sm text-right font-black text-slate-900">{currencyFormatter.format(row.sales)}</td>
                  <td className="p-4 text-sm text-right font-black text-red-600">{currencyFormatter.format(row.pending)}</td>
                </tr>
              ))}
              {sellerTableData.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-400 font-medium italic">No data available for this period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Full Records Table */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-slate-400" />
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">All Visit Logs</h3>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-slate-200">
            <Loader2 className="animate-spin text-blue-700" size={32} />
          </div>
        ) : (
          <SalesTable records={records} />
        )}
      </div>
    </div>
  );
};

export default Reports;
