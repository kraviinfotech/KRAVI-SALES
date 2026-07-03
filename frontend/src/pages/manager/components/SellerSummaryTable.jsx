import React from 'react';
import { BarChart3 } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

const SellerSummaryTable = ({ activeTab, sellerTableData, totalRecords }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <BarChart3 size={18} className="text-blue-700" />
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report Details
        </h3>
      </div>
      <div className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-1 rounded">
        {totalRecords} RECORDS FOUND
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
          {sellerTableData.map((row) => (
            <tr key={row.sellerId || row.name} className="hover:bg-slate-50/50 transition-colors">
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
              <td colSpan="6" className="p-12 text-center text-slate-400 font-medium italic">
                No data available for this period.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default SellerSummaryTable;
