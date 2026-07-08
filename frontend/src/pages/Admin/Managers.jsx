import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Edit2, Eye, Filter, RotateCcw, Search, Trash2, User, Users, X, XCircle } from 'lucide-react';
import API from '../../api/axios';

const MANAGERS_QUERY_KEY = ['admin', 'managers'];

const fetchManagers = async () => {
  const res = await API.get('/admin/managers');
  return Array.isArray(res.data) ? res.data : [];
};

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
  const { t } = useTranslation();
  const active = managers.filter((m) => m.isActive).length;
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <SummaryCard title={t('admin.total_managers')} value={managers.length} icon={Users} className="bg-purple-50 text-[#6C3EF4]" />
      <SummaryCard title={t('admin.active_managers')} value={active} icon={CheckCircle2} className="bg-green-50 text-green-600" />
      <SummaryCard title={t('admin.inactive_managers')} value={managers.length - active} icon={XCircle} className="bg-red-50 text-red-600" />
    </div>
  );
};

const ManagerSearch = ({ value, onChange }) => {
  const { t } = useTranslation();
  return (
  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <label htmlFor="manager-search" className="sr-only">{t('admin.search_managers')}</label>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input id="manager-search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={t('admin.search_managers_placeholder')} aria-label={t('admin.search_managers')} className="w-full rounded-xl border border-gray-100 bg-gray-50 py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-[#6C3EF4]" />
      </div>
      <button type="button" aria-label={t('admin.filter_managers')} className="rounded-xl border border-gray-100 bg-gray-50 p-2 text-gray-600"><Filter size={18} /></button>
    </div>
  </div>
)};

const ManagerActions = ({ manager, onView, onEdit, onReset, onToggle, onDelete }) => (
  <div className="flex justify-end gap-2">
    <button type="button" onClick={() => onView(manager)} aria-label="View manager" className="p-2 text-[#6C3EF4]"><Eye size={18} /></button>
    <button type="button" onClick={() => onEdit(manager)} aria-label="Edit manager" className="p-2 text-blue-600"><Edit2 size={18} /></button>
    <button type="button" onClick={() => onReset(manager)} aria-label="Reset password" className="p-2 text-orange-600"><RotateCcw size={18} /></button>
    <button type="button" onClick={() => onToggle(manager)} aria-label={manager.isActive ? 'Deactivate manager' : 'Activate manager'} className={`p-2 ${manager.isActive ? 'text-red-500' : 'text-green-600'}`}>{manager.isActive ? <XCircle size={18} /> : <CheckCircle2 size={18} />}</button>
    <button type="button" onClick={() => onDelete(manager)} aria-label="Delete manager" className="p-2 text-red-500"><Trash2 size={18} /></button>
  </div>
);

const ManagersTable = ({ managers, loading, actions }) => {
  const { t } = useTranslation();
  return (
  <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{[t('admin.photo'),t('admin.name'),t('admin.email'),t('admin.phone'),t('admin.designation'),t('admin.status')].map((h)=><th key={h} className="px-6 py-4">{h}</th>)}<th className="px-6 py-4 text-right">{t('admin.actions')}</th></tr></thead>
        <tbody className="divide-y divide-gray-100">
          {loading ? <tr><td colSpan={7} className="px-6 py-4 text-center">{t('admin.loading')}</td></tr> :
          managers.length === 0 ? <tr><td colSpan={7} className="px-6 py-4 text-center">{t('admin.no_managers_found')}</td></tr> :
          managers.map((manager) => <tr key={manager._id} className="hover:bg-gray-50">
            <td className="px-6 py-4"><ManagerPhoto manager={manager} /></td>
            <td className="px-6 py-4 font-semibold">{manager.name}</td><td className="px-6 py-4">{manager.email}</td>
            <td className="px-6 py-4">{manager.mobile}</td><td className="px-6 py-4">{manager.designation || t('admin.manager')}</td>
            <td className="px-6 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${manager.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{manager.isActive ? t('admin.active') : t('admin.inactive')}</span></td>
            <td className="px-6 py-4"><ManagerActions manager={manager} {...actions} /></td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </div>
)};

const ManagerDrawer = ({ manager, onClose }) => {
  const { t } = useTranslation();
  return manager ? (
  <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
    <div className="h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl">
      <div className="sticky top-0 flex justify-between bg-gradient-to-r from-[#6C3EF4] to-purple-600 p-6 text-white">
        <div><h2 className="text-2xl font-bold">{t('admin.manager_profile')}</h2><p>{manager.designation || t('admin.manager')}</p></div>
        <button type="button" onClick={onClose} aria-label={t('admin.close_manager_profile')}><X size={24}/></button>
      </div>
      <div className="space-y-4 p-6">
        <div className="flex justify-center"><ManagerPhoto manager={manager} large /></div>
        {[[t('admin.full_name'),manager.name],[t('admin.designation'),manager.designation || t('admin.manager')],[t('admin.email'),manager.email],[t('admin.phone'),manager.mobile]].map(([l,v])=><div key={l} className="rounded-xl bg-gray-50 p-4"><p className="text-xs uppercase text-gray-500">{l}</p><p className="font-semibold text-gray-800">{v || '-'}</p></div>)}
      </div>
    </div>
  </div>
) : null;
};

const Managers = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchTerm,setSearchTerm]=useState(''); const [selectedManager,setSelectedManager]=useState(null);
  const { data: managers = [], isPending: loading } = useQuery({
    queryKey: MANAGERS_QUERY_KEY,
    queryFn: fetchManagers,
  });
  const filtered=useMemo(()=>managers.filter(m=>`${m.name||''} ${m.email||''} ${m.mobile||''}`.toLowerCase().includes(searchTerm.toLowerCase())),[managers,searchTerm]);
  const reset = (m) => API.post('/admin/reset-manager-password', { email: m.email }).then(() => alert(t('admin.password_reset_sent', { email: m.email }))).catch(() => alert(t('admin.failed_to_reset_password')));
  const edit=(m)=>{ const payload={name:window.prompt(t('admin.name'),m.name)||m.name,designation:window.prompt(t('admin.designation'),m.designation||t('admin.manager'))||m.designation,email:window.prompt(t('admin.email'),m.email)||m.email,mobile:window.prompt(t('admin.phone'),m.mobile)||m.mobile}; API.patch(`/admin/managers/${m._id}`,payload).then((res)=>{const updated=res.data||{...m,...payload};queryClient.setQueryData(MANAGERS_QUERY_KEY,(prev=[])=>prev.map(x=>x._id===m._id?updated:x));setSelectedManager(current=>current?._id===m._id?updated:current);}).catch(()=>alert(t('admin.failed_to_update_manager'))); };
  const toggle=(m)=>{const isActive=!m.isActive;if(!confirm(`${isActive?t('admin.activate'):t('admin.deactivate')} ${m.name}?`))return;API.patch(`/admin/managers/${m._id}`,{isActive}).then(()=>{queryClient.setQueryData(MANAGERS_QUERY_KEY,(prev=[])=>prev.map(x=>x._id===m._id?{...x,isActive}:x));setSelectedManager(current=>current?._id===m._id?{...current,isActive}:current);});};
  const remove=(m)=>{if(!confirm(t('admin.confirm_delete', { name: m.name })))return;API.delete(`/admin/managers/${m._id}`).then(()=>{queryClient.setQueryData(MANAGERS_QUERY_KEY,(prev=[])=>prev.filter(x=>x._id!==m._id));setSelectedManager(null);});};
  const actions={onView:setSelectedManager,onEdit:edit,onReset:reset,onToggle:toggle,onDelete:remove};
  return <div className="space-y-6"><div className="flex justify-between"><h1 className="text-2xl font-bold">{t('admin.manager_management')}</h1><button type="button" onClick={()=>window.location.href='/admin/add-manager'} className="rounded-xl bg-[#6C3EF4] px-4 py-2 font-semibold text-white">+ {t('admin.add_manager')}</button></div><ManagersSummary managers={managers}/><ManagerSearch value={searchTerm} onChange={setSearchTerm}/><ManagersTable managers={filtered} loading={loading} actions={actions}/><ManagerDrawer manager={selectedManager} onClose={()=>setSelectedManager(null)}/></div>;
};
export default Managers;
