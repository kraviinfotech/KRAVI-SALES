import React from 'react';
import { Loader2 } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const RecentCollectionsTable = ({ recentCollections, collectionsLoading, onViewAll, recentCollectionsLimit }) => {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Payments</p>
          <h2 className="text-base font-black text-slate-950">Recent Collections</h2>
        </div>
        <button 
          type="button"
          onClick={onViewAll}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors"
        >
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs font-bold text-slate-500 text-left border-b border-slate-200">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Shop</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Mode</th>
              <th className="px-4 py-3">Seller</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {collectionsLoading && recentCollections.length === 0 ? (
              <tr><td colSpan="5" className="px-4 py-8 text-center"><Loader2 className="animate-spin inline text-blue-700" size={18} /></td></tr>
            ) : recentCollections.length === 0 ? (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500 font-semibold">No recent collections found.</td></tr>
            ) : (
              recentCollections.slice(0, recentCollectionsLimit).map((payment) => (
                <tr key={payment._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-700">{new Date(payment.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'numeric', minute:'numeric' })}</td>
                  <td className="px-4 py-3 font-bold text-slate-950">{payment.shopName}</td>
                  <td className="px-4 py-3 font-black text-emerald-700">+{currencyFormatter.format(payment.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${payment.mode === 'Cash' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                      {payment.mode}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{payment.sellerId?.name || 'Unknown'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default RecentCollectionsTable;
