import React from 'react';

const SectionTitle = ({ icon: Icon, title, color = 'text-blue-700', bg = 'bg-blue-50' }) => (
  <div className={`flex items-center gap-2 px-5 py-3 border-b border-slate-100 ${bg}`}>
    <Icon size={16} className={color} />
    <h3 className={`text-xs font-black uppercase tracking-widest ${color}`}>{title}</h3>
  </div>
);

export default SectionTitle;
