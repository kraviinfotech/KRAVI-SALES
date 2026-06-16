import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, BarChart3 } from 'lucide-react';

const Reports = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const handleExportPDF = () => {
    window.alert('Export PDF (stub)');
  };

  const handleExportExcel = () => {
    window.alert('Export Excel (stub)');
  };

  const handleGenerate = () => {
    window.alert('Generate report (stub)');
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
        <div className="flex gap-2">
          <button onClick={handleExportPDF} className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">
            <Download size={16} /> Export PDF
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-2 bg-[#6C3EF4] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#5a32cc] transition-all">
            <Download size={16} /> Export Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter size={18} className="text-gray-500" />
          <div className="flex gap-2 flex-wrap">
            {['Today', 'This Week', 'This Month', 'All Time'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeFilter === filter
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
            <input type="date" className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C3EF4]" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Report Type</label>
          <select className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#6C3EF4]">
            <option>Revenue Report</option>
            <option>Subscription Report</option>
            <option>Company Report</option>
            <option>Manager Report</option>
            <option>Renewal Report</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Date Range</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Select dates" className="w-full bg-gray-50 border-none rounded-xl pl-10 pr-4 py-2.5 outline-none" />
          </div>
        </div>
        <div className="flex items-end">
          <button onClick={handleGenerate} className="w-full bg-purple-50 text-[#6C3EF4] font-bold py-2.5 rounded-xl hover:bg-purple-100 transition-all">
            Generate Report
          </button>
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">Report Preview</h3>
          <BarChart3 className="text-gray-300" />
        </div>
        <div className="p-12 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-700">No Data to Display</h3>
          <p className="text-gray-500 max-w-xs mx-auto mt-2">Please select report criteria and click generate to view the analysis.</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;