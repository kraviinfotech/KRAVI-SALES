import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';

const RecordsHeader = ({ onAddNew }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
      <div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">{t('manager.sales_records_title')}</h1>
        <p className="text-sm font-medium text-slate-500">{t('manager.sales_records_subtitle')}</p>
      </div>
      <button 
        type="button"
        onClick={onAddNew} 
        className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95"
      >
        <Plus size={18} />
        <span>{t('manager.add_new_record')}</span>
      </button>
    </div>
  );
};

export default RecordsHeader;
