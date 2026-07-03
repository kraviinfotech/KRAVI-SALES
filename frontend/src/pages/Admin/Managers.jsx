import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Edit2, Eye, Filter, RotateCcw, Search, Trash2, User, Users, X, XCircle } from 'lucide-react';
import API from '../../api/axios';

const SummaryCard = ({ title, value, icon: Icon, className }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
    <div className={`mb-4 inline-flex rounded-xl p-3 ${className}`}><Icon size={24} /></div>
    <p className="text-sm font-medium text-gray-500">{title}</p>
    <h3 className="mt-1 text-3xl font-bold text-gray-800">{value}</h3>
  </div>
);

const ManagerPhoto = ({ manager, large = false }) => {
  const size = large ? 'h-24 w-24' : 'h-10 w-10';
  const iconSize = large ? 48 : 20;
  return manager.photo || manager.managerScannerPhoto ? (
    <img src={manager.photo || manager.managerScannerPhoto} alt={manager.name} className={`${size} rounded-full object-cover`} />
  ) : (
    <div className={`${size} flex items-center justify-center rounded-full bg-purple-100`}><User size={iconSize} className="text-purple-600" /></div>
  );
};

const ManagersSummary = ({ managers }) => {
  const active = managers.filter((m) => m.isActive).length;
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <SummaryCard title="Total Managers" value={managers.length} icon={Users} className="bg-purple-50 text-[#6C3EF4]" />
      <SummaryCard title="Active Managers" value={active} icon={CheckCircle2} className="bg-green-50 text-green-600" />
      <SummaryCard title="Inactive Managers" value={managers.length - active} icon={XCircle} className="bg-red-50 text-red-600" />
    </div>
  );
};

const ManagerSearch = ({ value, onChange }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search by name, email, or phone." className="w-full rounded-xl border border-gray-100 bg-gray-50 py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-[#6C3EF4]" />
      </div>
      <button type="button" className="rounded-xl border border-gray-100 bg-gray-50 p-2 text-gray-600"><Filter size={18} /></button>
    </div>
  </div>
);

const ManagerActions = ({ manager, onView, onEdit, onReset, onToggle, onDelete }) => (
  <div className="flex justify-end gap-2">
    <button type="button" onClick={() => onView(manager)} className="p-2 text-[#6C3EF4]"><Eye size={18} /></button>
    <button type="button" onClick={() => onEdit(manager)} className="p-2 text-blue-600"><Edit2 size={18} /></button>
    <button type="button" onClick={() => onReset(manager)} className="p-2 text-orange-600"><RotateCcw size={18} /></button>
    <button type="button" onClick={() => onToggle(manager)} className={`p-2 ${manager.isActive ? 'text-red-500' : 'text-green-600'}`}>{manager.isActive ? <XCircle size={18} /> : <CheckCircle2 size={18} />}</button>
    <button type="button" onClick={() => onDelete(manager)} className="p-2 text-red-500"><Trash2 size={18} /></button>
  </div>
);

const ManagersTable = ({ managers, loading, actions }) => (
  <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{['Photo','Name','Email','Phone','Designation','Status'].map((h)=><th key={h} className="px-6 py-4">{h}</th>)}<th className="px-6 py-4 text-right">Actions</th></tr></thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? <tr><td colSpan={7} className="px-6 py-4 text-center">Loading...</td></tr> :
          managers.length === 0 ? <tr><td colSpan={7} className="px-6 py-4 text-center">No managers found</td></tr> :
          managers.map((manager) => <tr key={manager._id} className="hover:bg-gray-50">
            <td className="px-6 py-4"><ManagerPhoto manager={manager} /></td>
            <td className="px-6 py-4 font-semibold">{manager.name}</td><td className="px-6 py-4">{manager.email}</td>
            <td className="px-6 py-4">{manager.mobile}</td><td className="px-6 py-4">{manager.designation || 'Manager'}</td>
            <td className="px-6 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${manager.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{manager.isActive ? 'Active' : 'Inactive'}</span></td>
            <td className="px-6 py-4"><ManagerActions manager={manager} {...actions} /></td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </div>
);

const ManagerDrawer = ({ manager, onClose }) => manager ? (
  <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
    <div className="h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl">
      <div className="sticky top-0 flex justify-between bg-gradient-to-r from-[#6C3EF4] to-purple-600 p-6 text-white">
        <div><h2 className="text-2xl font-bold">Manager Profile</h2><p>{manager.designation || 'Manager'}</p></div>
        <button type="button" onClick={onClose}><X size={24}/></button>
      </div>
      <div className="space-y-4 p-6">
        <div className="flex justify-center"><ManagerPhoto manager={manager} large /></div>
        {[['Full Name',manager.name],['Designation',manager.designation || 'Manager'],['Email',manager.email],['Phone',manager.mobile]].map(([l,v])=><div key={l} className="rounded-xl bg-gray-50 p-4"><p className="text-xs uppercase text-gray-500">{l}</p><p className="font-semibold text-gray-800">{v || '-'}</p></div>)}
      </div>
    </div>
  </div>
) : null;

const Managers = () => {
  const [managers,setManagers]=useState([]); const [loading,setLoading]=useState(false);
  const [searchTerm,setSearchTerm]=useState(''); const [selectedManager,setSelectedManager]=useState(null);
  useEffect(()=>{ setLoading(true); API.get('/admin/managers').then(r=>setManagers(r.data)).catch(e=>console.error(e)).finally(()=>setLoading(false)); },[]);
  const filtered=useMemo(()=>managers.filter(m=>`${m.name||''} ${m.email||''} ${m.mobile||''}`.toLowerCase().includes(searchTerm.toLowerCase())),[managers,searchTerm]);
  const edit=(m)=>{ const payload={name:window.prompt('Name',m.name)||m.name,designation:window.prompt('Designation',m.designation||'Manager')||m.designation,email:window.prompt('Email',m.email)||m.email,mobile:window.prompt('Phone',m.mobile)||m.mobile}; API.patch(`/admin/managers/${m._id}`,payload).then(()=>setManagers(p=>p.map(x=>x._id===m._id?{...x,...payload}:x))).catch(()=>alert('Failed to update manager')); };
  const reset=(m)=>API.post('/admin/reset-manager-password',{email:m.email}).then(()=>alert(`Password reset link sent to ${m.email}`)).catch(()=>alert('Failed to reset password'));
  const toggle=(m)=>{const isActive=!m.isActive;if(!confirm(`${isActive?'Activate':'Deactivate'} ${m.name}?`))return;API.patch(`/admin/managers/${m._id}`,{isActive}).then(()=>setManagers(p=>p.map(x=>x._id===m._id?{...x,isActive}:x)));};
  const remove=(m)=>{if(!confirm(`Delete ${m.name}? This cannot be undone.`))return;API.delete(`/admin/managers/${m._id}`).then(()=>{setManagers(p=>p.filter(x=>x._id!==m._id));setSelectedManager(null);});};
  const actions={onView:setSelectedManager,onEdit:edit,onReset:reset,onToggle:toggle,onDelete:remove};
  return <div className="space-y-6"><div className="flex justify-between"><h1 className="text-2xl font-bold">Manager Management</h1><button type="button" onClick={()=>window.location.href='/admin/add-manager'} className="rounded-xl bg-[#6C3EF4] px-4 py-2 font-semibold text-white">+ Add Manager</button></div><ManagersSummary managers={managers}/><ManagerSearch value={searchTerm} onChange={setSearchTerm}/><ManagersTable managers={filtered} loading={loading} actions={actions}/><ManagerDrawer manager={selectedManager} onClose={()=>setSelectedManager(null)}/></div>;
};
export default Managers;
