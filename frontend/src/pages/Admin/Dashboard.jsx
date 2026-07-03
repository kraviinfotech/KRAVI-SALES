import React, { useEffect, useState, useRef } from 'react';
import { ArrowUpRight, ArrowDownRight, Users, Building, Activity, IndianRupee, Filter, Calendar } from 'lucide-react';
import API from '../../api/axios';

const StatCard = ({ title, value, change, icon: Icon, type }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${type === 'success' ? 'bg-green-50 text-green-600' : 'bg-purple-50 text-[#6C3EF4]'}`}>
        <Icon size={24} />
      </div>
      {change && (
        <span className={`flex items-center text-xs font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(change)}%
        </span>
      )}
    </div>
    <p className="text-gray-500 text-sm font-medium">{title}</p>
    <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
  </div>
);

const formatCurrency = (num) => {
  if (typeof num !== 'number') return num;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
  return `₹${num.toLocaleString()}`;
};

const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState('All Time');
  const [dateRange, setDateRange] = useState('');
  const [overview, setOverview] = useState(null);
  
  // FIXED: Converted from useState to useRef because 'loading' is never rendered in the UI
  const loadingRef = useRef(false);

  useEffect(() => {
    const loadOverview = async () => {
      loadingRef.current = true;
      try {
        const res = await API.get('/admin/overview');
        setOverview(res.data);
      } catch (err) {
        console.error('Failed to load overview', err);
      } finally {
        loadingRef.current = false;
      }
    };
    loadOverview();
  }, []);

  const stats = overview ? [
    { title: 'Total Companies', value: overview.totalCompanies.toLocaleString(), icon: Building, change: 0 },
    { title: 'Active Companies', value: overview.activeCompanies.toLocaleString(), icon: Activity, change: 0, type: 'success' },
    { title: 'Expired Companies', value: (overview.expiredCompanies || 0).toLocaleString(), icon: Activity, change: 0 },
    { title: 'Trial Companies', value: (overview.trialCompanies || 0).toLocaleString(), icon: Activity, change: 0 },
    { title: 'Total Managers', value: overview.totalManagers.toLocaleString(), icon: Users, change: 0 },
    { title: 'Monthly Revenue', value: formatCurrency(Number(overview.monthlyRevenue || 0)), icon: IndianRupee, change: 0, type: 'success' },
    { title: 'Yearly Revenue', value: formatCurrency(Number(overview.yearlyRevenue || 0)), icon: IndianRupee, change: 0, type: 'success' },
    { title: 'Pending Renewals', value: (overview.pendingRenewals || 0).toString(), icon: Activity, change: 0 },
  ] : [
    { title: 'Loading...', value: '-', icon: Building },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <div className="text-sm text-gray-500">Last updated: Today, 10:30 AM</div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter size={18} className="text-gray-500" />
          <div className="flex gap-2 flex-wrap">
            {['Today', 'This Week', 'This Month', 'All Time'].map((filter) => (
              <button
                type="button"
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${activeFilter === filter
                  ? 'bg-[#6C3EF4] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Calendar size={18} className="text-gray-500" />
            <input type="date" value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C3EF4]" />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
            type={stat.type}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Placeholder */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
          <h3 className="font-bold text-gray-800 mb-6">Revenue Growth</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {(overview && overview.monthlyRevenue) ?
              (() => {
                const base = overview.monthlyRevenue / 12 || 10;
                const arr = Array.from({ length: 12 }).map((_, i) => Math.min(100, Math.round((base * (i + 1)) / Math.max(1, base) * 10)));
                return arr.map((h, i) => (
                  <div key={i} className="w-full bg-[#6C3EF4]/10 rounded-t-lg relative group">
                    <div
                      style={{ height: `${h}%` }}
                      className="bg-[#6C3EF4] w-full rounded-t-lg transition-all duration-500 group-hover:bg-[#5a32cc]"
                    />
                  </div>
                ));
              })()
              : [40, 60, 45, 70, 85, 55, 90, 100, 80, 95, 110, 120].map((h, i) => (
                <div key={i} className="w-full bg-[#6C3EF4]/10 rounded-t-lg relative group">
                  <div
                    style={{ height: `${h}%` }}
                    className="bg-[#6C3EF4] w-full rounded-t-lg transition-all duration-500 group-hover:bg-[#5a32cc]"
                  />
                </div>
              ))}
          </div>
        </div>

        {/* Distribution Pie Chart Placeholder */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">Plan Distribution</h3>
          <div className="flex flex-col gap-4">
            {(overview && overview.planDistribution) ? overview.planDistribution.map((p) => (
              <div key={p.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{p.name}</span>
                  <span className="font-bold">{p.val}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div className={`h-full rounded-full ${p.name === 'Professional' ? 'bg-[#6C3EF4]' : p.name === 'Enterprise' ? 'bg-indigo-900' : 'bg-purple-300'}`} style={{ width: `${p.val}%` }}></div>
                </div>
              </div>
            )) : [
              { name: 'Basic', val: 45, color: 'bg-purple-300' },
              { name: 'Professional', val: 35, color: 'bg-[#6C3EF4]' },
              { name: 'Enterprise', val: 20, color: 'bg-indigo-900' },
            ].map((p) => (
              <div key={p.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{p.name}</span>
                  <span className="font-bold">{p.val}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.val}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Companies */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Recently Added Companies</h3>
          <button type="button" className="text-[#6C3EF4] text-sm font-semibold hover:underline">View All</button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
            <tr>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Plan</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(overview && overview.recentCompanies && overview.recentCompanies.length > 0) ? overview.recentCompanies.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium">{c.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">-</td>
                <td className="px-6 py-4"><span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span></td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            )) : [1, 2, 3].map((i) => (
              <tr key={`sample-company-${i}`} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium">TechNova Solutions</td>
                <td className="px-6 py-4 text-sm text-gray-600">Enterprise</td>
                <td className="px-6 py-4"><span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span></td>
                <td className="px-6 py-4 text-sm text-gray-500">Oct 24, 2023</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;