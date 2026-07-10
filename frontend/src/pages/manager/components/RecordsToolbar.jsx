import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, FileSpreadsheet, FileText, Printer, Download } from 'lucide-react';
import ReportFilter from '../../../components/ReportFilter';

const RecordsToolbar = ({
  filters,
  onFilterChange,
  sellers,
  onSearch,
  onExportExcel,
  onExportPDF,
  onPrint,
  onDownloadCSV
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <label htmlFor="records-toolbar-search" className="sr-only">{t('manager.search_shop_name')}</label>
          <input
            id="records-toolbar-search"
            type="text"
            placeholder={t('manager.search_shop_name_placeholder')}
            aria-label={t('manager.search_shop_name')}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            value={filters.shopName}
            onChange={(e) => onSearch({ ...filters, shopName: e.target.value })}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button 
            type="button"
            onClick={onExportExcel} 
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" />
            {t('manager.actions.excel')}
          </button>
          <button 
            type="button"
            onClick={onExportPDF} 
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <FileText size={14} className="text-red-600" />
            {t('manager.actions.pdf')}
          </button>
          <button 
            type="button"
            onClick={onPrint} 
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <Printer size={14} className="text-slate-600" />
            {t('manager.actions.print')}
          </button>
          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
          <button 
            type="button"
            onClick={onDownloadCSV} 
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            <Download size={14} />
            {t('manager.actions.csv')}
          </button>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100">
        <ReportFilter onFilter={onFilterChange} sellers={sellers} filters={filters} />
      </div>
    </div>
  );
};

export default RecordsToolbar;
