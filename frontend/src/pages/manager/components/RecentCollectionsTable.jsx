import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const RecentCollectionsTable = ({ recentCollections, collectionsLoading, onViewAll, recentCollectionsLimit }) => {
  const { t } = useTranslation();

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t('manager.sections.payments')}</p>
          <h2 className="text-base font-black text-slate-950">{t('manager.sections.recent_collections')}</h2>
        </div>
        <button 
          type="button"
          onClick={onViewAll}
          className="rounded-md bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 transition-colors hover:bg-indigo-100 hover:text-indigo-800"
        >
          {t('manager.actions.view_all')}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs font-bold text-slate-500 text-left border-b border-slate-200">
              <th className="px-4 py-3">{t('manager.table.date')}</th>
              <th className="px-4 py-3">{t('manager.table.shop')}</th>
              <th className="px-4 py-3">{t('manager.table.amount')}</th>
              <th className="px-4 py-3">{t('manager.table.mode')}</th>
              <th className="px-4 py-3">{t('manager.table.seller')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {collectionsLoading && recentCollections.length === 0 ? (
              <tr><td colSpan="5" className="px-4 py-8 text-center"><Loader2 className="animate-spin inline text-blue-700" size={18} /></td></tr>
            ) : recentCollections.length === 0 ? (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-500 font-semibold">{t('manager.table.no_recent_collections')}</td></tr>
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
