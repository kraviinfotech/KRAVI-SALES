import React from 'react';
import { Search, Loader2, Trash2 } from 'lucide-react';

const numberFormatter = new Intl.NumberFormat('en-IN');
const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const SellerPerformanceTable = ({
  sellerRows,
  totals,
  recordsLoading,
  searchTerm,
  onSearchChange,
  onDeleteRecords,
  onRowClick,
  activeTab,
  tabs,
  onTabChange,
  customRange,
  onCustomRangeChange,
  onApplyCustomRange
}) => {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Reports</p>
          <h2 className="text-base font-black text-slate-950">Seller Performance</h2>
        </div>
        
        <div className="relative w-full max-w-xs lg:mx-4 lg:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <label htmlFor="seller-performance-search" className="sr-only">Search seller or shop</label>
          <input
            id="seller-performance-search"
            type="text"
            placeholder="Quick search seller/shop..."
            aria-label="Search seller or shop"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-4 text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-wrap gap-1 rounded-md border border-slate-200 bg-slate-50 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
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
                onChange={(event) => onCustomRangeChange((range) => ({ ...range, from: event.target.value }))}
                className="h-9 rounded border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-700 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
              />
              <label className="sr-only" htmlFor="manager-to-date">To date</label>
              <input
                id="manager-to-date"
                type="date"
                value={customRange.to}
                onChange={(event) => onCustomRangeChange((range) => ({ ...range, to: event.target.value }))}
                className="h-9 rounded border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-700 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
              />
              <button
                type="button"
                onClick={onApplyCustomRange}
                aria-label="Apply custom date range filter"
                title="Apply custom date range filter"
                className="inline-flex h-9 items-center gap-2 rounded bg-blue-700 px-3 text-xs font-black text-white transition-colors hover:bg-blue-800"
              >
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
            {recordsLoading && sellerRows.length === 0 ? (
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
                    onClick={() => row.sellerId && onRowClick(row.sellerId)}
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
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onDeleteRecords(row.sellerId, row.seller); }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title={t('manager.table.delete_records')}
                          aria-label={`${t('manager.table.delete_records')} ${row.seller}`}
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
                <td>
                  <span className="sr-only">No additional actions</span>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </section>
  );
};

export default SellerPerformanceTable;
