import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText, Download, BarChart3, PieChart, TrendingUp, Layers } from 'lucide-react';
import { applyPdfHeaderAndFooter } from '../../utils/pdfHelper';
import { useAuth } from '../../context/AuthContext';

const Reports = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('Revenue Report');
  const [summary, setSummary] = useState({
    totalSellers: 0,
    totalRecords: 0,
    monthlyTotal: 0,
    yearlyTotal: 0,
    totalPending: 0
  });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportName, setReportName] = useState('Revenue Report');
  const [infoMessage, setInfoMessage] = useState('');

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const response = await axios.get('/reports/summary');
        setSummary(response.data);
      } catch (err) {
        console.error('Failed to load report summary:', err);
      }
    };

    loadSummary();
  }, []);

  const formatCsvValue = (value) => {
    if (value === undefined || value === null) return '';
    return String(value).replace(/"/g, '""');
  };

  const buildCsvContent = (recordsToExport) => {
    const headers = [
      'Date',
      'Seller',
      'Shop Name',
      'Shop Mobile',
      'Shop Type',
      'Address',
      'Landmark',
      'Total Amount',
      'Paid Amount',
      'Pending Amount',
      'Payment Status',
      'Items Count',
      'Items'
    ];

    const rows = recordsToExport.map((r) => {
      const itemsFormatted = (r.items || []).map((item) => {
        if (item.unit === 'weight') {
          return `${item.productName} (${item.weight} kg @ ?${item.price})`;
        }
        const rate = item.price || item.rate || 0;
        return `${item.productName} (${item.quantity} pcs @ ?${rate})`;
      }).join('; ');

      return [
        formatCsvValue(new Date(r.visitDatetime).toISOString()),
        formatCsvValue(r.sellerId?.name || 'Unknown'),
        `"${formatCsvValue(r.shopName)}"`,
        `"${formatCsvValue(r.sellerId?.mobile || '')}"`,
        formatCsvValue(r.shopType),
        `"${formatCsvValue(r.shopAddress)}"`,
        `"${formatCsvValue(r.landmark)}"`,
        formatCsvValue(r.totalAmount),
        formatCsvValue(r.paidAmount || 0),
        formatCsvValue(r.pendingAmount || 0),
        formatCsvValue(r.paymentStatus || 'Pending'),
        formatCsvValue((r.items || []).length),
        `"${formatCsvValue(itemsFormatted)}"`
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  };

  const exportCsvFile = (filename, recordsToExport) => {
    const csvContent = buildCsvContent(recordsToExport);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    if (records.length === 0) {
      setInfoMessage('Generate a report first before exporting CSV.');
      return;
    }

    exportCsvFile(`admin_report_${reportName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`, records);
  };

  const handleExportPDF = async () => {
    if (records.length === 0) {
      setInfoMessage('Generate a report first before exporting PDF.');
      return;
    }

    const doc = new jsPDF('landscape');

    const tableColumn = ['Date', 'Seller', 'Shop Name', 'Shop Type', 'Total', 'Paid', 'Pending', 'Status'];
    const tableRows = records.map((r) => [
      new Date(r.visitDatetime).toLocaleDateString('en-IN'),
      r.sellerId?.name || 'Unknown',
      r.shopName,
      r.shopType,
      `?${r.totalAmount}`,
      `?${r.paidAmount || 0}`,
      `?${r.pendingAmount || 0}`,
      r.paymentStatus || 'Pending'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [108, 62, 244] },
      styles: { fontSize: 9 }
    });

    await applyPdfHeaderAndFooter(doc, reportName, user);

    doc.save(`${reportName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handleGenerate = async (label) => {
    setLoading(true);
    setReportName(label);
    setActiveFilter(label);
    setInfoMessage('');

    try {
      const [summaryResponse, recordsResponse] = await Promise.all([
        axios.get('/reports/summary'),
        axios.get('/reports/records')
      ]);

      setSummary(summaryResponse.data);
      setRecords(Array.isArray(recordsResponse.data) ? recordsResponse.data : []);
      setInfoMessage(`Loaded ${Array.isArray(recordsResponse.data) ? recordsResponse.data.length : 0} records for ${label}`);
    } catch (err) {
      console.error('Failed to generate report:', err);
      setInfoMessage(err.response?.data?.message || 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  const renderCardValue = (title) => {
    switch (title) {
      case 'Revenue Report':
        return `?${Number(summary.yearlyTotal || 0).toLocaleString('en-IN')}`;
      case 'Subscription Report':
        return `${summary.totalSellers || 0} Sellers`;
      case 'Company Report':
        return `${summary.totalRecords || 0} Records`;
      case 'Manager Report':
        return `${summary.totalSellers || 0} Managers`;
      case 'Renewal Report':
        return `${summary.totalPending || 0} Pending`;
      default:
        return 'N/A';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-500 mt-2 max-w-2xl">Generate and download revenue, subscription, company, manager, and renewal reports for your business.</p>
            {infoMessage && (
              <p className="mt-3 text-sm text-slate-600">{infoMessage}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="rounded-3xl bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700">
              {loading ? 'Loading report...' : records.length > 0
                ? `${records.length} records loaded for ${reportName}`
                : 'Generate a report to view records and exports'}
            </div>
            <button onClick={handleExportCSV} className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-3 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">
              <Download size={16} /> CSV
            </button>
            <button onClick={handleExportPDF} className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-3 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">
              <Download size={16} /> PDF
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {[
          {
            title: 'Revenue Report',
            label: 'Total income and earnings',
            icon: <TrendingUp size={20} className="text-white" />,
            bg: 'bg-[#6C3EF4]'
          },
          {
            title: 'Subscription Report',
            label: 'Subscription plan analytics',
            icon: <BarChart3 size={20} className="text-white" />,
            bg: 'bg-[#10B981]'
          },
          {
            title: 'Company Report',
            label: 'Company-wise report',
            icon: <FileText size={20} className="text-white" />,
            bg: 'bg-[#8B5CF6]'
          },
          {
            title: 'Manager Report',
            label: 'Manager performance report',
            icon: <PieChart size={20} className="text-white" />,
            bg: 'bg-[#F59E0B]'
          },
          {
            title: 'Renewal Report',
            label: 'Upcoming renewals report',
            icon: <Layers size={20} className="text-white" />,
            bg: 'bg-[#EF4444]'
          },
        ].map((card) => (
          <div key={card.title} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className={`inline-flex p-3 rounded-3xl ${card.bg}`}>
                {card.icon}
              </div>
              <p className="text-sm font-medium text-gray-500 mt-5">{card.title}</p>
              <h3 className="mt-3 text-2xl font-bold text-gray-900">{renderCardValue(card.title)}</h3>
              <p className="text-sm text-gray-500 mt-2">{card.label}</p>
            </div>
            <button onClick={() => handleGenerate(card.title)} className="mt-6 w-full rounded-2xl bg-[#6C3EF4] px-4 py-3 text-sm font-semibold text-white hover:bg-[#5a32cc] transition-all">
              Generate Report
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Report Records</h3>
            <p className="text-sm text-gray-500 mt-1">{records.length} records found</p>
          </div>
          <div className="text-sm text-gray-500">Current report: {activeFilter}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-medium">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Seller</th>
                <th className="px-6 py-3">Shop Name</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Paid</th>
                <th className="px-6 py-3">Pending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">No report records loaded yet. Select a report type above and click Generate.</td>
                </tr>
              ) : records.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">{new Date(record.visitDatetime).toLocaleDateString('en-IN')}</td>
                  <td className="px-6 py-4">{record.sellerId?.name || 'Unknown'}</td>
                  <td className="px-6 py-4">{record.shopName}</td>
                  <td className="px-6 py-4">{record.shopType}</td>
                  <td className="px-6 py-4">?{record.totalAmount || 0}</td>
                  <td className="px-6 py-4">?{record.paidAmount || 0}</td>
                  <td className="px-6 py-4">?{record.pendingAmount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
