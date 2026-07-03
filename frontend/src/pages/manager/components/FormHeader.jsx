import React from 'react';
import { ArrowLeft } from 'lucide-react';

const FormHeader = ({ onBack }) => {
  return (
    <div className="flex items-center gap-4 border-b border-slate-200 pb-5">
      <button
        onClick={onBack}
        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
      >
        <ArrowLeft size={18} />
      </button>
      <div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">Add New Record</h1>
        <p className="text-sm font-medium text-slate-500">Manually add a sales visit record on behalf of a seller</p>
      </div>
    </div>
  );
};

export default FormHeader;
