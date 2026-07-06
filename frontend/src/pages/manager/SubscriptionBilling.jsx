import React, { useState, useEffect } from 'react';
import {
  CreditCard, Download, Loader2, RefreshCw, AlertCircle,
  ShieldCheck, Calendar, Users, ArrowRight
} from 'lucide-react';
import API from '../../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import SubscriptionModal from '../../components/SubscriptionModal';

/* safe date formatter */
const safeDate = (value, full = false) => {
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return 'N/A';
    return full
      ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
          ', ' +
          d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return 'N/A';
  }
};

/* safe number formatter */
const safeAmount = (val) => Number(val || 0).toLocaleString('en-IN');

/* status badge */
const getStatusBadge = (statusVal) => {
  const colors = {
    active:  'bg-emerald-50 text-emerald-700 border-emerald-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    paid:    'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50   text-amber-700   border-amber-200',
    failed:  'bg-red-50     text-red-700     border-red-200',
    expired: 'bg-slate-100  text-slate-600   border-slate-200',
  };
  const norm = String(statusVal || '').toLowerCase();
  const label =
    norm === 'success' || norm === 'active' || norm === 'paid'
      ? 'Paid / Active'
      : norm.toUpperCase() || 'UNKNOWN';
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
        colors[norm] || 'bg-gray-50 text-gray-600 border-gray-200'
      }`}
    >
      {label}
    </span>
  );
};

/* ============================================================
   INVOICE PDF GENERATOR — matches sample KRAVI invoice design
   ============================================================ */
const generateInvoicePDF = (tx, managerName) => {
  try {
    const doc = new jsPDF({ unit: 'pt', format: 'A4' });
    const W   = doc.internal.pageSize.getWidth();   // ~595
    const H   = doc.internal.pageSize.getHeight();  // ~842
    const L   = 40;
    const R   = W - 40;

    /* helpers */
    const fmtAmt = (v) =>
      Number(v || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const fmtDate = (v) => {
      try {
        const d = new Date(v);
        return isNaN(d.getTime())
          ? 'N/A'
          : d.toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
      } catch {
        return 'N/A';
      }
    };

    /* financial calculations */
    const baseAmount  = Number(tx.amount || 0);
    const gstRate     = 0.18;
    const gstAmount   = +(baseAmount * gstRate).toFixed(2);
    const totalAmount = +(baseAmount + gstAmount).toFixed(2);
    const amountPaid  = totalAmount;
    const balanceDue  = 0;

    /* invoice meta */
    const invoiceNo     = tx.invoice || `INV-${String(tx._id || '').slice(-6).toUpperCase()}`;
    const invoiceDate   = fmtDate(tx.createdAt);
    const paymentStatus = ['success', 'paid'].includes(String(tx.status).toLowerCase()) ? 'PAID' : 'UNPAID';
    const planName      = tx.planName || 'Subscription';

    /* subscription details */
    const sub       = tx.subscriptionDetails || {};
    const startDate = fmtDate(sub.startDate || tx.createdAt);
    const endDate   = fmtDate(sub.endDate   || null);
    const maxSellers =
      sub.maxSellers != null
        ? sub.maxSellers === 0
          ? 'Unlimited Users'
          : `${sub.maxSellers} Users`
        : 'N/A';

    let duration = '1 Month';
    if (sub.startDate && sub.endDate) {
      const days = Math.round(
        (new Date(sub.endDate) - new Date(sub.startDate)) / 86400000
      );
      if (days >= 350) duration = '12 Months';
      else if (days >= 80) duration = `${Math.round(days / 30)} Months`;
      else if (days >= 14) duration = `${days} Days`;
      else duration = `${days} Days (Trial)`;
    }

    /* manager info */
    const mgr         = tx.manager || {};
    const billName    = mgr.name   || managerName || 'Manager';
    const billMobile  = mgr.mobile ? `+91 ${mgr.mobile}` : '';
    const billEmail   = mgr.email  || '';
    const payMethod   = tx.provider === 'razorpay' ? 'UPI / Razorpay' : tx.provider || 'Online';
    const txnId       = tx.razorpayPaymentId || tx.transactionId || 'N/A';
    const txnDisplay  = txnId.length > 22 ? txnId.slice(0, 22) + '...' : txnId;

    /* brand colours (RGB arrays) */
    const BLUE  = [26, 86, 219];
    const DBLUE = [30, 58, 138];
    const GREEN = [5, 122, 85];
    const GRAY  = [107, 114, 128];
    const LGRAY = [243, 244, 246];
    const DARK  = [17, 24, 39];
    const WHITE = [255, 255, 255];
    const MGRAY = [55, 65, 81];

    let y = 0;

    /* ── HEADER: Logo block + company contact ── */
    // Blue rounded rect for "K"
    doc.setFillColor(...BLUE);
    doc.roundedRect(L, 28, 52, 52, 8, 8, 'F');
    doc.setFontSize(30);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...WHITE);
    doc.text('K', L + 13, 28 + 38);

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DBLUE);
    doc.text('KRAVI', L + 62, 28 + 23);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.text('Sales Person Tracker', L + 62, 28 + 38);

    // Contact — right side
    const cX = R - 175;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text('Kravi Infotech', cX, 36);
    
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Ahilyanagar, Maharashtra, India', cX, 48);
    doc.text('contact@kraviinfotech.com', cX, 60);
    doc.text('+91 9657013534', cX, 72);
    doc.text('GSTIN: 27BMXPT8116L1ZZ', cX, 84);

    // Divider
    y = 95;
    doc.setDrawColor(...BLUE);
    doc.setLineWidth(1.2);
    doc.line(L, y, R, y);
    y += 18;

    /* ── INVOICE TITLE + META BOX ── */
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text('SUBSCRIPTION INVOICE', L, y + 16);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.text('Thank you for choosing KRAVI Sales Person Tracker.', L, y + 32);

    // Meta box
    const mbX = W - 222;
    const mbW = 182;
    const mbH = 78;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.8);
    doc.roundedRect(mbX, y - 4, mbW, mbH, 5, 5, 'FD');

    const metaRows = [
      ['Invoice No.',     invoiceNo],
      ['Invoice Date',    invoiceDate],
      ['Due Date',        invoiceDate],
    ];
    let mY = y + 12;
    const mLX = mbX + 10;
    const mVX = mbX + 88;
    metaRows.forEach(([lbl, val]) => {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...DARK);
      doc.text(lbl, mLX, mY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...MGRAY);
      doc.text(':  ' + val, mVX, mY);
      mY += 14;
    });

    // Payment status label + badge
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text('Payment Status', mLX, mY);

    const bX = mVX + 6;
    const bY = mY - 9;
    const isPaid = paymentStatus === 'PAID';
    doc.setFillColor(...(isPaid ? [220, 252, 231] : [254, 243, 199]));
    doc.setDrawColor(...(isPaid ? GREEN : [217, 119, 6]));
    doc.setLineWidth(0.5);
    doc.roundedRect(bX, bY, 34, 13, 3, 3, 'FD');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...(isPaid ? GREEN : [217, 119, 6]));
    doc.text(paymentStatus, bX + 5, bY + 9);

    y += mbH + 12;

    /* ── BILLED TO + SUBSCRIPTION DETAILS (2 cols) ── */
    const colW  = (W - L * 2 - 10) / 2;
    const col1X = L;
    const col2X = L + colW + 10;
    const secH  = 140; // Increased to spread out content

    /* Billed To */
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.8);
    doc.roundedRect(col1X, y, colW, secH, 5, 5, 'FD');

    // blue icon
    doc.setFillColor(...BLUE);
    doc.roundedRect(col1X + 10, y + 14, 20, 20, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...WHITE);
    doc.text('B', col1X + 17, y + 28);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BLUE);
    doc.text('BILLED TO', col1X + 36, y + 28);

    let bY2 = y + 50;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text(billName, col1X + 12, bY2); bY2 += 18;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MGRAY);
    doc.text('KRAVI Sales Person Tracker', col1X + 12, bY2); bY2 += 16;

    if (billMobile) {
      doc.text(billMobile, col1X + 12, bY2); bY2 += 16;
    }
    if (billEmail) {
      doc.text(billEmail, col1X + 12, bY2);
    }

    /* Subscription Details */
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.8);
    doc.roundedRect(col2X, y, colW, secH, 5, 5, 'FD');

    doc.setFillColor(...BLUE);
    doc.roundedRect(col2X + 10, y + 14, 20, 20, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...WHITE);
    doc.text('S', col2X + 17, y + 28);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BLUE);
    doc.text('SUBSCRIPTION DETAILS', col2X + 36, y + 28);

    const subRows = [
      ['Plan Name',   planName],
      ['Duration',    duration],
      ['Start Date',  startDate],
      ['End Date',    endDate],
      ['Total Users', maxSellers],
    ];
    let sY = y + 50;
    subRows.forEach(([lbl, val]) => {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...GRAY);
      doc.text(lbl, col2X + 12, sY);
      doc.text(':', col2X + 74, sY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...DARK);
      doc.text(String(val), col2X + 82, sY);
      sY += 16;
    });

    y += secH + 20;

    /* ── LINE ITEMS TABLE ── */
    autoTable(doc, {
      startY: y,
      head: [['#', 'Description', 'Plan', 'Duration', 'Amount (INR)']],
      body: [[
        '1',
        'KRAVI Sales Person Tracker Subscription',
        planName,
        duration,
        'Rs. ' + fmtAmt(baseAmount),
      ]],
      theme: 'grid',
      styles:       { fontSize: 9, halign: 'center', cellPadding: 16 }, // Increased padding
      headStyles:   { fillColor: BLUE, textColor: WHITE, fontStyle: 'bold', fontSize: 9, cellPadding: 10 },
      columnStyles: {
        0: { cellWidth: 26 },
        1: { halign: 'left', cellWidth: 200 },
        2: { cellWidth: 76 },
        3: { cellWidth: 70 },
        4: { halign: 'right', fontStyle: 'bold' },
      },
      margin: { left: L, right: L },
    });

    y = (doc.lastAutoTable?.finalY || y + 50) + 20;

    /* ── PAYMENT INFO (left) + TOTALS (right) ── */
    const pColW  = (W - L * 2 - 10) / 2;
    const pCol1X = L;
    const pCol2X = L + pColW + 10;
    const pSecH  = 150; // Increased to fill space

    // Payment Info box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.8);
    doc.roundedRect(pCol1X, y, pColW, pSecH, 5, 5, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BLUE);
    doc.text('PAYMENT INFORMATION', pCol1X + 12, y + 22);

    const piRows = [
      ['Payment Method', payMethod],
      ['Transaction ID', txnDisplay],
      ['Payment Date',   invoiceDate],
    ];
    let piY = y + 44;
    piRows.forEach(([lbl, val]) => {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...GRAY);
      doc.text(lbl, pCol1X + 12, piY);
      doc.text(':', pCol1X + 80, piY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...DARK);
      doc.text(String(val), pCol1X + 88, piY);
      piY += 18;
    });

    // Thank you banner
    doc.setFillColor(220, 252, 231);
    doc.setDrawColor(...GREEN);
    doc.setLineWidth(0.5);
    doc.roundedRect(pCol1X + 10, piY + 12, pColW - 20, 28, 4, 4, 'FD');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GREEN);
    doc.text('Thank you! Your payment has been received.', pCol1X + 20, piY + 30);

    // Totals Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.8);
    doc.roundedRect(pCol2X, y, pColW, pSecH, 5, 5, 'FD');

    const tLX = pCol2X + 12;
    const tVX = R - 12;
    let tY = y + 24;

    // Subtotal (Bold)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text('Subtotal', tLX, tY);
    doc.text('Rs. ' + fmtAmt(baseAmount), tVX, tY, { align: 'right' });
    tY += 20;

    // Discount (Normal/Gray)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.text('Discount', tLX, tY);
    doc.text('Rs. 0.00', tVX, tY, { align: 'right' });
    tY += 20;

    // GST (18%) (Bold)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text('GST (18%)', tLX, tY);
    doc.text('Rs. ' + fmtAmt(gstAmount), tVX, tY, { align: 'right' });
    tY += 20;

    // Divider
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.6);
    doc.line(pCol2X + 10, tY - 8, R - 10, tY - 8);

    // Total Amount (Bigger, Bold, Blue)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BLUE);
    doc.text('Total Amount', tLX, tY + 4);
    doc.text('Rs. ' + fmtAmt(totalAmount), tVX, tY + 4, { align: 'right' });
    tY += 24;

    // Amount Paid (Bold, Green)
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GREEN);
    doc.text('Amount Paid', tLX, tY + 4);
    doc.text('Rs. ' + fmtAmt(amountPaid), tVX, tY + 4, { align: 'right' });

    y += pSecH + 26;

    /* ── TERMS & CONDITIONS ── */
    const footerContentY = y + 10;

    const tcX = L;
    const tcW = R - L;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.6);
    doc.roundedRect(tcX, footerContentY, tcW, 100, 4, 4, 'FD');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DBLUE);
    doc.text('Terms & Conditions:', tcX + 12, footerContentY + 20);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MGRAY);
    const terms = [
      '• Subscription fees are non-refundable and non-transferable after activation.',
      '• Services are available only during the active subscription period.',
      '• Non-payment or delayed payment may result in immediate account suspension.'
    ];
    let nY = footerContentY + 36;
    terms.forEach((t) => { doc.text(t, tcX + 12, nY); nY += 14; });

    /* ── FOOTER ── */
    const ftY = H - 36;
    doc.setDrawColor(...BLUE);
    doc.setLineWidth(1);
    doc.line(L, ftY, R, ftY);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BLUE);
    doc.text(
      'Thank you for choosing KRAVI Sales Person Tracker!',
      W / 2, ftY + 16,
      { align: 'center' }
    );

    doc.save(`${invoiceNo}_KRAVI_Invoice.pdf`);
  } catch (err) {
    console.error('Invoice PDF error:', err);
    window.alert('Invoice download failed: ' + (err.message || 'Unknown error'));
  }
};

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
const SubscriptionBilling = () => {
  const [status,    setStatus]    = useState(null);
  const [history,   setHistory]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [showPlans, setShowPlans] = useState(false);

  const fetchBillingData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statusRes, historyRes] = await Promise.all([
        API.get('/subscriptions/my-status'),
        API.get('/subscriptions/history'),
      ]);
      setStatus(statusRes.data);
      setHistory(historyRes.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Billing details load nahi ho paayi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBillingData(); }, []);

  if (loading && !status) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-2">
        <Loader2 className="animate-spin text-violet-600" size={32} />
        <p className="text-sm font-semibold text-slate-500">Billing details loading...</p>
      </div>
    );
  }

  const managerName = status?.name || status?.companyName || 'Manager';

  return (
    <div className="w-full space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-violet-50 p-2 text-violet-700">
            <CreditCard size={22} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">Subscription Portal</p>
            <h1 className="text-2xl font-black text-slate-950">Subscription &amp; Billing</h1>
          </div>
        </div>
        <button
          onClick={fetchBillingData}
          disabled={loading}
          type='button'
          className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Active Plan + Upgrade */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Current active plan</p>
              <h2 className="text-2xl font-black text-slate-950 mt-1">
                {status?.plan?.name || 'Free Trial'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {status?.plan?.description || 'Basic team management plan.'}
              </p>
            </div>
            {getStatusBadge(status?.canUseApp ? 'active' : 'expired')}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2.5 text-blue-700 shrink-0">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Expiration Date</p>
                <p className="text-sm font-black text-slate-900 mt-0.5">
                  {status?.endDate ? safeDate(status.endDate) : 'No Expiry'}
                </p>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  {(status?.daysRemaining ?? 0) > 0
                    ? `${status.daysRemaining} days remaining`
                    : 'Expired'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-700 shrink-0">
                <Users size={18} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 mt-0.5">
                  {status?.activeSellers || 0} /{' '}
                  {status?.maxSellers === 0 ? 'Unlimited' : status?.maxSellers || 1} Sellers
                </p>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">Active team size</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50/70 to-fuchsia-50/50 p-6 flex flex-col justify-between shadow-xs">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-violet-100 text-violet-800 rounded-full px-2.5 py-1 text-[10px] font-black uppercase">
              <ShieldCheck size={12} />
              Verified Account
            </div>
            <h3 className="text-lg font-black text-slate-950 mt-1">Upgrade or Renew?</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Unlock more sellers, real-time scanner access, and advanced analytics.
            </p>
          </div>
          <button
            onClick={() => setShowPlans(true)}
              type="button"
            className="w-full mt-6 h-10 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-xs flex items-center justify-center gap-1 hover:from-violet-700 hover:to-fuchsia-700 transition-all shadow-sm"
          >
            View Plans &amp; Upgrade
            <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Payment History Table */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-black text-slate-900">Payment History &amp; Invoices</h3>
          <p className="text-xs text-slate-500 mt-1 font-semibold">
            View and download professional invoices for all subscription payments.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Invoice No.</th>
                <th className="px-6 py-3.5">Plan Name</th>
                <th className="px-6 py-3.5">Payment Date</th>
                <th className="px-6 py-3.5">Transaction ID</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-semibold bg-white">
                    Abhi koi transaction history saved nahi hai.
                  </td>
                </tr>
              ) : (
                history.map((tx) => {
                  const isPaid =
                    tx.status?.toLowerCase() === 'success' ||
                    tx.status?.toLowerCase() === 'paid';
                  return (
                    <tr key={tx._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-blue-700">
                        {tx.invoice}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {tx.planName || 'Subscription'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-600">
                        {safeDate(tx.createdAt, true)}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-500 font-mono text-xs">
                        {tx.razorpayPaymentId || tx.transactionId || '—'}
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900">
                        Rs.&nbsp;{safeAmount(tx.amount)}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(tx.status)}</td>
                      <td className="px-6 py-4 text-right">
                        {isPaid ? (
                          <button
                            onClick={() => generateInvoicePDF(tx, managerName)}
                              type="button"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-blue-800 transition-colors shadow-sm"
                          >
                            <Download size={13} />
                            Download PDF
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs font-semibold">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Subscription Plans Modal */}
      {showPlans && (
        <SubscriptionModal open={showPlans} onClose={() => setShowPlans(false)} />
      )}
    </div>
  );
};

export default SubscriptionBilling;
