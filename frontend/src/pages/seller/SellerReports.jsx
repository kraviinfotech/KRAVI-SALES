import React, { useEffect, useMemo, useState } from 'react';
import API from '../../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AlertCircle, BarChart3, Download, Loader2, Package, ShoppingBag, TrendingUp } from 'lucide-react';

const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

const safeDate = (v) => {
  try {
    const d = new Date(v);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return 'N/A'; }
};

const SellerReports = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    API.get('/sales/my-records')
      .then(res => setRecords(res.data))
      .catch(() => setError('Reports could not be loaded.'))
      .finally(() => setLoading(false));
  }, []);

  /* ── Aggregated stats ─────────────────────────── */
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    return records.reduce(
      (acc, r) => {
        const itemCount = (r.items || []).reduce((s, it) =>
          s + (it.unit === 'weight' ? 1 : Number(it.quantity || 0)), 0);
        const isToday = new Date(r.visitDatetime).toDateString() === today;
        return {
          visits:       acc.visits + 1,
          sales:        acc.sales  + Number(r.totalAmount || 0),
          items:        acc.items  + itemCount,
          todayVisits:  acc.todayVisits  + (isToday ? 1 : 0),
          todaySales:   acc.todaySales   + (isToday ? Number(r.totalAmount || 0) : 0),
          paidTotal:    acc.paidTotal    + Number(r.paidAmount    || 0),
          pendingTotal: acc.pendingTotal + Number(r.pendingAmount || 0),
        };
      },
      { visits: 0, sales: 0, items: 0, todayVisits: 0, todaySales: 0, paidTotal: 0, pendingTotal: 0 }
    );
  }, [records]);

  /* ── PDF ──────────────────────────────────────── */
  const handleDownloadPDF = () => {
    if (!records.length) { alert('No data to export.'); return; }
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(29, 78, 216);
    doc.text('Sales Summary Report', 14, 18);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 25);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 29, 196, 29);

    autoTable(doc, {
      startY: 36,
      head: [['Metric', 'Value']],
      body: [
        ['Total Shop Visits',   stats.visits],
        ['Total Sales Amount',  fmt.format(stats.sales)],
        ['Total Items Sold',    stats.items],
        ['Today\'s Visits',    stats.todayVisits],
        ['Today\'s Sales',     fmt.format(stats.todaySales)],
        ['Total Collected',    fmt.format(stats.paidTotal)],
        ['Total Pending',      fmt.format(stats.pendingTotal)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [29, 78, 216], fontSize: 10, fontStyle: 'bold' },
      bodyStyles: { fontSize: 10 },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
    });

    let y = doc.lastAutoTable?.finalY + 14 || 120;
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('Recent Visits', 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [['Shop', 'Date', 'Amount', 'Status']],
      body: records.slice(0, 20).map(r => [
        r.shopName || '-',
        safeDate(r.visitDatetime),
        fmt.format(r.totalAmount || 0),
        r.paymentStatus || '-',
      ]),
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [100, 116, 139], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    });

    doc.save(`Sales_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center gap-2">
        <Loader2 className="animate-spin text-blue-700" size={22} />
        <span className="text-sm font-semibold text-slate-500">Loading reports...</span>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Visits',   value: stats.visits,                   icon: ShoppingBag, color: 'bg-blue-50 text-blue-700',    ring: 'ring-blue-100' },
    { label: 'Total Sales',    value: fmt.format(stats.sales),         icon: TrendingUp,  color: 'bg-emerald-50 text-emerald-700', ring: 'ring-emerald-100' },
    { label: 'Items Sold',     value: stats.items,                    icon: Package,     color: 'bg-violet-50 text-violet-700',   ring: 'ring-violet-100' },
    { label: "Today's Visits", value: stats.todayVisits,              icon: BarChart3,   color: 'bg-amber-50 text-amber-700',    ring: 'ring-amber-100' },
    { label: "Today's Sales",  value: fmt.format(stats.todaySales),   icon: TrendingUp,  color: 'bg-sky-50 text-sky-700',        ring: 'ring-sky-100' },
    { label: 'Pending',        value: fmt.format(stats.pendingTotal), icon: AlertCircle, color: 'bg-red-50 text-red-700',        ring: 'ring-red-100' },
  ];

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-blue-700" />
          <h1 className="text-base font-black text-slate-900">My Reports</h1>
        </div>
        <button
          onClick={handleDownloadPDF}
          disabled={!records.length}
          className="flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2 text-[11px] font-black text-white shadow-sm hover:bg-blue-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={13} />
          Download PDF
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {statCards.map(({ label, value, icon: Icon, color, ring }) => (
          <div
            key={label}
            className={`rounded-xl border bg-white p-4 shadow-sm ring-1 ${ring}`}
          >
            <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-lg font-black text-slate-950 leading-tight truncate">{value}</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Recent Records List ── */}
      {records.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="text-xs font-black uppercase tracking-wide text-slate-700">Recent Visits</h2>
            <span className="text-[10px] font-bold text-slate-400">{records.length} total</span>
          </div>
          <div className="divide-y divide-slate-100">
            {records.slice(0, 10).map(r => {
              const status = r.paymentStatus || 'Pending';
              const statusCls = status === 'Paid'
                ? 'text-emerald-700' : status === 'Partial'
                ? 'text-amber-700' : 'text-red-600';
              return (
                <div key={r._id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{r.shopName}</p>
                    <p className="text-[11px] text-slate-400 font-semibold">{safeDate(r.visitDatetime)}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="font-black text-slate-950 text-sm">{fmt.format(r.totalAmount || 0)}</p>
                    <p className={`text-[10px] font-bold ${statusCls}`}>{status}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerReports;
