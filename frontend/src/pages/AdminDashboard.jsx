import React from 'react';
import { Users, Building2, TrendingUp, AlertCircle } from 'lucide-react';

const dashboardStats = [
  { label: 'Total Companies', value: '12', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100' },
  { label: 'Active Managers', value: '48', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
  { label: 'Platform Revenue', value: '₹2.4L', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { label: 'Pending Issues', value: '3', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
];

const AdminDashboard = () => {

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 font-medium">Platform-wide analytics and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for Recent Managers */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Recent Manager Onboarding</h3>
          <button type="button" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All Managers</button>
        </div>
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
            <Users className="text-slate-300" size={32} />
          </div>
          <h4 className="text-slate-900 font-bold">No Recent Managers</h4>
          <p className="text-slate-500 max-w-xs mx-auto mt-2">
            Managers you create will appear here. Start by setting up a company and its supervisor.
          </p>
          <button type="button" className="mt-6 bg-slate-900 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-slate-800 transition-all">
            Create Manager Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;