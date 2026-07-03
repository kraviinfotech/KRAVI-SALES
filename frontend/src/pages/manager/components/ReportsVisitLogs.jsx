import React from 'react';
import { Calendar, Loader2, ClipboardX } from 'lucide-react';
import SalesTable from '../../../components/SalesTable';

const ReportsVisitLogs = ({ loading, records }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <Calendar size={18} className="text-slate-400" />
      <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">All Visit Logs</h3>
    </div>

    {loading && records.length === 0 ? (
      <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-slate-200">
        <Loader2 className="animate-spin text-blue-700" size={32} />
      </div>
    ) : !loading && records.length === 0 ? (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-16 flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
          <ClipboardX size={26} className="text-slate-400" />
        </div>
        <p className="text-base font-bold text-slate-600">No visit logs found</p>
        <p className="text-sm text-slate-400 text-center max-w-xs">
          No records match the current filter. Try changing the date range or ask your sellers to log their first visit.
        </p>
      </div>
    ) : (
      <SalesTable records={records} />
    )}
  </div>
);

export default ReportsVisitLogs;
