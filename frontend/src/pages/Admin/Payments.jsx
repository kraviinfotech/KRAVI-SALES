import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Clock, Download, Filter, IndianRupee, TrendingUp } from 'lucide-react';
import API from '../../api/axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const FILTERS=['Today','This Week','This Month','All Time'];
const STATUS_CLASSES={Paid:'bg-green-100 text-green-700',Active:'bg-green-100 text-green-700',Pending:'bg-yellow-100 text-yellow-700',Failed:'bg-red-100 text-red-700'};
const EMPTY_PAYMENT_STATS={totalRevenue:0,monthlyRevenue:0,pendingPayments:0,upcomingRenewals:0};
const PAYMENTS_QUERY_KEY=['admin','payments'];

const mapPaymentsData=(data={})=>({
  stats:{
    totalRevenue:data.totalRevenue||0,
    monthlyRevenue:data.monthlyRevenue||0,
    pendingPayments:data.pendingPayments||0,
    upcomingRenewals:data.upcomingRenewals||0,
  },
  transactions:(data.subscriptionTransactions||[]).map(t=>({id:t._id,company:t.name,amount:t.amount,plan:t.plan||'Subscription',method:t.paymentMethod||'Subscription',invoice:t.invoice||`INV-${t._id?.slice(-6)}`,status:t.paymentStatus||'Pending',date:t.createdAt})),
});

const fetchPayments=async()=>{const res=await API.get('/payments');return mapPaymentsData(res.data);};

const RevenueCard=({title,amount,icon:Icon,colorClass})=><div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"><div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${colorClass}`}><Icon size={24}/></div><p className="text-sm font-medium text-gray-500">{title}</p><h2 className="mt-1 flex items-center gap-1 text-2xl font-bold text-gray-800"><IndianRupee size={20}/>{amount}</h2></div>;
const StatusBadge=({status})=><span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_CLASSES[status]||'bg-gray-100 text-gray-700'}`}>{status}</span>;
const PaymentFilters=({active,onChange})=><div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"><div className="flex flex-wrap items-center gap-3"><Filter size={18} className="text-gray-500"/><div className="flex flex-wrap gap-2">{FILTERS.map(f=><button type="button" key={f} onClick={()=>onChange(f)} className={`rounded-lg px-4 py-2 font-medium ${active===f?'bg-[#6C3EF4] text-white':'bg-gray-100 text-gray-600'}`}>{f}</button>)}</div></div></div>;
const StatsGrid=({stats})=><div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"><RevenueCard title="Total Revenue" amount={stats.totalRevenue||0} icon={TrendingUp} colorClass="bg-green-50 text-green-600"/><RevenueCard title="Monthly Revenue" amount={stats.monthlyRevenue||0} icon={Clock} colorClass="bg-purple-50 text-[#6C3EF4]"/><RevenueCard title="Pending Payments" amount={stats.pendingPayments||0} icon={AlertCircle} colorClass="bg-orange-50 text-orange-600"/><RevenueCard title="Upcoming Renewals" amount={stats.upcomingRenewals||0} icon={CheckCircle2} colorClass="bg-blue-50 text-blue-600"/></div>;
const TransactionsTable=({transactions,loading,onInvoice})=>(
  <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
    <div className="border-b p-6"><h3 className="font-bold">Recent Transactions</h3></div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500"><tr>{['Company','Amount','Plan','Method','Invoice','Status'].map(h=><th key={h} className="px-6 py-4">{h}</th>)}<th className="px-6 py-4 text-right">Actions</th></tr></thead>
        <tbody className="divide-y">
          {loading?<tr><td colSpan={7} className="px-6 py-4">Loading...</td></tr>:transactions.length===0?<tr><td colSpan={7} className="px-6 py-4">No transactions</td></tr>:transactions.map(t=><tr key={t.id} className="hover:bg-gray-50"><td className="px-6 py-4 font-semibold">{t.company}</td><td className="px-6 py-4 font-bold">₹{t.amount}</td><td className="px-6 py-4">{t.plan}</td><td className="px-6 py-4">{t.method}</td><td className="px-6 py-4">{t.invoice}</td><td className="px-6 py-4"><StatusBadge status={t.status}/></td><td className="px-6 py-4 text-right"><button type="button" onClick={()=>onInvoice(t)} className="inline-flex items-center gap-1 font-semibold text-[#6C3EF4]"><Download size={14}/> Invoice</button></td></tr>)}
        </tbody>
      </table>
    </div>
  </div>
);
const downloadCSV=(filename,rows)=>{if(!rows.length)return;const csv=[Object.keys(rows[0]).join(','),...rows.map(r=>Object.values(r).map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(','))].join('\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);};
const generatePDFInvoice=(t)=>{const doc=new jsPDF({unit:'pt',format:'A4'});doc.setFontSize(24);doc.text('KRAVI SALES',40,50);doc.setFontSize(16);doc.text('INVOICE',40,90);doc.setFontSize(10);doc.text(`Invoice #: ${t.id}`,40,115);doc.text(`Company: ${t.company}`,40,135);doc.text(`Plan: ${t.plan}`,40,155);doc.text(`Amount: INR ${Number(t.amount||0).toFixed(2)}`,40,175);doc.text(`Payment Status: ${t.status}`,40,195);doc.text(`Payment Method: ${t.method}`,40,215);doc.save(`${t.id}_invoice.pdf`);};

const Payments=()=>{
  const [activeFilter,setActiveFilter]=useState('All Time');
  const {data={stats:EMPTY_PAYMENT_STATS,transactions:[]},isPending:loading}=useQuery({
    queryKey:PAYMENTS_QUERY_KEY,
    queryFn:fetchPayments,
  });
  const {stats,transactions}=data;

  return <div className="space-y-6"><div className="flex justify-between"><h1 className="text-2xl font-bold">Payment Management</h1><button type="button" onClick={()=>transactions.length?downloadCSV('transactions.csv',transactions):alert('No transactions to export')} className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 font-semibold"><Download size={18}/> Export History</button></div><PaymentFilters active={activeFilter} onChange={setActiveFilter}/><StatsGrid stats={stats}/><TransactionsTable transactions={transactions} loading={loading} onInvoice={generatePDFInvoice}/></div>;
};
export default Payments;
