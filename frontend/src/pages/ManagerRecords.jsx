import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import API from '../api/axios';
import ReportFilter from '../components/ReportFilter';
import SalesTable from '../components/SalesTable';
import { Loader2, Plus, FileSpreadsheet, FileText, Printer, Download, Search, ClipboardList, CheckCircle2, XCircle, Calendar, DollarSign } from 'lucide-react';

const ManagerRecords = () => {
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
      setRecords(response.data);
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
    const inactive = records.filter(r => r.paymentStatus === 'Pending').length;
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
    const headers = ['Date', 'Seller', 'Shop Name', 'Shop Type', 'Address', 'Landmark', 'Total Amount', 'Paid Amount', 'Pending Amount', 'Payment Status', 'Items Count', 'Items (Product x Qty @ Rate)'];
    const rows = records.map(r => {
      const itemsFormatted = r.items?.map(item => `${item.productName} (${item.quantity} x ₹${item.rate})`).join('; ') || '';
      return [
        new Date(r.visitDatetime).toISOString(),
        r.sellerId?.name || 'Unknown',
        `"${r.shopName.replace(/"/g, '""')}"`,
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
    doc.setFontSize(18);
    doc.text('Sales Records Report', 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 14, 22);

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
      startY: 28,
      theme: 'grid',
      headStyles: { fillColor: [29, 78, 216] }, // Blue-700
      styles: { fontSize: 9 }
    });

    doc.save(`Sales_Records_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddNew = () => {
    // Placeholder – navigate to a future add-record page
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
