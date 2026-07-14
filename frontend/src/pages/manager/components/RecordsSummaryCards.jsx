import React from 'react';
import { useTranslation } from 'react-i18next';
import { ClipboardList, CheckCircle2, XCircle, DollarSign, Calendar } from 'lucide-react';

const RecordsSummaryCards = ({ summary, loading, currencyFormatter }) => {
  const { t } = useTranslation();
  const stats = [
    { label: t('manager.cards.total_records'), value: summary.total, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('manager.cards.fully_paid'), value: summary.active, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t('manager.cards.unpaid_pending'), value: summary.inactive, icon: XCircle, color: 'text-slate-600', bg: 'bg-slate-100' },
    { label: t('manager.cards.total_pending'), value: currencyFormatter.format(summary.totalPending), icon: DollarSign, color: 'text-red-600', bg: 'bg-red-50' },
    { label: t('manager.cards.new_this_month'), value: summary.newThisMonth, icon: Calendar, color: 'text-violet-600', bg: 'bg-violet-50' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 transition-hover hover:shadow-md">
          <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
            <stat.icon size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900">{loading ? '...' : stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecordsSummaryCards;
