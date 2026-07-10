import React from 'react';
import { useTranslation } from 'react-i18next';
import { Wallet, Banknote, CreditCard, Clock } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const CollectionStatsCards = ({ collectionStats }) => {
  const { t } = useTranslation();

  const stats = [
    { label: t('manager.collection.total_collection'), value: collectionStats.totalCollection, icon: Wallet, color: 'text-indigo-700', bg: 'bg-indigo-50' },
    { label: t('manager.collection.cash_collection'), value: collectionStats.cashCollection, icon: Banknote, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: t('manager.collection.online_collection'), value: collectionStats.onlineCollection, icon: CreditCard, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: t('manager.collection.pending_collection'), value: collectionStats.pendingCollection, icon: Clock, color: 'text-red-600', bg: 'bg-red-50' }
  ];

  return (
    <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="group overflow-hidden rounded-xl bg-white/70 backdrop-blur-lg border border-slate-200 shadow-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">{stat.label}</p>
                <p className={`mt-2 text-xl font-black sm:text-2xl ${stat.color}`}>{currencyFormatter.format(stat.value)}</p>
              </div>
              <div className={`rounded-md p-2 ${stat.bg} ${stat.color}`}>
                <Icon size={20} />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default CollectionStatsCards;
