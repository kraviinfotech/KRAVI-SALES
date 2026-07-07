import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Plus } from 'lucide-react';

const DashboardHeader = ({ onAddNew, currentDate }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-blue-50 p-2 text-blue-700">
          <BarChart3 size={22} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Web</p>
          <h1 className="text-xl font-black text-slate-950 sm:text-2xl">{t('manager.dashboard_title')}</h1>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onAddNew}
          className="flex h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-xs font-black text-white shadow-sm transition-colors hover:bg-blue-800 sm:h-9"
        >
          <Plus size={16} />
          {t('manager.add_new_record')}
        </button>
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-center text-xs font-bold text-slate-500 shadow-sm sm:text-left">
          {currentDate}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
