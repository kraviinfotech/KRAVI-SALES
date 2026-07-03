import React from 'react';
import { BarChart3, Plus } from 'lucide-react';

const DashboardHeader = ({ onAddNew, currentDate }) => {
  return (
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
          type="button"
          onClick={onAddNew}
          className="flex h-9 items-center gap-2 rounded-md bg-blue-700 px-4 text-xs font-black text-white shadow-sm transition-colors hover:bg-blue-800"
        >
          <Plus size={16} />
          Add New Record
        </button>
        <div className="hidden rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 shadow-sm sm:block">
          {currentDate}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
