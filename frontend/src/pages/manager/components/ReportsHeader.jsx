import React from 'react';

const TABS = ['daily', 'weekly', 'monthly', 'yearly', 'custom'];

const ReportsHeader = ({ activeTab, onTabChange }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
    <div>
      <h1 className="text-2xl font-black text-slate-950 tracking-tight">Analytics &amp; Reports</h1>
      <p className="text-sm font-medium text-slate-500">Comprehensive overview of sales and team performance</p>
    </div>

    <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onTabChange(tab)}
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
);

export default ReportsHeader;
