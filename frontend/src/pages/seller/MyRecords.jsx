import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AlertCircle, Download, Loader2, Package, ShoppingBag } from 'lucide-react';

const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

const safeDate = (v, full = false) => {
  try {
    const d = new Date(v);
    if (isNaN(d.getTime())) return 'N/A';
    return full
      ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
          ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return 'N/A'; }
};

const statusColors = {
  Paid:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  Partial: 'bg-amber-50   text-amber-700   border-amber-200',
  Pending: 'bg-red-50     text-red-700     border-red-200',
};

const MyRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    API.get('/sales/my-records')
      .then(res => setRecords(res.data))
      .catch(() => setError('Records load nahi ho paaye.'))
      .finally(() => setLoading(false));
  }, []);

  /* ── PDF generator ─────────────────────────────── */
  const handleDownloadPDF = () => {
    if (!records.length) { alert('No records to export.'); return; }
    const doc = new jsPDF('landscape');
    const now  = new Date().toLocaleString('en-IN');

    doc.setFontSize(18);
    doc.setTextColor(29, 78, 216);
    doc.text('My Sales Records', 14, 16);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Exported on: ${now}  |  Total: ${records.length} visits`, 14, 23);
    
    // Address on the right
    const rightX = 283;
    let rightY = 10;
    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold');
    doc.text('Kravi Infotech', rightX, rightY, { align: 'right' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    rightY += 5;
    doc.text('Ahilyanagar, Maharashtra, India', rightX, rightY, { align: 'right' });
    rightY += 5;
    doc.text('contact@kraviinfotech.com', rightX, rightY, { align: 'right' });
    rightY += 5;
    doc.text('+91 9657013534', rightX, rightY, { align: 'right' });

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 29, 283, 29);

    autoTable(doc, {
      startY: 32,
      head: [['#', 'Shop Name', 'Mobile', 'Visit Date & Time', 'Items', 'Total Amount', 'Paid', 'Pending', 'Status']],
      body: records.map((r, i) => {
        const itemCount = (r.items || []).reduce((s, it) =>
          s + (it.unit === 'weight' ? 1 : Number(it.quantity || 0)), 0);
        return [
          i + 1,
          r.shopName || '-',
          r.mobile   || '-',
          safeDate(r.visitDatetime, true),
          itemCount,
          `Rs. ${Number(r.totalAmount || 0).toLocaleString('en-IN')}`,
          `Rs. ${Number(r.paidAmount  || 0).toLocaleString('en-IN')}`,
          `Rs. ${Number(r.pendingAmount || 0).toLocaleString('en-IN')}`,
          r.paymentStatus || '-',
        ];
      }),
      theme: 'grid',
      styles: { fontSize: 8, halign: 'center' },
      headStyles: { fillColor: [29, 78, 216], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      columnStyles: {
        1: { halign: 'left' },
        3: { halign: 'left' },
        5: { halign: 'right' },
        6: { halign: 'right' },
        7: { halign: 'right' },
      },
    });

    doc.save(`My_Records_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center gap-2">
        <Loader2 className="animate-spin text-blue-700" size={22} />
        <span className="text-sm font-semibold text-slate-500">Loading records...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Header bar with PDF button ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag size={18} className="text-blue-700" />
          <h1 className="text-base font-black text-slate-900">My Records</h1>
          {records.length > 0 && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-700">
              {records.length}
            </span>
          )}
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

      {records.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
          <Package size={32} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-slate-400">Abhi koi record saved nahi hai.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {records.map((record, idx) => {
            const itemCount = (record.items || []).reduce((s, it) =>
              s + (it.unit === 'weight' ? 1 : Number(it.quantity || 0)), 0);
            const status = record.paymentStatus || 'Pending';
            return (
              <article
                key={record._id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  {/* Shop Image Preview */}
                  {record.shopImage ? (
                    <img src={record.shopImage} alt="Shop" className="h-12 w-12 shrink-0 rounded-lg object-cover border border-slate-200" />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-100">
                      <ShoppingBag size={20} className="text-slate-300" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-sm font-black text-slate-950 truncate">{record.shopName}</h2>
                          {record.mobile && (
                            <span className="text-[10px] font-semibold text-slate-400">{record.mobile}</span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                          {safeDate(record.visitDatetime, true)}
                        </p>
                      </div>
                      <div className="text-right shrink-0 space-y-1">
                        <p className="text-sm font-black text-slate-950">{fmt.format(record.totalAmount || 0)}</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[status] || statusColors.Pending}`}>
                          {status}
                        </span>
                      </div>
                    </div>

                    {/* Mini payment breakdown for partial */}
                    {status === 'Partial' && (
                      <div className="mt-2 flex gap-3 text-[11px] font-semibold">
                        <span className="text-emerald-700">Paid: {fmt.format(record.paidAmount || 0)}</span>
                        <span className="text-red-600">Pending: {fmt.format(record.pendingAmount || 0)}</span>
                      </div>
                    )}

                    {/* Product List */}
                    <div className="mt-3 bg-slate-50 rounded-md p-2.5 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 border-b border-slate-200 pb-1">Products ({itemCount})</p>
                      <ul className="space-y-1">
                        {(record.items || []).map((item, i) => {
                          const displayQty = item.unit === 'weight' ? `${item.weight}kg` : `${item.quantity}pcs`;
                          const price = Number(item.price || item.rate || 0);
                          return (
                            <li key={i} className="flex items-center justify-between text-[11px] font-medium text-slate-700">
                              <span className="truncate pr-2">• {item.productName}</span>
                              <span className="shrink-0 text-slate-500">{displayQty} x ₹{price}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyRecords;
