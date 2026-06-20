import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import API from '../../api/axios';
import ReportFilter from '../../components/ReportFilter';
import SalesTable from '../../components/SalesTable';
import { Loader2, Plus, FileSpreadsheet, FileText, Printer, Download, Search, ClipboardList, CheckCircle2, XCircle, Calendar, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ManagerRecords = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [records, setRecords] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Initialize filters from URL search params
  const filters = {
    sellerId: searchParams.get('sellerId') || '',
    sellerName: searchParams.get('sellerName') || '',
    shopName: searchParams.get('shopName') || '',
    shopType: searchParams.get('shopType') || '',
    status: searchParams.get('status') || '',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || ''
  };

  const [summary, setSummary] = useState({ total: 0, active: 0, inactive: 0, newThisMonth: 0, totalPending: 0 });

  // Load sellers for filter dropdown
  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const response = await API.get('/sellers');
        setSellers(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSellers();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/reports/records?${searchParams.toString()}`);
      setRecords(Array.isArray(response.data) ? response.data : []);
      setErrorMsg('');
    } catch (err) {
      console.error("Error fetching records:", err);
      if (err.response?.status === 403) {
        setErrorMsg('Access Denied: You are not authorized to view these records. Please login as a Manager.');
      } else {
        setErrorMsg(err.response?.data?.message || err.message || 'Failed to load records');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [searchParams]);

  useEffect(() => {
    const total = records.length;
    const active = records.filter(r => r.paymentStatus === 'Paid').length;
    const inactive = records.filter(r => r.paymentStatus !== 'Paid').length;
    const newThisMonth = records.filter(r => {
      const date = new Date(r.visitDatetime);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
    const totalPending = records.reduce((sum, r) => sum + Number(r.pendingAmount || 0), 0);
    setSummary({ total, active, inactive, newThisMonth, totalPending });
  }, [records]);

  const handleFilterChange = (newFilters) => {
    const params = {};
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key]) params[key] = newFilters[key];
    });
    setSearchParams(params);
  };

  const handleDownloadCSV = () => {
    if (records.length === 0) {
      alert('No data to export.');
      return;
    }
    const headers = ['Date', 'Seller', 'Shop Name', 'Shop Mobile', 'Shop Type', 'Address', 'Landmark', 'Total Amount', 'Paid Amount', 'Pending Amount', 'Payment Status', 'Items Count', 'Items (Product x Qty @ Rate)'];
    const rows = records.map(r => {
      const itemsFormatted = r.items?.map(item => {
        if (item.unit === 'weight') {
          return `${item.productName} (${item.weight} kg @ ₹${item.price})`;
        } else {
          const rate = item.price || item.rate;
          return `${item.productName} (${item.quantity} pcs @ ₹${rate})`;
        }
      }).join('; ') || '';
      return [
        new Date(r.visitDatetime).toISOString(),
        r.sellerId?.name || 'Unknown',
        `"${r.shopName.replace(/"/g, '""')}"`,
        `"${(r.mobile || '').replace(/"/g, '""')}"`,
        r.shopType,
        `"${r.shopAddress.replace(/"/g, '""')}"`,
        `"${(r.landmark || '').replace(/"/g, '""')}"`,
        r.totalAmount,
        r.paidAmount || 0,
        r.pendingAmount || 0,
        r.paymentStatus || 'Pending',
        r.items?.length || 0,
        `"${itemsFormatted.replace(/"/g, '""')}"`
      ];
    });
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `manager_records_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stub for Excel export – currently reuses CSV logic with .xlsx extension
  const handleExportExcel = () => {
    alert('Excel export is not yet implemented. CSV will be exported instead.');
    handleDownloadCSV();
  };

  const handleExportPDF = () => {
    if (records.length === 0) {
      alert('No data to export.');
      return;
    }

    const doc = new jsPDF('landscape');
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const L = 14;
    const R = W - 14;

    const BLUE = [26, 86, 219];
    const DBLUE = [30, 58, 138];
    const GRAY = [107, 114, 128];
    const DARK = [17, 24, 39];
    const WHITE = [255, 255, 255];

    // ── HEADER: Logo block + Manager contact ──
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
    doc.text('Sales Records Report', W / 2, 12 + 16, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    const dateStr = format(new Date(), 'dd/MM/yyyy, hh:mm a');
    doc.text(`Generated on: ${dateStr}`, W / 2, 12 + 26, { align: 'center' });

    // Contact Right (Kravi Infotech Address)
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

    const tableColumn = ["Date", "Seller", "Shop Name", "Shop Type", "Total Amount", "Paid", "Pending", "Status"];
    const tableRows = records.map(r => [
      format(new Date(r.visitDatetime), 'dd/MM/yyyy HH:mm'),
      r.sellerId?.name || 'Unknown',
      r.shopName,
      r.shopType,
      `Rs. ${r.totalAmount}`,
      `Rs. ${r.paidAmount || 0}`,
      `Rs. ${r.pendingAmount || 0}`,
      r.paymentStatus || 'Pending'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: y,
      theme: 'grid',
      headStyles: { fillColor: DBLUE, textColor: WHITE, fontSize: 8, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { cellPadding: 4, halign: 'center', lineColor: [220, 225, 235] },
      margin: { left: L, right: L, bottom: 30 },
      didDrawPage: function (data) {
        // Footer on each page
        const footerY = H - 15;
        doc.setDrawColor(...BLUE);
        doc.setLineWidth(1.2);
        doc.line(L, footerY - 10, R, footerY - 10);

        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...BLUE);
        doc.text(`Generated By : ${user?.name || 'Manager'}`, L, footerY);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...DARK);
        doc.text('This is a system generated report.', W / 2, footerY, { align: 'center' });

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...BLUE);
        // We will put a placeholder for total pages
        doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber} of {total_pages_count_string}`, R, footerY, { align: 'right' });
      }
    });

    const totalPagesExp = '{total_pages_count_string}';
    if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPagesExp);
    }
    
    doc.save(`Sales_Records_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddNew = () => {
    navigate('/manager/records/new');
  };

  const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  return (
    <div className="space-y-8 bg-slate-50/50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">Sales Records</h1>
          <p className="text-sm font-medium text-slate-500">Manage and track all shop visits and sales</p>
        </div>
        <button 
          onClick={handleAddNew} 
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95"
        >
          <Plus size={18} />
          <span>Add New Record</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Records', value: summary.total, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Fully Paid', value: summary.active, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Unpaid/Pending', value: summary.inactive, icon: XCircle, color: 'text-slate-600', bg: 'bg-slate-100' },
          { label: 'Total Pending', value: currencyFormatter.format(summary.totalPending), icon: DollarSign, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'New This Month', value: summary.newThisMonth, icon: Calendar, color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 transition-hover hover:shadow-md">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{loading ? '...' : stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar: Search, Filters & Exports */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by Shop Name..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              value={filters.shopName}
              onChange={(e) => handleFilterChange({ ...filters, shopName: e.target.value })}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={handleExportExcel} 
              className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              <FileSpreadsheet size={14} className="text-emerald-600" />
              Excel
            </button>
            <button 
              onClick={handleExportPDF} 
              className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              <FileText size={14} className="text-red-600" />
              PDF
            </button>
            <button 
              onClick={handlePrint} 
              className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              <Printer size={14} className="text-slate-600" />
              Print
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
            <button 
              onClick={handleDownloadCSV} 
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
            >
              <Download size={14} />
              CSV
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <ReportFilter onFilter={handleFilterChange} sellers={sellers} filters={filters} />
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium" role="alert">
          <XCircle size={18} />
          <span className="block sm:inline">{errorMsg}</span>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center py-12 bg-white rounded-lg border border-gray-100">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : (
        <SalesTable records={records} />
      )}
    </div>
  );
};

export default ManagerRecords;
