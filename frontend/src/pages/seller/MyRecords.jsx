import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AlertCircle, Download, Loader2, Package, ShoppingBag, X, CheckCircle2, Camera } from 'lucide-react';

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

let cachedRecords = null;
let hasFetchedRecords = false;

const MyRecords = () => {
  const [records, setRecords] = useState(cachedRecords || []);
  const [loading, setLoading] = useState(!hasFetchedRecords);
  const [error, setError]   = useState('');

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: '', mode: 'Cash', txnId: '', remarks: '' });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  
  // Payment Scanner & Photo Upload State
  const [defaultScannerPhoto, setDefaultScannerPhoto] = useState(null);
  const [managerScannerLoaded, setManagerScannerLoaded] = useState(false);
  const [paymentPhoto, setPaymentPhoto] = useState(null);

  const fetchRecords = (quiet = false) => {
    if (!quiet) setLoading(true);
    API.get('/sales/my-records')
      .then(res => {
        setRecords(res.data);
        cachedRecords = res.data;
        hasFetchedRecords = true;
      })
      .catch(() => setError('Records load nahi ho paaye.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecords(hasFetchedRecords);
    
    // Fetch manager default scanner
    const loadDefaultScanner = async () => {
      try {
        const response = await API.get('/auth/manager-scanner');
        if (response.data && response.data.scannerPhoto) {
          setDefaultScannerPhoto(response.data.scannerPhoto);
        }
      } catch (err) {
        console.error("Failed to load manager scanner:", err);
      } finally {
        setManagerScannerLoaded(true);
      }
    };
    loadDefaultScanner();
  }, []);

  const handleOpenPayment = (record) => {
    setSelectedRecord(record);
    setPaymentForm({ amount: '', mode: 'Cash', txnId: '', remarks: '' });
    setPaymentError('');
    setPaymentPhoto(null);
    setShowPaymentModal(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setPaymentError('Only image files are allowed');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentError('');
    
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      setPaymentError('Please enter a valid amount.');
      return;
    }


    setPaymentLoading(true);
    try {
      await API.post('/shoppayments/receive', {
        salesRecordId: selectedRecord._id,
        amount: Number(paymentForm.amount),
        mode: paymentForm.mode,
        txnId: paymentForm.txnId,
        remarks: paymentForm.remarks,
        paymentPhoto
      });
      alert('Payment Received Successfully');
      setShowPaymentModal(false);
      fetchRecords(); // refresh records
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Error receiving payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  /* ── PDF generator (same as Manager dashboard) ─── */
  const handleDownloadPDF = () => {
    if (!records.length) { alert('No records to export.'); return; }

    const doc = new jsPDF('landscape');
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const L = 14;
    const R = W - 14;

    const BLUE  = [26, 86, 219];
    const DBLUE = [30, 58, 138];
    const GRAY  = [107, 114, 128];
    const DARK  = [17, 24, 39];
    const WHITE = [255, 255, 255];

    // ── HEADER: Logo block ──
    doc.setFillColor(...BLUE);
    doc.roundedRect(L, 12, 32, 32, 5, 5, 'F');
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...WHITE);
    doc.text('K', L + 8, 12 + 24);

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DBLUE);
    doc.text('KRAVI', L + 40, 12 + 16);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.text('Sales Person Tracker', L + 40, 12 + 24);

    // Center Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DBLUE);
    doc.text('My Sales Records', W / 2, 12 + 16, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    const dateStr = new Date().toLocaleString('en-IN');
    doc.text(`Generated on: ${dateStr}  |  Total: ${records.length} visits`, W / 2, 12 + 26, { align: 'center' });

    // Contact Right
    const cX = R;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text('Kravi Infotech', cX, 12 + 10, { align: 'right' });

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    let yRight = 12 + 17;
    doc.text('Ahilyanagar, Maharashtra, India', cX, yRight, { align: 'right' });
    yRight += 7;
    doc.text('contact@kraviinfotech.com', cX, yRight, { align: 'right' });
    yRight += 7;
    doc.text('+91 9657013534', cX, yRight, { align: 'right' });

    // Top Divider
    let y = 12 + 40;
    doc.setDrawColor(...BLUE);
    doc.setLineWidth(1.2);
    doc.line(L, y, R, y);
    y += 10;

    const tableColumn = ['#', 'Shop Name', 'Mobile', 'Visit Date & Time', 'Items', 'Total Amount', 'Paid', 'Pending', 'Status'];
    const tableRows = records.map((r, i) => {
      const itemCount = (r.items || []).reduce((s, it) =>
        s + (it.unit === 'weight' ? 1 : Number(it.quantity || 0)), 0);
      return [
        i + 1,
        r.shopName || '-',
        r.mobile   || '-',
        safeDate(r.visitDatetime, true),
        itemCount,
        `Rs. ${Number(r.totalAmount   || 0).toLocaleString('en-IN')}`,
        `Rs. ${Number(r.paidAmount    || 0).toLocaleString('en-IN')}`,
        `Rs. ${Number(r.pendingAmount || 0).toLocaleString('en-IN')}`,
        r.paymentStatus || 'Pending',
      ];
    });

    const STATUS_COL = 8;

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: y,
      theme: 'grid',
      headStyles: { fillColor: DBLUE, textColor: WHITE, fontSize: 8, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { cellPadding: 4, halign: 'center', lineColor: [220, 225, 235] },
      columnStyles: {
        1: { halign: 'left' },
        3: { halign: 'left' },
        5: { halign: 'right' },
        6: { halign: 'right', textColor: [5, 122, 85],  fontStyle: 'bold' },
        7: { halign: 'right', textColor: [185, 28, 28], fontStyle: 'bold' },
      },
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === STATUS_COL) {
          const val = String(data.cell.raw || '');
          if (val === 'Paid') {
            data.cell.styles.textColor = [5, 122, 85];
            data.cell.styles.fontStyle = 'bold';
          } else if (val === 'Pending') {
            data.cell.styles.textColor = [185, 28, 28];
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [180, 83, 9];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
      margin: { left: L, right: L, bottom: 30 },
      didDrawPage: function (data) {
        const footerY = H - 15;
        doc.setDrawColor(...BLUE);
        doc.setLineWidth(1.2);
        doc.line(L, footerY - 10, R, footerY - 10);

        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...BLUE);
        doc.text('KRAVI Sales Person Tracker', L, footerY);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...DARK);
        doc.text('This is a system generated report.', W / 2, footerY, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...BLUE);
        doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber} of {total_pages_count_string}`, R, footerY, { align: 'right' });
      }
    });

    const totalPagesExp = '{total_pages_count_string}';
    if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPagesExp);
    }

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
                    
                    {/* Receive Payment Button */}
                    {status !== 'Paid' && (
                      <div className="mt-3">
                        <button
                          onClick={() => handleOpenPayment(record)}
                          className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-2 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
                        >
                          <CheckCircle2 size={14} />
                          Receive Payment
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Receive Payment Modal */}
      {showPaymentModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50">
              <h3 className="font-bold text-slate-800">Receive Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 border border-slate-200">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto">
              <div className="mb-4 bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                <p className="text-xs text-indigo-800 font-semibold mb-1">Shop: {selectedRecord.shopName}</p>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Bill: {fmt.format(selectedRecord.totalAmount || 0)}</span>
                  <span className="text-red-600 font-bold">Pending: {fmt.format(selectedRecord.pendingAmount || 0)}</span>
                </div>
              </div>

              {paymentError && (
                <div className="mb-4 p-2 bg-red-50 text-red-600 text-xs font-semibold rounded-lg flex items-center gap-2 border border-red-200">
                  <AlertCircle size={14} />
                  <span>{paymentError}</span>
                </div>
              )}

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount Received (₹)</label>
                  <input
                    type="number"
                    max={selectedRecord.pendingAmount}
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                    placeholder="E.g. 5000"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Cannot exceed pending amount.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Cash', 'Online'].map(m => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setPaymentForm({ ...paymentForm, mode: m })}
                        className={`py-1.5 text-xs font-bold rounded-md border transition-colors ${
                          paymentForm.mode === m 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {paymentForm.mode === 'Online' && (
                  <div className="space-y-4">
                    {managerScannerLoaded && defaultScannerPhoto ? (
                      <div className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <img src={defaultScannerPhoto} alt="Manager Scanner" className="max-w-[200px] h-auto object-contain rounded" />
                        <p className="mt-2 text-xs text-gray-500 font-medium">Scan to Pay</p>
                      </div>
                    ) : managerScannerLoaded ? (
                      <div className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-500">Scanner Not Available</p>
                      </div>
                    ) : (
                      <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gray-400" /></div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Transaction ID (Optional)</label>
                      <input
                        type="text"
                        value={paymentForm.txnId}
                        onChange={(e) => setPaymentForm({ ...paymentForm, txnId: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Enter TXN ID"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Upload Payment Photo (Optional)</label>
                      {paymentPhoto ? (
                        <div className="relative inline-block">
                          <img src={paymentPhoto} alt="Payment" className="h-24 w-auto rounded border border-gray-300 object-cover" />
                          <button
                            type="button"
                            onClick={() => setPaymentPhoto(null)}
                            className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            id="payment-photo-upload"
                            className="hidden"
                            onChange={handlePhotoChange}
                          />
                          <label
                            htmlFor="payment-photo-upload"
                            className="flex items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <Camera size={24} className="text-gray-400" />
                            <span className="text-sm text-gray-500 font-medium">Tap to upload photo</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Remarks (Optional)</label>
                  <textarea
                    rows={2}
                    value={paymentForm.remarks}
                    onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Any notes..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={paymentLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-black text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors mt-2"
                >
                  {paymentLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  Save Payment
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyRecords;
